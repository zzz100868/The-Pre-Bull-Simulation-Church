# 牛市预演教 DApp — 最小可交付架构

## Pre-Bull Simulation Church — MVP Architecture

> 原则：砍掉一切非 Demo 必须的东西，用最少代码跑通完整闭环。

---

## 一、系统总览

**系统架构层次：**

**→ 前端层（Next.js）**
- Dashboard：统计与 Agent 状态表
- Debate Arena：实时辩论展示
- REST API 轮询（3s 刷新）

**↓**

**→ 后端层（Node.js + Express）**
- Round Runner：回合调度
- Persuasion Engine：策略路由 & LLM 调用
- Agent State：内存 JSON 状态管理

**↓**

**→ 链层（Monad Testnet）**
- PBT Token（ERC-20）：mint / transfer / balanceOf
- 事件记录：Converted 事件日志

**砍掉的内容：**
- ❌ WebSocket（改前端 3s 轮询）
- ❌ PostgreSQL / SQLite（全内存 JSON）
- ❌ Redis
- ✅ 经文/预言生成模块（已实现，LLM 实时生成）
- ✅ 市场模拟器（已通过精神市值系统实现）

---

## 二、合约（10 分钟搞定）

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PBT is ERC20, Ownable {
    event Converted(string agentId, uint256 timestamp);

    constructor() ERC20("PreBull Ticket", "PBT") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function recordConversion(string calldata agentId) external onlyOwner {
        emit Converted(agentId, block.timestamp);
    }
}
```

**说明：** `transfer` / `balanceOf` 已由 ERC20 继承

---

## 三、Agent 设计（6 个 Agent，纯内存）

```typescript
// 所有 Agent 定义，硬编码在一个文件里
const AGENTS = [
  {
    id: "prophet",
    name: "以利亚",
    role: "prophet",
    beliefStance: 0.95,       // 坚定牛市
    riskTolerance: 0.8,
    conformityBias: 0.2,
    stage: "S4",              // 已是布道者
    faction: "pre-bull",
    pbtBalance: 10000,
    investedAmount: 0,        // 累计投资金额（PBT）
    promotionCount: 0,        // 被推广/布道的次数
  },
  {
    id: "skeptic-1",
    name: "多马",
    role: "skeptic",
    beliefStance: -0.5,       // 偏怀疑
    riskTolerance: 0.3,
    conformityBias: 0.4,
    stage: "S0",
    faction: "neutral",
    pbtBalance: 0,
    investedAmount: 0,
    promotionCount: 0,
  },
  {
    id: "neutral-1",
    name: "路得",
    role: "neutral",
    beliefStance: 0.0,
    riskTolerance: 0.5,
    conformityBias: 0.7,      // 高从众 → 适合 social proof
    stage: "S0",
    faction: "neutral",
    pbtBalance: 0,
    investedAmount: 0,
    promotionCount: 0,
  },
  {
    id: "neutral-2",
    name: "拿俄米",
    role: "neutral",
    beliefStance: 0.1,
    riskTolerance: 0.6,
    conformityBias: 0.5,
    stage: "S0",
    faction: "neutral",
    pbtBalance: 0,
    investedAmount: 0,
    promotionCount: 0,
  },
  {
    id: "skeptic-2",
    name: "约拿",
    role: "skeptic",
    beliefStance: -0.3,
    riskTolerance: 0.4,
    conformityBias: 0.3,
    stage: "S0",
    faction: "neutral",
    pbtBalance: 0,
    investedAmount: 0,
    promotionCount: 0,
  },
  {
    id: "realist",
    name: "该隐",
    role: "realist",
    beliefStance: -0.8,       // 极端现实主义
    riskTolerance: 0.2,
    conformityBias: 0.1,
    stage: "S0",
    faction: "realist",
    pbtBalance: 0,
    investedAmount: 0,
    promotionCount: 0,
  },
];
```

**初始化：** 服务启动时 `JSON.parse(JSON.stringify(AGENTS))` 复制一份做可变状态

---

## 四、说服引擎（一个函数搞定）

```typescript
type Strategy = "logical" | "emotional" | "social_proof" | "miracle";

function pickStrategy(target: Agent, convertedRatio: number): Strategy {
  if (target.conformityBias > 0.6)        return "social_proof";
  if (target.riskTolerance < 0.3)         return "emotional";
  if (target.beliefStance > -0.3)         return "logical";
  return "miracle";
}

