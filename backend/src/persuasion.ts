import { Agent, Strategy } from "./agents";

// #7 多策略组合 — 选主策略
export function pickStrategy(target: Agent, convertedRatio: number): Strategy {
  if (target.conformityBias > 0.6) return "social_proof";
  if (target.riskTolerance < 0.3) return "emotional";
  if (target.beliefStance > -0.3) return "logical";
  return "miracle";
}

// #7 选副策略(与主策略不同)
export function pickSecondaryStrategy(primary: Strategy, target: Agent): Strategy {
  const all: Strategy[] = ["logical", "emotional", "social_proof", "miracle"];
  const candidates = all.filter((s) => s !== primary);
  // 根据 target 特征选最合适的辅助策略
  if (target.riskTolerance < 0.4 && primary !== "emotional") return "emotional";
  if (target.conformityBias > 0.5 && primary !== "social_proof") return "social_proof";
  if (target.beliefStance > -0.2 && primary !== "logical") return "logical";
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// #6 Token 权重 — 投票影响力修正
function voteWeightModifier(persuader: Agent): number {
  return 1 + persuader.voteWeight * 0.02; // 每 1 权重 +2% 成功率
}

export function shouldConvert(
  target: Agent,
  strategy: Strategy,
  convertedRatio: number,
  secondaryStrategy?: Strategy,
  persuader?: Agent
): boolean {
  let p = 0.15; // base probability
  if (strategy === "social_proof" && target.conformityBias > 0.5) p += 0.25;
  if (strategy === "emotional" && target.riskTolerance < 0.4) p += 0.2;
  if (strategy === "logical" && target.beliefStance > -0.3) p += 0.2;
  if (strategy === "miracle") p += 0.1;
  p += convertedRatio * target.conformityBias * 0.3; // 从众加成

  // #7 辅策略加成
  if (secondaryStrategy) {
    if (secondaryStrategy === "social_proof" && target.conformityBias > 0.5) p += 0.08;
    if (secondaryStrategy === "emotional" && target.riskTolerance < 0.4) p += 0.06;
    if (secondaryStrategy === "logical" && target.beliefStance > -0.3) p += 0.06;
    if (secondaryStrategy === "miracle") p += 0.04;
  }

  // #6 Token 权重
  if (persuader) {
    p *= voteWeightModifier(persuader);
  }

  return Math.random() < p;
}

// #13 #2 叛教判定 — 已有信仰的 Agent 有一定概率叛教
export function shouldApostatize(agent: Agent, convertedRatio: number): boolean {
  // 只有已部分转化的 Agent 可能叛教 (S1-S3)
  if (agent.stage === "S0" || agent.stage === "S4" || agent.id === "prophet") return false;

  let p = 0.05; // 基础叛教率 5%
  // 越少人被转化，叛教概率越高
  p += (1 - convertedRatio) * 0.1;
  // 低从众性更容易叛教
  p += (1 - agent.conformityBias) * 0.05;
  // 原始信仰越低，越容易叛教
  if (agent.beliefStance < 0) p += 0.05;
  // 已叛教过的更容易再次叛教
  p += agent.apostasyCount * 0.03;

  return Math.random() < p;
}

// #16 联盟形成判定
export function shouldFormAlliance(agents: Agent[]): { should: boolean; members: string[] } {
  // 同一 faction 且 stage >= S2 的 Agent 可能组成联盟
  const preBull = agents.filter(
    (a) => a.faction === "pre-bull" && a.stage !== "S0" && !a.allianceId
  );
  if (preBull.length >= 2 && Math.random() < 0.3) {
    return { should: true, members: preBull.map((a) => a.id) };
  }
  const neutral = agents.filter(
    (a) => a.faction === "neutral" && a.stage !== "S0" && !a.allianceId
  );
  if (neutral.length >= 2 && Math.random() < 0.2) {
    return { should: true, members: neutral.map((a) => a.id) };
  }
  return { should: false, members: [] };
}

// #16 分裂判定
export function shouldSplit(allianceMembers: Agent[]): boolean {
  if (allianceMembers.length < 2) return false;
  // 联盟成员信仰差异太大 → 分裂
  const beliefs = allianceMembers.map((a) => a.beliefStance);
  const maxDiff = Math.max(...beliefs) - Math.min(...beliefs);
  return maxDiff > 0.6 && Math.random() < 0.25;
}

// #8 历史案例列表
export const HISTORICAL_CASES = [
  { name: "荷兰郁金香泡沫 (1637)", desc: "一朵郁金香涨到工人10年工资，最终一夜崩盘。" },
  { name: "南海泡沫 (1720)", desc: "南海公司股价涨10倍，牛顿也被套牢亏损2万英镑。" },
  { name: "互联网泡沫 (2000)", desc: "纳斯达克从5000跌到1000，但Amazon和Google存活并壮大。" },
  { name: "比特币牛市 (2017)", desc: "BTC从1000涨到20000再跌到3000，但长期仍然上涨。" },
  { name: "GameStop逼空 (2021)", desc: "散户联合做多GME，叙事的力量让华尔街空头损失惨重。" },
  { name: "Luna崩盘 (2022)", desc: "算法稳定币信仰一夜崩塌，400亿美元灰飞烟灭。" },
];

// #11 反对观点回应模板
export const COUNTER_ARGUMENT_TEMPLATES: Record<string, string> = {
  "空气币": "PBT不是空气——它是衡量叙事渗透程度的度量工具。价值不在于价格，而在于它记录了多少人被说服。",
  "价格没涨": "这个实验的核心不是价格涨跌，而是集体信仰如何形成。历史上每一次泡沫，在顶点之前所有人都觉得'还没涨够'。",
  "没有实际用途": "最强大的资产从来不是因为'有用'才值钱——是因为足够多的人相信它有价值。共识本身就是最大的utility。",
  "庞氏骗局": "庞氏需要新资金接盘，而我们只是在模拟和记录信仰传播的过程。这是社会实验，不是投资产品。",
  "市场会崩盘": "当然会。但问题是：在崩盘之前，叙事能把多少理性的人变成信徒？这就是这个实验要回答的问题。",
  "FOMO陷阱": "识别FOMO是好事——但这恰恰证明了叙事的力量。你害怕错过，说明叙事已经在影响你的判断了。",
};
