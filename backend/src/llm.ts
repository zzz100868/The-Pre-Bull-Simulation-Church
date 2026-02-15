import OpenAI from "openai";
import { Agent, Strategy, Dialogue, NewsItem, Scripture } from "./agents";
import { HISTORICAL_CASES, COUNTER_ARGUMENT_TEMPLATES } from "./persuasion";

let openai: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    });
  }
  return openai;
}

const STRATEGY_LABELS: Record<Strategy, string> = {
  logical: "逻辑论证：用数据、因果和反例推动判断",
  emotional: "情感打动：强调风险感受、机会损失与行动动机",
  social_proof: "社会证明：强调群体行为与共识形成",
  miracle: "奇迹叙事：强调愿景、信念与象征性时刻",
};

const DEBATE_PHASES = [
  "识别目标 (Identify)",
  "建立接触 (Approach)",
  "核心论证 (Argue)",
  "反驳回应 (Counter)",
  "总结定论 (Conclude)",
];

type OutputQuality = "strict_json" | "repaired_json" | "fallback";

interface DebateTurn {
  speaker: string;
  text: string;
  phase?: string;
}

interface DebateModelResponse {
  dialogues?: DebateTurn[];
  debateSummary?: string;
  persuasionSignals?: string[];
  riskFlags?: string[];
  quality?: {
    coherence?: number;
    rebuttal?: number;
    personaFit?: number;
    targetFit?: number;
    overall?: number;
  };
}

function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

