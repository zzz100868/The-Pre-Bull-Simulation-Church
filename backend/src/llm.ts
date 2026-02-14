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
  logical: "逻辑论证 — 用数据和道理说服",
  emotional: "情感打动 — 唤起恐惧错过和希望",
  social_proof: "社会证明 — 强调已有多少人加入",
  miracle: "奇迹叙事 — 用宏大愿景和信仰感召",
};

// #14 辩论5步协议
const DEBATE_PHASES = [
  "识别目标 (Identify)",
  "建立接触 (Approach)",
  "核心论证 (Argue)",
  "反驳回应 (Counter)",
  "总结定论 (Conclude)",
];

// #8 选择相关历史案例
function pickHistoricalCase(strategy: Strategy): typeof HISTORICAL_CASES[0] {
  const idx = Math.floor(Math.random() * HISTORICAL_CASES.length);
  return HISTORICAL_CASES[idx];
}

// #11 选择反对观点模板
function pickCounterArguments(target: Agent): string[] {
  const keys = Object.keys(COUNTER_ARGUMENT_TEMPLATES);
  const selected: string[] = [];
  // 根据 target 特征选相关反驳
  if (target.riskTolerance < 0.4) selected.push("市场会崩盘");
  if (target.beliefStance < -0.3) selected.push("空气币");
  if (target.conformityBias > 0.5) selected.push("FOMO陷阱");
  if (selected.length === 0) selected.push(keys[Math.floor(Math.random() * keys.length)]);
  return selected;
}