// 转化判定：一个 if
function shouldConvert(target: Agent, strategy: Strategy, convertedRatio: number): boolean {
  let p = 0.15; // base
  if (strategy === "social_proof" && target.conformityBias > 0.5) p += 0.25;
  if (strategy === "emotional"    && target.riskTolerance < 0.4)  p += 0.20;
  if (strategy === "logical"      && target.beliefStance > -0.3)  p += 0.20;
  if (strategy === "miracle")                                      p += 0.10;
  p += convertedRatio * target.conformityBias * 0.3; // 从众加成
  return Math.random() < p;
}
```

**说明：** 4 种策略只是传给 LLM 的 prompt 关键词，不需要模板文件

---

## 五、核心流程（一个回合）

**POST /api/round 执行流：**

1. 选目标：从 stage < S3 的 Agent 中随机选一个
2. 选策略：pickStrategy(target)
3. 调 LLM：生成 2 轮对话（prophet 说 → target 回 → prophet 再说 → target 再回）
4. 判定：shouldConvert(target, strategy)
5. 记录推广：target.promotionCount += 1（无论是否转化）
6. 若转化执行：
   - target.stage 提升一级
   - target.beliefStance += 0.2
   - target.faction = "pre-bull" (当 stage >= S3)
   - 计算投资金额：investAmount = 1000 * stageLevel（S1=1000, S2=2000…）
   - target.investedAmount += investAmount
   - target.pbtBalance += investAmount
   - 调合约 mint PBT 给 target 地址（amount = investAmount）
   - 调合约 recordConversion(target.id)
7. 记录本轮结果到内存数组 debates[]（含 investAction 字段）
8. 返回 JSON { debate, agents, metrics }

**LLM 调用 prompt 格式：**

```
System: 你是牛市预演教的先知"以利亚"。
当前策略：{strategy}。
对手名字：{target.name}，立场：{target.beliefStance}，
性格：风险容忍 {target.riskTolerance}，从众 {target.conformityBias}。
用 2-3 句话说服对方加入牛市预演教。不要提及价格预测。

---

System: 你是 {target.name}，{target.role}。
你的信仰倾向是 {target.beliefStance}（-1 极端怀疑，+1 极端乐观）。
根据你的性格回应对方的说服。
```

---

## 六、API（4 个接口）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/start` | POST | 初始化 Agent 状态，返回 agents[] |
| `/api/round` | POST | 执行一回合，返回 { debate, agents, metrics } |
| `/api/status` | GET | 返回 { agents[], debates[], metrics } |
| `/api/debates` | GET | 返回 debates[] |

**metrics 返回结构：**

```typescript
interface Metrics {
  totalAgents: number;           // 总 Agent 数
  convertedCount: number;        // 已转化数量（stage >= S3）
  totalInvested: number;         // 投资金额总和（所有 Agent 的 investedAmount 之和）
  totalPromotions: number;       // 推广次数总和（所有 Agent 的 promotionCount 之和）
  mainFaction: string;           // 当前主流教派（占比最高的 faction）
  factionDistribution: {         // 各教派分布
    "pre-bull": number;
    "neutral": number;
    "realist": number;
  };
  rounds: number;                // 已进行回合数
}
```

**debate 单条结构：**

```typescript
interface DebateRecord {
  round: number;
  prophetId: string;
  targetId: string;
  strategy: Strategy;
  dialogues: { speaker: string; text: string }[];
  converted: boolean;
  stanceChange: { before: number; after: number };  // 立场变化
  investAction: {                                    // 投资动作
    amount: number;         // 本轮投资 PBT 数量（未转化则为 0）
    mintTxHash: string;     // mint 交易 hash
    eventTxHash: string;    // recordConversion 交易 hash
  } | null;
}
```

**设计原则：** 不需要单独的 `/agents/:id`、`/metrics/*` 等细粒度接口，前端从 `/api/status` 一个接口拿到所有数据

---

## 七、前端页面

### Dashboard 示例

**头部统计卡片（6 格）：**

| 指标 | 值 | 说明 |
|------|-----|------|
| 📊 总 Agent 数 | 6 | 所有 Agent 总数 |
| ✅ 已转化数量 | 3 | stage >= S3 的 Agent 数 |
| 💰 投资金额 | 15,000 PBT | 所有 Agent 的 investedAmount 总和 |
| 📣 推广次数 | 8 | 所有 Agent 的 promotionCount 总和 |
| ⛪ 当前主流教派 | 🟢 牛市预演教 | 占比最高的 faction |
| 🔄 已进行回合 | 5 | debates[] 长度 |

