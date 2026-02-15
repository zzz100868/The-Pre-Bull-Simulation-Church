import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import {
  initAgents, getAgents, getDebates, getMetrics, getConvertibleAgents,
  getConvertedRatio, addDebate, promoteStage, demoteStage, getStageLevel,
  updateSpiritValues, recordNarrativeBias, grantTaskReward,
  getMissionaryAgents, getLeaderboard, getExperimentConclusion,
  getNews, addNews, getScriptures, addScripture,
  getAlliances, createAlliance, splitAlliance, getNarrativeBiasHistory,
  Agent, DebateRecord,
} from "./agents";
import {
  pickStrategy, pickSecondaryStrategy, getConversionBaseScore,
  shouldApostatize, shouldFormAlliance, shouldSplit,
} from "./persuasion";
import { generateDebate, generateFutureNews, generateScripture, generateFactionDebate } from "./llm";
import { initChain, mintPBT, recordConversion, getAgentAddress } from "./chain";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const chainReady = initChain();

function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

// ==================== API ====================

// POST /api/start — 初始化
app.post("/api/start", (_req, res) => {
  const agents = initAgents();
  const metrics = getMetrics();
  res.json({ agents, metrics, news: [], scriptures: [], alliances: [], conclusion: getExperimentConclusion() });
});

