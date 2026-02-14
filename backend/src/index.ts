import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import {
  initAgents,
  getAgents,
  getDebates,
  getMetrics,
  getConvertibleAgents,
  getConvertedRatio,
  addDebate,
  promoteStage,
  getStageLevel,
  Agent,
  DebateRecord,
} from "./agents";
import { pickStrategy, shouldConvert } from "./persuasion";
import { generateDebate } from "./llm";
import { initChain, mintPBT, recordConversion, getAgentAddress } from "./chain";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// 初始化链连接
const chainReady = initChain();

// ==================== API ====================

// POST /api/start — 初始化
app.post("/api/start", (_req, res) => {
  const agents = initAgents();
  const metrics = getMetrics();
  res.json({ agents, metrics });
});

// POST /api/round — 执行一回合
app.post("/api/round", async (_req, res) => {
  try {
    const agents = getAgents();
    if (agents.length === 0) {
      initAgents();
    }

    // 1. 选目标：从可转化 Agent 中随机选一个
    const targets = getConvertibleAgents();
    if (targets.length === 0) {
      return res.json({
        message: "所有 Agent 都已转化或无法继续转化",
        agents: getAgents(),
        metrics: getMetrics(),
        debate: null,
      });
    }
    const target = targets[Math.floor(Math.random() * targets.length)];
    const prophet = agents.find((a) => a.id === "prophet")!;
    const convertedRatio = getConvertedRatio();

    // 2. 选策略
    const strategy = pickStrategy(target, convertedRatio);

    // 3. 调 LLM 生成对话
    const dialogues = await generateDebate(
      prophet,
      target,
      strategy,
      convertedRatio
    );

    // 4. 判定是否转化
    const converted = shouldConvert(target, strategy, convertedRatio);

    // 5. 记录推广次数
    const stanceBefore = target.beliefStance;
    target.promotionCount += 1;

    let investAction: DebateRecord["investAction"] = null;

    // 6. 若转化
    if (converted) {
      promoteStage(target);
      target.beliefStance = Math.min(1.0, target.beliefStance + 0.2);

      if (target.stage === "S3" || target.stage === "S4") {
        target.faction = "pre-bull";
      }

      const stageLevel = getStageLevel(target.stage);
      const investAmount = 1000 * stageLevel;

      if (investAmount > 0) {
        target.investedAmount += investAmount;
        target.pbtBalance += investAmount;

        // 链上操作
        try {
          const agentAddr = getAgentAddress(target.id);
          const mintTxHash = await mintPBT(agentAddr, investAmount);
          const eventTxHash = await recordConversion(target.id);
          investAction = { amount: investAmount, mintTxHash, eventTxHash };
        } catch (err) {
          console.error("Chain tx failed, using mock:", err);
          investAction = {
            amount: investAmount,
            mintTxHash: "0x_chain_error",
            eventTxHash: "0x_chain_error",
          };
        }
      }
    } else {
      // 即使未转化，立场也微调
      target.beliefStance = Math.min(
        1.0,
        target.beliefStance + 0.05
      );
    }

    // 7. 记录辩论
    const debate: DebateRecord = {
      round: getDebates().length + 1,
      prophetId: prophet.id,
      targetId: target.id,
      strategy,
      dialogues,
      converted,
      stanceChange: { before: stanceBefore, after: target.beliefStance },
      investAction,
    };
    addDebate(debate);

    // 8. 返回
    res.json({
      debate,
      agents: getAgents(),
      metrics: getMetrics(),
    });
  } catch (error) {
    console.error("Round error:", error);
    res.status(500).json({ error: "回合执行失败" });
  }
});

// GET /api/status — 获取全部状态
app.get("/api/status", (_req, res) => {
  res.json({
    agents: getAgents(),
    debates: getDebates(),
    metrics: getMetrics(),
  });
});

// GET /api/debates — 获取辩论记录
app.get("/api/debates", (_req, res) => {
  res.json(getDebates());
});

// ==================== 启动 ====================

app.listen(PORT, () => {
  console.log(`\n🕍 牛市预演教 Backend running on http://localhost:${PORT}`);
  console.log(`   Chain mode: ${chainReady ? "✅ LIVE" : "⚠️  MOCK"}`);
  console.log(`   LLM model: ${process.env.LLM_MODEL || "gpt-4o-mini"}\n`);

  // 自动初始化 Agent
  initAgents();
  console.log("   Agents initialized: 6 agents ready\n");
});
