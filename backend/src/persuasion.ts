import { Agent, Strategy } from "./agents";

export function pickStrategy(
  target: Agent,
  convertedRatio: number
): Strategy {
  if (target.conformityBias > 0.6) return "social_proof";
  if (target.riskTolerance < 0.3) return "emotional";
  if (target.beliefStance > -0.3) return "logical";
  return "miracle";
}

export function shouldConvert(
  target: Agent,
  strategy: Strategy,
  convertedRatio: number
): boolean {
  let p = 0.15; // base probability
  if (strategy === "social_proof" && target.conformityBias > 0.5) p += 0.25;
  if (strategy === "emotional" && target.riskTolerance < 0.4) p += 0.2;
  if (strategy === "logical" && target.beliefStance > -0.3) p += 0.2;
  if (strategy === "miracle") p += 0.1;
  p += convertedRatio * target.conformityBias * 0.3; // 从众加成
  return Math.random() < p;
}