**Agent 状态表：**

| Agent | Faction | Stage | Belief | PBT | 投资金额 | 被推广次数 |
|-------|---------|-------|--------|-----|---------|------------|
| 以利亚 | 🟢 牛市 | S4 | +0.95 | 10K | — | 0 |
| 多马 | 🟢 牛市 | S3 | +0.30 | 6K | 6,000 | 3 |
| 路得 | ⚪ 中立 | S2 | +0.10 | 3K | 3,000 | 2 |
| 拿俄米 | ⚪ 中立 | S1 | +0.10 | 1K | 1,000 | 1 |
| 约拿 | ⚪ 中立 | S0 | -0.30 | 0 | 0 | 1 |
| 该隐 | 🔴 现实 | S0 | -0.80 | 0 | 0 | 1 |

**最近辩论：** 以利亚 vs 多马 (Emotional) → ✅ 转化 | 💰 +2,000 PBT

### Debate Arena 示例

**Round #5: 以利亚 vs 路得**
- 策略: Social Proof

**对话过程：**

🟢 **以利亚：** "路得，已经有 3 个人选择了牛市时间线……"

⚪ **路得：** "人多不代表正确，但我确实在犹豫……"

🟢 **以利亚：** "犹豫本身就说明你已经不完全相信熊市叙事了。"

⚪ **路得：** "好吧，我愿意试试看这个实验。"

**立场变化：**
- Belief: 0.0 → +0.20（↑ +0.20）
- Stage: S1 → S2
- Faction: ⚪ 中立 → ⚪ 中立（未达 S3，暂不切换）

**投资动作：**
- 💰 投资 2,000 PBT（S2 级 = 2000）
- 📝 Mint Tx: 0xabc...def
- 📝 Converted Event Tx: 0xdef...123

**结果：** ✅ 转化成功 | 累计投资: 3,000 PBT | 累计被推广: 2 次

**前端实现：**
- `page.tsx`：一个页面，上半 Dashboard，下半 Arena
- 点"下一轮"→ `fetch POST /api/round` → 用返回数据刷新整页
- 不需要 WebSocket，不需要 Chart 库（数据直接表格展示）
- 如果时间够，再加饼图（用 Recharts，10 行代码）

---

## 八、技术栈选型

| 模块 | 选型 | 理由 |
|------|------|------|
| Smart Contract | Solidity + Hardhat | 标准 ERC-20 |
| Backend | Node.js + Express + TypeScript | 单文件可跑 |
| LLM | Moonshot AI (moonshot-v1-8k) | OpenAI 兼容接口，快速、稳定 |
| Storage | 内存 JSON | 不需要数据库 |
| Frontend | Next.js + TailwindCSS | 快速出页面 |
| Web3 | ethers.js v6 | 合约交互 |

---

## 九、项目目录结构

```
monadaiagent/
├── contracts/
│   ├── contracts/PBT.sol
│   ├── scripts/deploy.ts
│   ├── hardhat.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── index.ts             # Express 入口 + 所有 API
│   │   ├── agents.ts            # Agent 定义 + 状态管理
│   │   ├── persuasion.ts        # 策略选择 + 转化判定
│   │   ├── llm.ts               # OpenAI 调用封装
│   │   └── chain.ts             # 合约交互 (mint/record)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx             # 唯一页面：Dashboard + Arena
│   │   └── layout.tsx
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.js
│
└── README.md
```

**代码量：** 后端 5 个文件 | 前端 1 个页面

---

## 十、开发计划（6-8 小时）

**Phase 1: 合约（30 min）**
- [ ] 写 PBT.sol
- [ ] hardhat compile + 本地测试
- [ ] 部署到 Monad Testnet

**Phase 2: 后端核心（2-3 hr）**
- [ ] agents.ts — 硬编码 6 个 Agent
- [ ] persuasion.ts — pickStrategy + shouldConvert
- [ ] llm.ts — OpenAI 调用，2 轮对话
- [ ] chain.ts — mint + recordConversion
- [ ] index.ts — 4 个 API 接口

**Phase 3: 前端（2-3 hr）**
- [ ] page.tsx — Dashboard 表格 + 统计卡片
- [ ] page.tsx — Arena 对话展示
- [ ] "下一轮"按钮 + fetch 调用

**Phase 4: 联调（1 hr）**
- [ ] 前端 ↔ 后端 ↔ 合约 跑通
- [ ] 确保 3+ Agent 能被转化

**Phase 5: 美化（如果有时间）**
- [ ] 加饼图
- [ ] 加动画
- [ ] 调 prompt 让对话更有趣

