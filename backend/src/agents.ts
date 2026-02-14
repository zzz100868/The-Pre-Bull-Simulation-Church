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

export interface DebateRecord {
  round: number;
  prophetId: string;
  targetId: string;
  strategy: Strategy;
  dialogues: Dialogue[];
  converted: boolean;
  stanceChange: { before: number; after: number };
  investAction: InvestAction | null;
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
}

// ============ Agent 定义 ============

const AGENTS_TEMPLATE: Agent[] = [
  {
    id: "prophet",
    name: "以利亚",
    role: "prophet",
    beliefStance: 0.95,
    riskTolerance: 0.8,
    conformityBias: 0.2,
    stage: "S4",
    faction: "pre-bull",
    pbtBalance: 10000,
    investedAmount: 0,
    promotionCount: 0,
  },
  {
    id: "skeptic-1",
    name: "多马",
    role: "skeptic",
    beliefStance: -0.5,
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
    conformityBias: 0.7,
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
    beliefStance: -0.8,
    riskTolerance: 0.2,
    conformityBias: 0.1,
    stage: "S0",
    faction: "realist",
    pbtBalance: 0,
    investedAmount: 0,
    promotionCount: 0,
  },
];

// ============ 状态管理 ============

let agents: Agent[] = [];
let debates: DebateRecord[] = [];

export function initAgents(): Agent[] {
  agents = JSON.parse(JSON.stringify(AGENTS_TEMPLATE));
  debates = [];
  return agents;
}

export function getAgents(): Agent[] {
  return agents;
}

export function getDebates(): DebateRecord[] {
  return debates;
}

export function addDebate(debate: DebateRecord): void {
  debates.push(debate);
}

export function getAgentById(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

export function getConvertibleAgents(): Agent[] {
  return agents.filter(
    (a) => a.stage !== "S4" && a.stage !== "S3" && a.id !== "prophet"
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

export function getStageLevel(stage: Stage): number {
  return STAGE_ORDER.indexOf(stage);
}

export function getMetrics(): Metrics {
  const convertedCount = agents.filter(
    (a) => a.stage === "S3" || a.stage === "S4"
  ).length;
  const totalInvested = agents.reduce((s, a) => s + a.investedAmount, 0);
  const totalPromotions = agents.reduce((s, a) => s + a.promotionCount, 0);

  const factionDistribution = {
    "pre-bull": agents.filter((a) => a.faction === "pre-bull").length,
    neutral: agents.filter((a) => a.faction === "neutral").length,
    realist: agents.filter((a) => a.faction === "realist").length,
  };

  const mainFaction = (
    Object.entries(factionDistribution) as [string, number][]
  ).sort((a, b) => b[1] - a[1])[0][0];

  return {
    totalAgents: agents.length,
    convertedCount,
    totalInvested,
    totalPromotions,
    mainFaction,
    factionDistribution,
    rounds: debates.length,
  };
}