// POST /api/round — 执行一回合（增强版: 5步协议+传教士+叛教+联盟+新闻+经文）
app.post("/api/round", async (_req, res) => {
  try {
    const agents = getAgents();
    if (agents.length === 0) initAgents();

    const convertedRatio = getConvertedRatio();
    const roundNum = getDebates().length + 1;
    const events: string[] = [];

    // ====== 1. 选目标和说服者 ======
    const targets = getConvertibleAgents();
    if (targets.length === 0) {
      return res.json({
        message: "所有 Agent 都已转化或无法继续转化",
        agents: getAgents(), metrics: getMetrics(), debate: null,
        news: getNews(), scriptures: getScriptures(),
        alliances: getAlliances(), conclusion: getExperimentConclusion(),
      });
    }
    const target = targets[Math.floor(Math.random() * targets.length)];

    // #17 传教士行为 — 已转化Agent可以当说服者
    let persuader: Agent;
    let isMissionary = false;
    const missionaries = getMissionaryAgents();
    if (missionaries.length > 0 && Math.random() < 0.6) {
      persuader = missionaries[Math.floor(Math.random() * missionaries.length)];
      persuader.missionaryCount += 1;
      isMissionary = true;
      grantTaskReward(persuader, "debate_participation");
    } else {
      persuader = agents.find((a) => a.id === "prophet")!;
    }

    // ====== 2. 选策略 (#7 多策略组合) ======
    const strategy = pickStrategy(target, convertedRatio);
    const secondaryStrategy = pickSecondaryStrategy(strategy, target);

    // ====== 3. 调 LLM (#14 5步协议 + #8 历史案例 + #11 反驳模板) ======
    const debateResult = await generateDebate(
      persuader, target, strategy, convertedRatio, secondaryStrategy
    );

    // ====== 4. 判定转化（基础概率 + 辩论质量融合） ======
    const baseScore = getConversionBaseScore(
      target,
      strategy,
      convertedRatio,
      secondaryStrategy,
      persuader
    );
    const debateScore = debateResult.debateScore ?? 0.5;
    const finalScore = clamp01(baseScore * 0.65 + debateScore * 0.35);
    const converted = Math.random() < finalScore;

    // ====== 5. 记录推广 + 任务奖励 (#5) ======
    const stanceBefore = target.beliefStance;
    target.promotionCount += 1;
    grantTaskReward(target, "debate_participation");

    let investAction: DebateRecord["investAction"] = null;
    let apostasized = false;

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
        try {
          const agentAddr = getAgentAddress(target.id);
          const mintTxHash = await mintPBT(agentAddr, investAmount);
          const eventTxHash = await recordConversion(target.id);
          investAction = { amount: investAmount, mintTxHash, eventTxHash };
        } catch (err) {
          console.error("Chain tx failed, using mock:", err);
          investAction = { amount: investAmount, mintTxHash: "0x_chain_error", eventTxHash: "0x_chain_error" };
        }
      }
      events.push(`${target.name}被转化至${target.stage}`);
      // #5 见证转化奖励
      agents.filter((a) => a.faction === "pre-bull" && a.id !== target.id).forEach((a) => {
        grantTaskReward(a, "witness_conversion");
      });
      if (isMissionary) grantTaskReward(persuader, "missionary_success");
    } else {
      target.beliefStance = Math.min(1.0, target.beliefStance + 0.05);
    }

    // ====== 6. 叛教检测 (#2 #13) ======
    agents.forEach((a) => {
      if (a.id !== target.id && shouldApostatize(a, convertedRatio)) {
        const oldStage = a.stage;
        demoteStage(a);
        a.beliefStance = Math.max(-1.0, a.beliefStance - 0.15);
        apostasized = true;
        events.push(`${a.name}叛教：${oldStage}→${a.stage}`);
      }
    });
    // 坚守者奖励
    agents.forEach((a) => {
      if (a.stage >= "S1" && a.apostasyCount === 0 && a.id !== "prophet") {
        grantTaskReward(a, "apostasy_resistance");
      }
    });

    // ====== 7. 联盟检测 (#16) ======
    const allianceCheck = shouldFormAlliance(agents);
    let newAlliance = null;
    if (allianceCheck.should) {
      const faction = agents.find((a) => a.id === allianceCheck.members[0])?.faction || "neutral";
      const names = allianceCheck.members.map((id) => agents.find((a) => a.id === id)?.name || id);
      newAlliance = createAlliance(`${faction === "pre-bull" ? "牛市" : "真理"}联盟`, allianceCheck.members, faction, roundNum);
      events.push(`联盟成立：${newAlliance.name}(${names.join(",")})`);
      allianceCheck.members.forEach((id) => {
        const a = agents.find((ag) => ag.id === id);
        if (a) grantTaskReward(a, "alliance_formation");
      });
    }
    // 分裂检测
    let splitEvent = null;
    const currentAlliances = getAlliances();
    for (const alliance of currentAlliances) {
      const members = alliance.members.map((id) => agents.find((a) => a.id === id)).filter(Boolean) as Agent[];
      if (shouldSplit(members)) {
        const newAlliances = splitAlliance(alliance.id);
        splitEvent = { original: alliance.name, fragments: newAlliances.map((a) => a.name) };
        events.push(`联盟分裂：${alliance.name}`);
        break;
      }
    }

    // ====== 8. 更新精神市值和叙事偏差 (#1 #4) ======
    updateSpiritValues();
    recordNarrativeBias(roundNum);

    // ====== 9. 记录辩论 ======
    const debate: DebateRecord = {
      round: roundNum,
      prophetId: persuader.id,
      targetId: target.id,
      strategy,
      secondaryStrategy,
      dialogues: debateResult.dialogues,
      converted,
      apostasized,
      stanceChange: { before: stanceBefore, after: target.beliefStance },
      investAction,
      debatePhases: debateResult.phases,
      historicalCase: debateResult.historicalRef,
      counterArguments: debateResult.counterArgsUsed,
      factionDebate: false,
      isMissionary,
      baseScore,
      debateScore,
      finalScore,
      outputQuality: debateResult.outputQuality,
      decisionReason: debateResult.decisionReason,
    };
    addDebate(debate);

    // ====== 10. 生成新闻和经文 (#10 #18) — 每轮都生成 ======
    let newsItem = null;
    try {
      newsItem = await generateFutureNews(agents, roundNum, getConvertedRatio());
      addNews(newsItem);
    } catch (e) { console.error("News generation failed:", e); }

    let scripture = null;
    try {
      const event = events.length > 0 ? events.join("; ") : `第${roundNum}轮辩论进行中`;
      scripture = await generateScripture(agents, roundNum, event);
      addScripture(scripture);
    } catch (e) { console.error("Scripture generation failed:", e); }

    // ====== 11. #15 多教派辩论 (每5轮触发一次) ======
    let factionDebateRecord = null;
    if (roundNum % 5 === 0) {
      const factionAgents = agents.filter((a) => a.id !== "prophet" && a.stage !== "S0");
      if (factionAgents.length >= 2) {
        const a1 = factionAgents[0];
        const a2 = factionAgents[factionAgents.length - 1];
        if (a1.faction !== a2.faction || Math.abs(a1.beliefStance - a2.beliefStance) > 0.3) {
          try {
            const fDialogues = await generateFactionDebate(a1, a2, convertedRatio);
            factionDebateRecord = {
              round: roundNum, prophetId: a1.id, targetId: a2.id,
              strategy: "logical" as const, dialogues: fDialogues,
              converted: false, apostasized: false,
              stanceChange: { before: a2.beliefStance, after: a2.beliefStance },
              investAction: null, debatePhases: ["教派辩论"],
              factionDebate: true,
            };
            addDebate(factionDebateRecord as DebateRecord);
          } catch (e) { console.error("Faction debate failed:", e); }
        }
      }
    }

    // ====== 12. 返回 ======
    res.json({
      debate,
      factionDebate: factionDebateRecord,
      agents: getAgents(),
      metrics: getMetrics(),
      events,
      news: getNews().slice(-5),
      scriptures: getScriptures().slice(-3),
      alliances: getAlliances(),
      conclusion: getExperimentConclusion(),
      newAlliance,
      splitEvent,
      decisionBreakdown: {
        baseScore,
        debateScore,
        finalScore,
        outputQuality: debateResult.outputQuality,
        decisionReason: debateResult.decisionReason,
      },
    });
  } catch (error) {
    console.error("Round error:", error);
    res.status(500).json({ error: "回合执行失败" });
  }
});