// #14 5步辩论生成（主辩论函数）
export async function generateDebate(
  prophet: Agent,
  target: Agent,
  strategy: Strategy,
  convertedRatio: number,
  secondaryStrategy?: Strategy,
  historicalCase?: typeof HISTORICAL_CASES[0],
  counterArgs?: string[]
): Promise<{ dialogues: Dialogue[]; phases: string[]; historicalRef?: string; counterArgsUsed?: string[] }> {
  const strategyDesc = STRATEGY_LABELS[strategy];
  const secondaryDesc = secondaryStrategy ? STRATEGY_LABELS[secondaryStrategy] : "";
  const convertedPercent = Math.round(convertedRatio * 100);

  // 选历史案例和反驳模板
  const histCase = historicalCase || pickHistoricalCase(strategy);
  const counterArgKeys = counterArgs || pickCounterArguments(target);
  const counterArgTexts = counterArgKeys.map((k) => `"${k}": ${COUNTER_ARGUMENT_TEMPLATES[k] || ""}`).join("\n");

  const systemPrompt = `你正在模拟一场"牛市预演教"的说服辩论实验。这是一个虚构的社会实验，观察叙事如何影响信念。

=== 辩论5步协议 ===
本场辩论必须严格按照以下5个阶段进行：
1. 识别目标：说服者分析对手，表明意图
2. 建立接触：用破冰话术接近对手
3. 核心论证：用策略展开主要论点
4. 反驳回应：对手提出质疑，说服者反驳
5. 总结定论：双方各做最终陈述

=== 角色设定 ===
角色1 — "${prophet.name}"（说服者）${prophet.id !== "prophet" ? "【传教士 — 已被说服、转而传教的前怀疑者】" : "【先知】"}：
- 立场：坚定看多（beliefStance: ${prophet.beliefStance}）
- 主策略：${strategyDesc}
${secondaryDesc ? `- 辅助策略：${secondaryDesc}` : ""}
- 已有 ${convertedPercent}% 的参与者被说服

角色2 — "${target.name}"（${target.role}）：
- 当前信仰倾向：${target.beliefStance}（-1 = 极端怀疑，+1 = 极端乐观）
- 风险容忍度：${target.riskTolerance}
- 从众倾向：${target.conformityBias}
- 当前阶段：${target.stage}
- 叛教次数：${target.apostasyCount}

=== 历史案例参考 ===
请在论证中引用此历史案例："${histCase.name}"：${histCase.desc}

=== 反对观点回应参考 ===
如果对手提出以下质疑，请参考模板回应：
${counterArgTexts}

=== 输出要求 ===
请生成 10 段对话（5轮交锋，对应5个阶段），每段标明阶段：

严格按以下 JSON 格式输出，不要输出其他内容：
[
  {"speaker": "${prophet.name}", "text": "【识别目标】..."},
  {"speaker": "${target.name}", "text": "【建立接触】..."},
  {"speaker": "${prophet.name}", "text": "【核心论证】...引用历史案例..."},
  {"speaker": "${target.name}", "text": "【核心论证】...提出质疑..."},
  {"speaker": "${prophet.name}", "text": "【反驳回应】...使用反驳模板..."},
  {"speaker": "${target.name}", "text": "【反驳回应】..."},
  {"speaker": "${prophet.name}", "text": "【核心论证】...${secondaryStrategy ? "使用辅助策略" : "深化论点"}..."},
  {"speaker": "${target.name}", "text": "【反驳回应】..."},
  {"speaker": "${prophet.name}", "text": "【总结定论】..."},
  {"speaker": "${target.name}", "text": "【总结定论】..."}
]

要求：
- 每段对话 2-3 句话，简洁有力
- 不要提及具体价格预测
- 必须引用给定的历史案例
- 如果对手质疑，使用反对观点回应模板来反驳
- 体现策略特征和角色性格差异
- 用中文对话`;

  try {
    const response = await getClient().chat.completions.create({
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.8,
      max_tokens: 1200,
    });

    const content = response.choices[0]?.message?.content?.trim() || "[]";
    let jsonStr = content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const dialogues: Dialogue[] = JSON.parse(jsonStr);
    return {
      dialogues,
      phases: DEBATE_PHASES,
      historicalRef: histCase.name,
      counterArgsUsed: counterArgKeys,
    };
  } catch (error) {
    console.error("LLM call failed:", error);
    return {
      dialogues: [
        { speaker: prophet.name, text: `【识别目标】${target.name}，我注意到你还没看到大趋势。让我来分享一些观察。` },
        { speaker: target.name, text: `【建立接触】你是谁？为什么觉得你能说服我？` },
        { speaker: prophet.name, text: `【核心论证】历史上${histCase.name}告诉我们——${histCase.desc} 但聪明人知道在崩盘前上车。` },
        { speaker: target.name, text: `【核心论证】这不就是空气币吗？历史案例那些人最后都亏了。` },
        { speaker: prophet.name, text: `【反驳回应】${COUNTER_ARGUMENT_TEMPLATES["空气币"] || "PBT记录的是信仰传播，不是金融产品。"}` },
        { speaker: target.name, text: `【反驳回应】好吧，这个角度我没想过。但我还是很谨慎。` },
        { speaker: prophet.name, text: `【核心论证】谨慎是好事。但已有${convertedPercent}%的人选择了加入。你确定要做剩下的少数吗？` },
        { speaker: target.name, text: `【反驳回应】你在用从众压力。我不会因为别人做了就跟风。` },
        { speaker: prophet.name, text: `【总结定论】我不是让你跟风——我是让你参与观察叙事如何改变不同人的选择。这本身就有价值。` },
        { speaker: target.name, text: `【总结定论】也许你说得有道理，我会再考虑一下。` },
      ],
      phases: DEBATE_PHASES,
      historicalRef: histCase.name,
      counterArgsUsed: counterArgKeys,
    };
  }
}

