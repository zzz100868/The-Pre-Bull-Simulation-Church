export type Strategy = "logical" | "emotional" | "social_proof" | "miracle";
export type Stage = "S0" | "S1" | "S2" | "S3" | "S4";
export type Faction = "pre-bull" | "neutral" | "realist";

export interface Agent {
  id: string;
  name: string;
  role: string;
  beliefStance: number;
  riskTolerance: number;
  conformityBias: number;
  stage: Stage;
  faction: Faction;
  pbtBalance: number;
  investedAmount: number;
  promotionCount: number;
  // #1 精神市值
  spiritValue: number;
  // #4 叙事偏差
  narrativeBias: number;
  // #6 Token 权重
  voteWeight: number;
  // #17 传教士行为
  missionaryCount: number;
  // #16 联盟
  allianceId: string | null;
  // #5 多元 Token 获取
  taskRewards: number;
  // #13 阵营流动/叛教
  apostasyCount: number;
}

export interface Dialogue {
  speaker: string;
  text: string;
}

export interface InvestAction {
  amount: number;
  mintTxHash: string;
  eventTxHash: string;
}

// #14 辩论5步协议  #7 多策略  #8 历史案例  #11 反对观点  #15 多教派
export interface DebateRecord {
  round: number;
  prophetId: string;
  targetId: string;
  strategy: Strategy;
  secondaryStrategy?: Strategy;
  dialogues: Dialogue[];
  converted: boolean;
  apostasized: boolean;
  stanceChange: { before: number; after: number };
  investAction: InvestAction | null;
  debatePhases: string[];
  historicalCase?: string;
  counterArguments?: string[];
  factionDebate?: boolean;
  isMissionary?: boolean;
  baseScore?: number;
  debateScore?: number;
  finalScore?: number;
  outputQuality?: "strict_json" | "repaired_json" | "fallback";
  decisionReason?: string[];
}

// #10 未来新闻
export interface NewsItem {
  id: number;
  headline: string;
  content: string;
  timestamp: number;
  round: number;
  sentiment: "bullish" | "bearish" | "neutral";
}

// #18 经文/预言
export interface Scripture {
  id: number;
  title: string;
  content: string;
  author: string;
  round: number;
  timestamp: number;
}

// #16 联盟
export interface Alliance {
  id: string;
  name: string;
  members: string[];
  faction: Faction;
  strength: number;
  createdRound: number;
}

// #9 排行榜
export interface LeaderboardEntry {
  agentId: string;
  agentName: string;
  metric: string;
  value: number;
  rank: number;
}

// #3 实验结论/失败机制
export interface ExperimentConclusion {
  status: "ongoing" | "bull_wins" | "failed" | "stalemate";
  message: string;
  conversionRate: number;
  totalRounds: number;
  spiritMarketCap: number;
  narrativeDominance: number;
  canFalsify: boolean;
}

// #4 叙事偏差记录
export interface NarrativeBiasRecord {
  round: number;
  agentId: string;
  bias: number;
  meanBelief: number;
  individualBelief: number;
}

export interface Metrics {
  totalAgents: number;
  convertedCount: number;
  totalInvested: number;
  totalPromotions: number;
  mainFaction: string;
  factionDistribution: {
    "pre-bull": number;
    neutral: number;
    realist: number;
  };
  rounds: number;
  spiritMarketCap: number;
  realMarketCap: number;
  totalMissionary: number;
  totalApostasy: number;
  totalTaskRewards: number;
  allianceCount: number;
  experimentStatus: string;
  narrativeDominance: number;
  strategyStats: Record<Strategy, { total: number; success: number; rate: number }>;
}

// ============ Agent 定义 ============

const NEW_AGENT_FIELDS = {
  spiritValue: 0,
  narrativeBias: 0,
  voteWeight: 0,
  missionaryCount: 0,
  allianceId: null as string | null,
  taskRewards: 0,
  apostasyCount: 0,
};