// GET /api/status
app.get("/api/status", (_req, res) => {
  res.json({
    agents: getAgents(), debates: getDebates(), metrics: getMetrics(),
    news: getNews(), scriptures: getScriptures(), alliances: getAlliances(),
    conclusion: getExperimentConclusion(), narrativeBias: getNarrativeBiasHistory(),
  });
});

// GET /api/debates
app.get("/api/debates", (_req, res) => res.json(getDebates()));

// #9 GET /api/leaderboard
app.get("/api/leaderboard", (_req, res) => res.json(getLeaderboard()));

// #3 GET /api/conclusion
app.get("/api/conclusion", (_req, res) => res.json(getExperimentConclusion()));

// #10 GET /api/news
app.get("/api/news", (_req, res) => res.json(getNews()));

// #18 GET /api/scriptures
app.get("/api/scriptures", (_req, res) => res.json(getScriptures()));

// #16 GET /api/alliances
app.get("/api/alliances", (_req, res) => res.json(getAlliances()));

// #4 GET /api/narrative-bias
app.get("/api/narrative-bias", (_req, res) => res.json(getNarrativeBiasHistory()));

// #2 POST /api/apostasy — 手动触发叛教
app.post("/api/apostasy", (req, res) => {
  const { agentId } = req.body;
  const agents = getAgents();
  const agent = agents.find((a) => a.id === agentId);
  if (!agent || agent.id === "prophet") {
    return res.status(400).json({ error: "无法叛教" });
  }
  if (agent.stage === "S0") {
    return res.status(400).json({ error: "该 Agent 尚未被转化" });
  }
  const oldStage = agent.stage;
  demoteStage(agent);
  agent.beliefStance = Math.max(-1.0, agent.beliefStance - 0.2);
  updateSpiritValues();
  res.json({
    message: `${agent.name} 叛教：${oldStage} → ${agent.stage}`,
    agent, metrics: getMetrics(), conclusion: getExperimentConclusion(),
  });
});

// #18 POST /api/generate-scripture
app.post("/api/generate-scripture", async (_req, res) => {
  try {
    const scripture = await generateScripture(getAgents(), getDebates().length, "手动生成经文");
    addScripture(scripture);
    grantTaskReward(getAgents().find((a) => a.id === "prophet")!, "scripture_creation");
    res.json(scripture);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== 启动 ====================

app.listen(PORT, () => {
  console.log(`\n🕍 牛市预演教 Backend running on http://localhost:${PORT}`);
  console.log(`   Chain mode: ${chainReady ? "✅ LIVE" : "⚠️  MOCK"}`);
  console.log(`   LLM model: ${process.env.LLM_MODEL || "gpt-4o-mini"}`);
  console.log(`   Features: 19/19 implemented ✅\n`);
  initAgents();
  console.log("   Agents initialized: 6 agents ready\n");
});