function pickHistoricalCase(strategy: Strategy): typeof HISTORICAL_CASES[0] {
  const map: Record<Strategy, string[]> = {
    logical: ["荷兰郁金香泡沫 (1637)", "南海泡沫 (1720)", "互联网泡沫 (2000)"],
    emotional: ["Luna崩盘 (2022)", "南海泡沫 (1720)", "荷兰郁金香泡沫 (1637)"],
    social_proof: ["GameStop逼空 (2021)", "比特币牛市 (2017)", "互联网泡沫 (2000)"],
    miracle: ["比特币牛市 (2017)", "GameStop逼空 (2021)", "互联网泡沫 (2000)"],
  };
  const preferred = map[strategy];
  const pool = HISTORICAL_CASES.filter((c) => preferred.includes(c.name));
  if (pool.length === 0) {
    return HISTORICAL_CASES[Math.floor(Math.random() * HISTORICAL_CASES.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function scoreCounterTemplate(
  key: string,
  target: Agent,
  strategy: Strategy
): number {
  let score = 0;
  const skeptical = target.beliefStance < -0.2 || target.role === "skeptic" || target.role === "realist";
  if (key === "空气币" && skeptical) score += 2.2;
  if (key === "没有实际用途" && skeptical) score += 2.0;
  if (key === "庞氏骗局" && skeptical) score += 1.8;
  if (key === "市场会崩盘" && target.riskTolerance < 0.45) score += 2.0;
  if (key === "价格没涨" && target.stage === "S0") score += 1.4;
  if (key === "FOMO陷阱" && (target.conformityBias > 0.5 || strategy === "social_proof")) score += 1.6;

  if (strategy === "logical" && (key === "空气币" || key === "没有实际用途")) score += 0.8;
  if (strategy === "emotional" && (key === "市场会崩盘" || key === "FOMO陷阱")) score += 0.8;
  if (strategy === "social_proof" && key === "FOMO陷阱") score += 0.9;
  if (strategy === "miracle" && key === "庞氏骗局") score += 0.5;
  return score;
}

function pickCounterArguments(target: Agent, strategy: Strategy): string[] {
  const keys = Object.keys(COUNTER_ARGUMENT_TEMPLATES);
  const ranked = keys
    .map((k) => ({ key: k, score: scoreCounterTemplate(k, target, strategy) + Math.random() * 0.3 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((x) => x.key);
  return ranked.length > 0 ? ranked : [keys[Math.floor(Math.random() * keys.length)]];
}

function extractJsonLike(content: string): string | null {
  const trimmed = content.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence?.[1]) return fence[1].trim();

  const start = Math.min(
    ...[trimmed.indexOf("{"), trimmed.indexOf("[")].filter((i) => i >= 0)
  );
  if (!Number.isFinite(start)) return null;

  const openCh = trimmed[start];
  const closeCh = openCh === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === "\"") inString = !inString;
    if (inString) continue;
    if (ch === openCh) depth++;
    if (ch === closeCh) {
      depth--;
      if (depth === 0) return trimmed.slice(start, i + 1);
    }
  }
  return null;
}

function parseJsonSafe(content: string): { parsed: any | null; quality: OutputQuality } {
  try {
    return { parsed: JSON.parse(content), quality: "strict_json" };
  } catch {
    // continue
  }

  const extracted = extractJsonLike(content);
  if (!extracted) return { parsed: null, quality: "fallback" };

  try {
    return { parsed: JSON.parse(extracted), quality: "repaired_json" };
  } catch {
    return { parsed: null, quality: "fallback" };
  }
}

function normalizePhase(phase?: string): string {
  if (!phase) return "核心论证 (Argue)";
  if (phase.includes("识别")) return "识别目标 (Identify)";
  if (phase.includes("接触")) return "建立接触 (Approach)";
  if (phase.includes("核心")) return "核心论证 (Argue)";
  if (phase.includes("反驳")) return "反驳回应 (Counter)";
  if (phase.includes("总结")) return "总结定论 (Conclude)";
  return "核心论证 (Argue)";
}

function normalizeDialogues(raw: DebateTurn[], prophet: Agent, target: Agent): DebateTurn[] {
  const mapped = raw
    .filter((d) => typeof d?.speaker === "string" && typeof d?.text === "string")
    .map((d) => {
      const speaker = d.speaker.trim();
      const text = d.text.trim();
      const phase = normalizePhase(d.phase);
      return { speaker, text, phase };
    })
    .filter((d) => d.text.length > 0);

  if (mapped.length === 0) return [];

  const fixedSpeakers = mapped.map((d, i) => {
    if (d.speaker === prophet.name || d.speaker === target.name) return d;
    return { ...d, speaker: i % 2 === 0 ? prophet.name : target.name };
  });

  return fixedSpeakers.slice(0, 12);
}

function computeDebateScore(
  dialogues: DebateTurn[],
  target: Agent,
  strategy: Strategy
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  if (dialogues.length === 0) return { score: 0.2, reasons: ["对话为空，按低质量处理"] };

  const phases = new Set(dialogues.map((d) => normalizePhase(d.phase)));
  const phaseCoverage = phases.size / DEBATE_PHASES.length;
  if (phaseCoverage >= 0.8) reasons.push("覆盖了大部分辩论阶段");
  else reasons.push("阶段覆盖不足");

  const avgLen = dialogues.reduce((sum, d) => sum + d.text.length, 0) / dialogues.length;
  const lenScore = clamp01((avgLen - 14) / 45);
  reasons.push(lenScore > 0.6 ? "论述长度较充分" : "论述偏短");

  const speakers = new Set(dialogues.map((d) => d.speaker));
  const balanceScore = speakers.size >= 2 ? 1 : 0.4;
  reasons.push(balanceScore >= 1 ? "双方均有充分发言" : "发言分布失衡");

  const allText = dialogues.map((d) => d.text).join(" ");
  let strategyHit = 0.3;
  if (strategy === "logical" && /数据|因果|证据|样本|历史/i.test(allText)) strategyHit = 1;
  if (strategy === "emotional" && /担心|害怕|希望|错过|后悔/i.test(allText)) strategyHit = 1;
  if (strategy === "social_proof" && /多数|已经有|很多人|共识|群体/i.test(allText)) strategyHit = 1;
  if (strategy === "miracle" && /愿景|信念|奇迹|预言|命运/i.test(allText)) strategyHit = 1;
  reasons.push(strategyHit > 0.8 ? "策略命中较好" : "策略命中一般");

  const targetFit =
    (target.riskTolerance < 0.4 && /风险|崩盘|防守/i.test(allText)) ||
    (target.conformityBias > 0.5 && /多数|共识|群体/i.test(allText)) ||
    (target.beliefStance < -0.2 && /反例|证据|历史/i.test(allText))
      ? 1
      : 0.45;
  reasons.push(targetFit > 0.8 ? "回应了目标画像特征" : "对目标画像利用有限");

  const score = clamp01(
    phaseCoverage * 0.25 +
      lenScore * 0.2 +
      balanceScore * 0.15 +
      strategyHit * 0.2 +
      targetFit * 0.2
  );
  return { score, reasons };
}

export async function generateDebate(
  prophet: Agent,
  target: Agent,
  strategy: Strategy,
  convertedRatio: number,
  secondaryStrategy?: Strategy,
  historicalCase?: typeof HISTORICAL_CASES[0],
  counterArgs?: string[]
): Promise<{
  dialogues: Dialogue[];
  phases: string[];
  historicalRef?: string;
  counterArgsUsed?: string[];
  debateScore: number;
  outputQuality: OutputQuality;
  decisionReason: string[];
}> {
  const strategyDesc = STRATEGY_LABELS[strategy];
  const secondaryDesc = secondaryStrategy ? STRATEGY_LABELS[secondaryStrategy] : "";
  const convertedPercent = Math.round(convertedRatio * 100);
  const histCase = historicalCase || pickHistoricalCase(strategy);
  const counterArgKeys = counterArgs || pickCounterArguments(target, strategy);
  const counterArgTexts = counterArgKeys
    .map((k) => `"${k}": "${COUNTER_ARGUMENT_TEMPLATES[k] || ""}"`)
    .join("\n");

  const systemPrompt = `你在模拟一场虚构社会实验里的辩论，不是投资建议。

你需要生成“自然辩论”，不是固定模板填空。
要求如下：
1) 角色：
- 说服者：${prophet.name}（${prophet.id !== "prophet" ? "传教士" : "先知"}）
- 目标者：${target.name}（${target.role}）
2) 策略：
- 主策略：${strategyDesc}
${secondaryDesc ? `- 副策略：${secondaryDesc}` : ""}
3) 目标画像：
- beliefStance=${target.beliefStance}
- riskTolerance=${target.riskTolerance}
- conformityBias=${target.conformityBias}
- stage=${target.stage}
- apostasyCount=${target.apostasyCount}
- 已转化比例=${convertedPercent}%
4) 历史案例：
- ${histCase.name}: ${histCase.desc}
5) 反对观点模板（按需自然融入，不要机械复读）：
${counterArgTexts}

阶段协议（必须覆盖但不要求固定发言顺序）：
- 识别目标 (Identify)
- 建立接触 (Approach)  // 通常由说服者发起
- 核心论证 (Argue)
- 反驳回应 (Counter)
- 总结定论 (Conclude)

输出必须是 JSON 对象，不得输出其他文本，格式：
{
  "dialogues": [
    {"speaker":"...", "phase":"识别目标 (Identify)", "text":"..."},
    {"speaker":"...", "phase":"建立接触 (Approach)", "text":"..."}
  ],
  "debateSummary":"一句话总结",
  "persuasionSignals":["..."],
  "riskFlags":["..."],
  "quality":{
    "coherence":0.0,
    "rebuttal":0.0,
    "personaFit":0.0,
    "targetFit":0.0,
    "overall":0.0
  }
}

硬约束：
- dialogues 总条数 8-12 条
- 每条 1-3 句中文
- 不做具体价格预测
- 双方都要有质疑与回应
- phase 必须覆盖全部五阶段
- speaker 只能是 "${prophet.name}" 或 "${target.name}"`;

  try {
    const response = await getClient().chat.completions.create({
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
      max_tokens: 1400,
      response_format: { type: "json_object" } as any,
    });

    const content = response.choices[0]?.message?.content?.trim() || "{}";
    const parsedResult = parseJsonSafe(content);
    const payload = (parsedResult.parsed || {}) as DebateModelResponse;

    const normalized = normalizeDialogues(payload.dialogues || [], prophet, target);
    if (normalized.length < 6) {
      throw new Error("invalid debate payload");
    }

    const phasesOrdered = Array.from(new Set(normalized.map((d) => normalizePhase(d.phase))));
    const dialogues: Dialogue[] = normalized.map((d) => ({
      speaker: d.speaker,
      text: d.text.startsWith("【") ? d.text : `【${normalizePhase(d.phase).split(" ")[0]}】${d.text}`,
    }));

    const ruleScore = computeDebateScore(normalized, target, strategy);
    const modelOverall = clamp01(Number(payload.quality?.overall ?? 0));
    const finalDebateScore =
      modelOverall > 0 ? clamp01(ruleScore.score * 0.6 + modelOverall * 0.4) : ruleScore.score;
    const reasons = [...ruleScore.reasons];
    if (modelOverall > 0) reasons.push(`模型自评质量=${modelOverall.toFixed(2)}`);
    if (payload.debateSummary) reasons.push(`总结：${payload.debateSummary}`);

    return {
      dialogues,
      phases: phasesOrdered.length > 0 ? phasesOrdered : DEBATE_PHASES,
      historicalRef: histCase.name,
      counterArgsUsed: counterArgKeys,
      debateScore: finalDebateScore,
      outputQuality: parsedResult.quality,
      decisionReason: reasons,
    };
  } catch (error) {
    console.error("LLM call failed:", error);
    const fallbackTurns: DebateTurn[] = [
      { speaker: prophet.name, phase: "识别目标 (Identify)", text: `${target.name}，我知道你对叙事持保留态度。` },
      { speaker: prophet.name, phase: "建立接触 (Approach)", text: "先不谈结论，我们从你最在意的风险说起。" },
      { speaker: target.name, phase: "建立接触 (Approach)", text: "可以，但别给我喊口号。" },
      { speaker: prophet.name, phase: "核心论证 (Argue)", text: `历史上的${histCase.name}说明，叙事会先改变行为，再影响价格与共识。` },
      { speaker: target.name, phase: "反驳回应 (Counter)", text: "这听起来仍像是情绪交易，不够扎实。" },
      { speaker: prophet.name, phase: "反驳回应 (Counter)", text: COUNTER_ARGUMENT_TEMPLATES[counterArgKeys[0]] || "这是社会实验，不是投资推荐。" },
      { speaker: prophet.name, phase: "核心论证 (Argue)", text: secondaryStrategy ? `我会补充${STRATEGY_LABELS[secondaryStrategy]}这个角度。` : "我再给你一个可验证的判断框架。" },
      { speaker: target.name, phase: "总结定论 (Conclude)", text: "我不完全认同，但你的论证比我预期更有结构。" },
      { speaker: prophet.name, phase: "总结定论 (Conclude)", text: "你不需要立刻认同，只要继续检验这个叙事是否在改变群体行为。" },
    ];
    const ruleScore = computeDebateScore(fallbackTurns, target, strategy);
    return {
      dialogues: fallbackTurns.map((d) => ({ speaker: d.speaker, text: `【${normalizePhase(d.phase).split(" ")[0]}】${d.text}` })),
      phases: DEBATE_PHASES,
      historicalRef: histCase.name,
      counterArgsUsed: counterArgKeys,
      debateScore: ruleScore.score,
      outputQuality: "fallback",
      decisionReason: [...ruleScore.reasons, "使用了fallback辩论生成"],
    };
  }
}

export async function generateFactionDebate(
  attacker: Agent,
  defender: Agent,
  convertedRatio: number
): Promise<Dialogue[]> {
  const systemPrompt = `你在生成教派辩论，输出 JSON 对象：
{
  "dialogues":[
    {"speaker":"${attacker.name}","text":"..."},
    {"speaker":"${defender.name}","text":"..."}
  ]
}
约束：
- 共 4-6 段
- speaker 只能是 "${attacker.name}" 或 "${defender.name}"
- 每段 1-3 句中文
- 不要价格预测`;

  try {
    const response = await getClient().chat.completions.create({
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
      max_tokens: 600,
      response_format: { type: "json_object" } as any,
    });
    const content = response.choices[0]?.message?.content?.trim() || "{}";
    const parsed = parseJsonSafe(content).parsed as { dialogues?: Dialogue[] } | null;
    const dialogues = (parsed?.dialogues || []).filter(
      (d) => d && typeof d.speaker === "string" && typeof d.text === "string"
    );
    if (dialogues.length >= 4) return dialogues.slice(0, 6);
  } catch {
    // fallback below
  }

  return [
    { speaker: attacker.name, text: "你的立场站不住脚，趋势正在改变。" },
    { speaker: defender.name, text: "我有我自己的判断，不需要你来教我。" },
    { speaker: attacker.name, text: "事实会证明一切的。" },
    { speaker: defender.name, text: "那我们走着瞧。" },
  ];
}

export async function generateFutureNews(
  agents: Agent[],
  round: number,
  convertedRatio: number
): Promise<NewsItem> {
  const convertedPercent = Math.round(convertedRatio * 100);
  const systemPrompt = `你是虚构实验记者，输出 JSON：
{
  "headline":"15字内",
  "content":"50-80字",
  "sentiment":"bullish|bearish|neutral"
}
状态：第${round}轮，转化率${convertedPercent}%`;

  try {
    const response = await getClient().chat.completions.create({
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.85,
      max_tokens: 300,
      response_format: { type: "json_object" } as any,
    });
    const content = response.choices[0]?.message?.content?.trim() || "{}";
    const parsed = parseJsonSafe(content).parsed as any;
    return {
      id: Date.now(),
      headline: parsed?.headline || "教内又有新动态",
      content: parsed?.content || "牛市预演教持续运转中。",
      timestamp: Date.now(),
      round,
      sentiment: parsed?.sentiment || "neutral",
    };
  } catch {
    return {
      id: Date.now(),
      headline: convertedRatio > 0.5 ? "牛市信仰持续蔓延" : "怀疑派仍在坚守阵地",
      content: `第${round}轮辩论结束后，${convertedPercent}%的Agent已加入牛市预演教。${convertedRatio > 0.5 ? "叙事正在形成不可逆的共识。" : "理性与信仰的对决仍在继续。"}`,
      timestamp: Date.now(),
      round,
      sentiment: convertedRatio > 0.6 ? "bullish" : convertedRatio < 0.3 ? "bearish" : "neutral",
    };
  }
}

export async function generateScripture(
  agents: Agent[],
  round: number,
  event?: string
): Promise<Scripture> {
  const convertedPercent = Math.round((agents.filter((a) => a.stage >= "S3").length / agents.length) * 100);
  const systemPrompt = `你是虚构教会文案，输出 JSON：
{
  "title":"5-10字",
  "content":"3-5句话"
}
状态：第${round}轮，转化率${convertedPercent}%。
${event ? `事件：${event}` : ""}`;

  try {
    const response = await getClient().chat.completions.create({
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.88,
      max_tokens: 320,
      response_format: { type: "json_object" } as any,
    });
    const content = response.choices[0]?.message?.content?.trim() || "{}";
    const parsed = parseJsonSafe(content).parsed as any;
    return {
      id: Date.now(),
      title: parsed?.title || "第一章：信仰的种子",
      content: parsed?.content || "当怀疑的黑夜最深时，信仰的光芒便最为耀眼。持守者终将看见应许之地。",
      author: "以利亚",
      round,
      timestamp: Date.now(),
    };
  } catch {
    return {
      id: Date.now(),
      title: `第${round}章：试炼之路`,
      content: "凡在熊市中持守信念者有福了，因为牛市终将降临。疑惑者将看见，嘲笑者将沉默，而信徒将得着冠冕。",
      author: "以利亚",
      round,
      timestamp: Date.now(),
    };
  }
}