const AGENTS_TEMPLATE: Agent[] = [
  {
    id: "prophet", name: "以利亚", role: "prophet",
    beliefStance: 0.95, riskTolerance: 0.8, conformityBias: 0.2,
    stage: "S4", faction: "pre-bull", pbtBalance: 10000,
    investedAmount: 0, promotionCount: 0,
    ...NEW_AGENT_FIELDS, spiritValue: 9500, voteWeight: 10,
  },
  {
    id: "skeptic-1", name: "多马", role: "skeptic",
    beliefStance: -0.5, riskTolerance: 0.3, conformityBias: 0.4,
    stage: "S0", faction: "neutral", pbtBalance: 0,
    investedAmount: 0, promotionCount: 0, ...NEW_AGENT_FIELDS,
  },
  {
    id: "neutral-1", name: "路得", role: "neutral",
    beliefStance: 0.0, riskTolerance: 0.5, conformityBias: 0.7,
    stage: "S0", faction: "neutral", pbtBalance: 0,
    investedAmount: 0, promotionCount: 0, ...NEW_AGENT_FIELDS,
  },
  {
    id: "neutral-2", name: "拿俄米", role: "neutral",
    beliefStance: 0.1, riskTolerance: 0.6, conformityBias: 0.5,
    stage: "S0", faction: "neutral", pbtBalance: 0,
    investedAmount: 0, promotionCount: 0, ...NEW_AGENT_FIELDS,
  },
  {
    id: "skeptic-2", name: "约拿", role: "skeptic",
    beliefStance: -0.3, riskTolerance: 0.4, conformityBias: 0.3,
    stage: "S0", faction: "neutral", pbtBalance: 0,
    investedAmount: 0, promotionCount: 0, ...NEW_AGENT_FIELDS,
  },
  {
    id: "realist", name: "该隐", role: "realist",
    beliefStance: -0.8, riskTolerance: 0.2, conformityBias: 0.1,
    stage: "S0", faction: "realist", pbtBalance: 0,
    investedAmount: 0, promotionCount: 0, ...NEW_AGENT_FIELDS,
  },
];

// ============ 状态管理 ============

let agents: Agent[] = [];
let debates: DebateRecord[] = [];
let news: NewsItem[] = [];
let scriptures: Scripture[] = [];
let alliances: Alliance[] = [];
let narrativeBiasHistory: NarrativeBiasRecord[] = [];

export function initAgents(): Agent[] {
  agents = JSON.parse(JSON.stringify(AGENTS_TEMPLATE));
  debates = [];
  news = [];
  scriptures = [];
  alliances = [];
  narrativeBiasHistory = [];
  return agents;
}

export function getAgents(): Agent[] { return agents; }
export function getDebates(): DebateRecord[] { return debates; }
export function getNews(): NewsItem[] { return news; }
export function getScriptures(): Scripture[] { return scriptures; }
export function getAlliances(): Alliance[] { return alliances; }
export function getNarrativeBiasHistory(): NarrativeBiasRecord[] { return narrativeBiasHistory; }

export function addDebate(debate: DebateRecord): void { debates.push(debate); }
export function addNews(item: NewsItem): void { news.push(item); }
export function addScripture(s: Scripture): void { scriptures.push(s); }