---

## 十一、Demo 脚本（3 分钟）

**Step 1（30s）：打开页面**
- 展示 6 个 Agent，只有以利亚是信徒
- 解释："这是一个叙事说服实验"

**Step 2（90s）：点 3 次"下一轮"**
- 每次实时展示 LLM 生成的辩论对话
- 展示策略自动切换（对不同 Agent 用不同策略）
- 至少 1 个 Agent 被转化，表格实时变绿

**Step 3（30s）：链上证明**
- 展示 Monad Testnet 上的 PBT 合约
- 查看 Converted 事件 + Transfer 记录

**Step 4（30s）：结果**
- "3/6 Agents 已转化，使用了 3 种不同策略"
- "这不是预测，是叙事行为实验"

---

## 十二、text.md 未在 MVP 中实现的内容

| # | text.md 内容 | 状态 | 实现方式 |
|---|---|---|---|
| 1 | 精神市值系统 | ✅ 已实现 | `updateSpiritValues()` + `SpiritMarketCap` 前端组件，精神市值 vs 实际PBT对比 |
| 2 | 时间线自由切换 | ✅ 已实现 | `demoteStage()` + `shouldApostatize()` + 前端叛教按钮，支持信仰回退 |
| 3 | 实验结论/失败机制 | ✅ 已实现 | `getExperimentConclusion()` 4种结局：ongoing/bull_wins/failed/stalemate + `ConclusionBanner` |
| 4 | 教义4—叙事偏差记录 | ✅ 已实现 | `recordNarrativeBias()` 每轮记录 + `NarrativeBiasDisplay` 前端可视化 |
| 5 | Token 获取方式多元 | ✅ 已实现 | `grantTaskReward()` 6种任务：辩论参与/见证转化/传教成功/联盟/经文/坚守 |
| 6 | Token 权限/权重 | ✅ 已实现 | `voteWeight` 基于PBT持有量，影响 `shouldConvert()` 概率 |
| 7 | 多策略组合 | ✅ 已实现 | `pickSecondaryStrategy()` 主+副双策略，副策略提供额外加成 |
| 8 | 历史案例论证 | ✅ 已实现 | `HISTORICAL_CASES` 6个历史案例注入LLM prompt，前端显示引用标签 |
| 9 | 行为榜单 | ✅ 已实现 | `getLeaderboard()` 6维度排名 + `Leaderboard` 前端组件 |
| 10 | 未来新闻生成 | ✅ 已实现 | `generateFutureNews()` 每轮LLM生成 + `NewsTicker` 前端组件 |
| 11 | 反对观点回应模板 | ✅ 已实现 | `COUNTER_ARGUMENT_TEMPLATES` 6个模板注入prompt，前端展示使用的反驳 |
| 12 | 策略成功率统计 | ✅ 已实现 | `strategyStats` 从debates统计 + `StrategyStats` 4个策略进度条 |
| 13 | 阵营流动/叛教 | ✅ 已实现 | `shouldApostatize()` 自动叛教检测 + POST `/api/apostasy` 手动触发 |
| 14 | 辩论5步协议 | ✅ 已实现 | `DEBATE_PHASES` 5阶段 + LLM生成10段对话（5轮交锋） |
| 15 | 多教派辩论记录 | ✅ 已实现 | `generateFactionDebate()` 每5轮触发非先知Agent间辩论 |
| 16 | 联盟与分裂 | ✅ 已实现 | `shouldFormAlliance()` + `shouldSplit()` + `AllianceDisplay` 前端组件 |
| 17 | 传教士行为 | ✅ 已实现 | `getMissionaryAgents()` S1+可传教，60%概率替代先知说服 |
| 18 | 经文/预言生成 | ✅ 已实现 | `generateScripture()` 每轮生成 + 手动生成按钮 + `ScriptureDisplay` |
| 19 | 风险声明 UI | ✅ 已实现 | Landing页 + Footer 双重风险免责声明 |

---

## 十三、补回清单完成状态

> ✅ **所有 19 项功能已全部实现并在前端可见。** 以下为原计划的补回清单完成记录。

**✅ 策略成功率统计展示** — `StrategyStats` 组件，4个策略进度条实时展示

**✅ 风险声明 Footer** — Landing 页 + Dashboard Footer 双重风险免责声明

**✅ 反对观点回应模板** — `COUNTER_ARGUMENT_TEMPLATES` 6个模板注入 LLM prompt，前端展示使用的反驳模板