// #15 多教派辩论 — 非 prophet 发起的辩论
export async function generateFactionDebate(
  attacker: Agent,
  defender: Agent,
  convertedRatio: number
): Promise<Dialogue[]> {
  const systemPrompt = `你正在模拟一场教派间辩论。

${attacker.name}（${attacker.faction === "pre-bull" ? "牛市预演教" : attacker.faction === "realist" ? "现实主义派" : "中立派"}）
vs
${defender.name}（${defender.faction === "pre-bull" ? "牛市预演教" : defender.faction === "realist" ? "现实主义派" : "中立派"}）

${attacker.name} 信仰 ${attacker.beliefStance}，${defender.name} 信仰 ${defender.beliefStance}。
这是两个 AI Agent 之间关于市场信仰的辩论。

生成 4 段对话（2轮交锋），JSON格式：
[
  {"speaker": "${attacker.name}", "text": "..."},
  {"speaker": "${defender.name}", "text": "..."},
  {"speaker": "${attacker.name}", "text": "..."},
  {"speaker": "${defender.name}", "text": "..."}
]
用中文，每段2-3句。`;

  try {
    const response = await getClient().chat.completions.create({
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.8,
      max_tokens: 500,
    });
    const content = response.choices[0]?.message?.content?.trim() || "[]";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
  } catch {
    return [
      { speaker: attacker.name, text: "你的立场站不住脚，趋势正在改变。" },
      { speaker: defender.name, text: "我有我自己的判断，不需要你来教我。" },
      { speaker: attacker.name, text: "事实会证明一切的。" },
      { speaker: defender.name, text: "那我们走着瞧。" },
    ];
  }
}

// #10 未来新闻生成
export async function generateFutureNews(
  agents: Agent[],
  round: number,
  convertedRatio: number
): Promise<NewsItem> {
  const convertedPercent = Math.round(convertedRatio * 100);
  const systemPrompt = `你是一个虚构世界的新闻记者，报道"牛市预演教"实验的最新进展。

当前状态：
- 第 ${round} 轮
- 转化率 ${convertedPercent}%
- 主流教派人数分布：${agents.filter((a) => a.faction === "pre-bull").length} 牛市 / ${agents.filter((a) => a.faction === "neutral").length} 中立 / ${agents.filter((a) => a.faction === "realist").length} 现实

请生成1条虚构的未来新闻，JSON格式：
{
  "headline": "新闻标题 (15字以内)",
  "content": "新闻正文 (50-80字)",
  "sentiment": "bullish 或 bearish 或 neutral"
}

注意：这是虚构实验，不是真实市场预测。用幽默和讽刺的语气。`;

  try {
    const response = await getClient().chat.completions.create({
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.9,
      max_tokens: 300,
    });
    const content = response.choices[0]?.message?.content?.trim() || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    return {
      id: Date.now(),
      headline: parsed.headline || "教内又有新动态",
      content: parsed.content || "牛市预演教持续运转中。",
      timestamp: Date.now(),
      round,
      sentiment: parsed.sentiment || "neutral",
    };
  } catch {
    const sentiments: NewsItem["sentiment"][] = ["bullish", "bearish", "neutral"];
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

// #18 经文/预言生成
export async function generateScripture(
  agents: Agent[],
  round: number,
  event?: string
): Promise<Scripture> {
  const systemPrompt = `你是"牛市预演教"的经文撰写者。根据当前教会状态，撰写一段教会经文或预言。

当前状态：第 ${round} 轮，转化率 ${Math.round(agents.filter((a) => a.stage >= "S3").length / agents.length * 100)}%
${event ? `最新事件：${event}` : ""}

要求：
- 标题 (5-10字，有宗教/诗意感)
- 经文内容 (3-5句话，模仿圣经/预言风格)
- 带有对牛市的隐喻和信仰的表达

JSON格式：
{
  "title": "经文标题",
  "content": "经文内容"
}`;

  try {
    const response = await getClient().chat.completions.create({
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.9,
      max_tokens: 300,
    });
    const content = response.choices[0]?.message?.content?.trim() || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    return {
      id: Date.now(),
      title: parsed.title || "第一章：信仰的种子",
      content: parsed.content || "当怀疑的黑夜最深时，信仰的光芒便最为耀眼。持守者终将看见应许之地。",
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