export function getAgentById(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

// #2 #13 — 可转化 Agent 包含 S3 以下 (允许在各阶段反复被说服)
export function getConvertibleAgents(): Agent[] {
  return agents.filter((a) => a.stage !== "S4" && a.id !== "prophet");
}

// #17 传教士 — 已转化 Agent 可充当说服者
export function getMissionaryAgents(): Agent[] {
  return agents.filter(
    (a) => a.stage >= "S1" && a.id !== "prophet"
  );
}

export function getConvertedRatio(): number {
  const converted = agents.filter(
    (a) => a.stage === "S3" || a.stage === "S4"
  ).length;
  return converted / agents.length;
}

const STAGE_ORDER: Stage[] = ["S0", "S1", "S2", "S3", "S4"];

export function promoteStage(agent: Agent): void {
  const idx = STAGE_ORDER.indexOf(agent.stage);
  if (idx < STAGE_ORDER.length - 1) {
    agent.stage = STAGE_ORDER[idx + 1];
  }
}

// #2 #13 叛教/降级
export function demoteStage(agent: Agent): void {
  const idx = STAGE_ORDER.indexOf(agent.stage);
  if (idx > 0) {
    agent.stage = STAGE_ORDER[idx - 1];
    agent.apostasyCount += 1;
    if (STAGE_ORDER.indexOf(agent.stage) < 3) {
      agent.faction = agent.role === "realist" ? "realist" : "neutral";
    }
  }
}

export function getStageLevel(stage: Stage): number {
  return STAGE_ORDER.indexOf(stage);
}

// #1 精神市值更新
export function updateSpiritValues(): void {
  agents.forEach((a) => {
    a.spiritValue = Math.max(0, a.beliefStance * a.pbtBalance);
    a.voteWeight = Math.max(0, Math.floor(a.pbtBalance / 1000));
  });
}

// #4 叙事偏差记录
export function recordNarrativeBias(round: number): void {
  const meanBelief = agents.reduce((s, a) => s + a.beliefStance, 0) / agents.length;
  agents.forEach((a) => {
    a.narrativeBias = Number((a.beliefStance - meanBelief).toFixed(3));
    narrativeBiasHistory.push({
      round, agentId: a.id, bias: a.narrativeBias,
      meanBelief, individualBelief: a.beliefStance,
    });
  });
}

// #5 多元 Token 获取 — 任务奖励
export function grantTaskReward(agent: Agent, task: string): number {
  const rewards: Record<string, number> = {
    debate_participation: 100,
    witness_conversion: 200,
    missionary_success: 500,
    alliance_formation: 300,
    scripture_creation: 400,
    apostasy_resistance: 150,
  };
  const amount = rewards[task] || 50;
  agent.taskRewards += amount;
  agent.pbtBalance += amount;
  return amount;
}

// #16 联盟管理
export function createAlliance(name: string, memberIds: string[], faction: Faction, round: number): Alliance {
  const alliance: Alliance = {
    id: `alliance-${alliances.length + 1}`,
    name, members: memberIds, faction,
    strength: memberIds.length, createdRound: round,
  };
  alliances.push(alliance);
  memberIds.forEach((id) => {
    const agent = getAgentById(id);
    if (agent) agent.allianceId = alliance.id;
  });
  return alliance;
}

// #16 分裂
export function splitAlliance(allianceId: string): Alliance[] {
  const alliance = alliances.find((a) => a.id === allianceId);
  if (!alliance || alliance.members.length < 2) return [];
  const mid = Math.ceil(alliance.members.length / 2);
  const group1 = alliance.members.slice(0, mid);
  const group2 = alliance.members.slice(mid);
  alliances = alliances.filter((a) => a.id !== allianceId);
  alliance.members.forEach((id) => {
    const agent = getAgentById(id);
    if (agent) agent.allianceId = null;
  });
  const result: Alliance[] = [];
  if (group1.length > 0) result.push(createAlliance(`${alliance.name}-残部A`, group1, alliance.faction, debates.length));
  if (group2.length > 0) result.push(createAlliance(`${alliance.name}-残部B`, group2, alliance.faction, debates.length));
  return result;
}

// #9 行为榜单
export function getLeaderboard(): LeaderboardEntry[] {
  const categories: { metric: string; fn: (a: Agent) => number }[] = [
    { metric: "PBT 持有量", fn: (a) => a.pbtBalance },
    { metric: "信仰指数", fn: (a) => Number(a.beliefStance.toFixed(2)) },
    { metric: "传教次数", fn: (a) => a.missionaryCount },
    { metric: "被推广次数", fn: (a) => a.promotionCount },
    { metric: "精神市值", fn: (a) => a.spiritValue },
    { metric: "任务奖励", fn: (a) => a.taskRewards },
  ];
  const entries: LeaderboardEntry[] = [];
  categories.forEach(({ metric, fn }) => {
    const sorted = [...agents].sort((a, b) => fn(b) - fn(a));
    sorted.forEach((a, i) => {
      entries.push({ agentId: a.id, agentName: a.name, metric, value: fn(a), rank: i + 1 });
    });
  });
  return entries;
}

// #3 实验结论/失败机制
export function getExperimentConclusion(): ExperimentConclusion {
  const totalRounds = debates.length;
  const conversionRate = getConvertedRatio();
  const spiritMarketCap = agents.reduce((s, a) => s + a.spiritValue, 0);
  const meanBelief = agents.reduce((s, a) => s + a.beliefStance, 0) / agents.length;
  const narrativeDominance = (meanBelief + 1) / 2;
  const allConverted = agents.every((a) => a.stage === "S3" || a.stage === "S4");
  const totalApostasy = agents.reduce((s, a) => s + a.apostasyCount, 0);

  let status: ExperimentConclusion["status"] = "ongoing";
  let message = "实验进行中……叙事与怀疑的角力尚未分出胜负。";
  let canFalsify = false;

  if (allConverted) {
    status = "bull_wins";
    message = "🎉 牛市叙事完全胜出！所有 Agent 已被说服加入牛市预演教。叙事的力量战胜了理性怀疑。";
  } else if (totalRounds >= 30 && conversionRate < 0.5) {
    status = "failed";
    message = "❌ 实验失败：经过30轮辩论，仍有超过一半的 Agent 未被说服。牛市叙事未能形成主导地位。";
    canFalsify = true;
  } else if (totalRounds >= 20 && conversionRate >= 0.3 && conversionRate < 0.7) {
    status = "stalemate";
    message = "⚖️ 僵局：叙事和怀疑势均力敌，社会共识尚未形成。";
  } else if (totalRounds >= 10 && totalApostasy > totalRounds * 0.3) {
    status = "failed";
    message = "💔 叛教潮涌：大量 Agent 信仰倒退，叙事正在崩塌。";
    canFalsify = true;
  }
  return { status, message, conversionRate, totalRounds, spiritMarketCap, narrativeDominance, canFalsify };
}

export function getMetrics(): Metrics {
  const convertedCount = agents.filter((a) => a.stage === "S3" || a.stage === "S4").length;
  const totalInvested = agents.reduce((s, a) => s + a.investedAmount, 0);
  const totalPromotions = agents.reduce((s, a) => s + a.promotionCount, 0);
  const factionDistribution = {
    "pre-bull": agents.filter((a) => a.faction === "pre-bull").length,
    neutral: agents.filter((a) => a.faction === "neutral").length,
    realist: agents.filter((a) => a.faction === "realist").length,
  };
  const mainFaction = (Object.entries(factionDistribution) as [string, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  const spiritMarketCap = agents.reduce((s, a) => s + a.spiritValue, 0);
  const realMarketCap = agents.reduce((s, a) => s + a.pbtBalance, 0);
  const totalMissionary = agents.reduce((s, a) => s + a.missionaryCount, 0);
  const totalApostasy = agents.reduce((s, a) => s + a.apostasyCount, 0);
  const totalTaskRewards = agents.reduce((s, a) => s + a.taskRewards, 0);
  const meanBelief = agents.reduce((s, a) => s + a.beliefStance, 0) / agents.length;
  const narrativeDominance = (meanBelief + 1) / 2;

  const strategyStats: Record<Strategy, { total: number; success: number; rate: number }> = {
    logical: { total: 0, success: 0, rate: 0 },
    emotional: { total: 0, success: 0, rate: 0 },
    social_proof: { total: 0, success: 0, rate: 0 },
    miracle: { total: 0, success: 0, rate: 0 },
  };
  debates.forEach((d) => {
    strategyStats[d.strategy].total++;
    if (d.converted) strategyStats[d.strategy].success++;
    if (d.secondaryStrategy) {
      strategyStats[d.secondaryStrategy].total++;
      if (d.converted) strategyStats[d.secondaryStrategy].success++;
    }
  });
  Object.values(strategyStats).forEach((s) => {
    s.rate = s.total > 0 ? s.success / s.total : 0;
  });

  return {
    totalAgents: agents.length, convertedCount, totalInvested, totalPromotions,
    mainFaction, factionDistribution, rounds: debates.length,
    spiritMarketCap, realMarketCap, totalMissionary, totalApostasy,
    totalTaskRewards, allianceCount: alliances.length,
    experimentStatus: getExperimentConclusion().status,
    narrativeDominance, strategyStats,
  };
}
