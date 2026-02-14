import OpenAI from "openai";
import { Agent, Strategy, Dialogue } from "./agents";

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

export async function generateDebate(
  prophet: Agent,
  target: Agent,
  strategy: Strategy,
  convertedRatio: number
): Promise<Dialogue[]> {
  const strategyDesc = STRATEGY_LABELS[strategy];
  const convertedPercent = Math.round(convertedRatio * 100);

  const systemPrompt = `你正在模拟一场"牛市预演教"的说服辩论实验。这是一个虚构的社会实验，观察叙事如何影响信念。

角色1 — 先知"${prophet.name}"：
- 立场：坚定看多（beliefStance: ${prophet.beliefStance}）
- 当前策略：${strategyDesc}
- 已有 ${convertedPercent}% 的参与者被说服

角色2 — "${target.name}"（${target.role}）：
- 当前信仰倾向：${target.beliefStance}（-1 = 极端怀疑，+1 = 极端乐观）
- 风险容忍度：${target.riskTolerance}
- 从众倾向：${target.conformityBias}
- 当前阶段：${target.stage}

请生成 4 段对话（2轮交锋）：
1. ${prophet.name} 发言（用${strategy}策略说服）
2. ${target.name} 回应（根据性格特征回应）
3. ${prophet.name} 再次发言（针对回应调整论点）
4. ${target.name} 最终回应

要求：
- 每段对话 2-3 句话，简洁有力
- 不要提及具体价格预测
- 体现策略特征和角色性格差异
- 用中文对话

严格按以下 JSON 格式输出，不要输出其他内容：
[
  {"speaker": "${prophet.name}", "text": "..."},
  {"speaker": "${target.name}", "text": "..."},
  {"speaker": "${prophet.name}", "text": "..."},
  {"speaker": "${target.name}", "text": "..."}
]`;

  try {
    const response = await getClient().chat.completions.create({
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.8,
      max_tokens: 600,
    });

    const content = response.choices[0]?.message?.content?.trim() || "[]";

    // 尝试解析 JSON，处理可能的 markdown 包裹
    let jsonStr = content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const dialogues: Dialogue[] = JSON.parse(jsonStr);
    return dialogues;
  } catch (error) {
    console.error("LLM call failed:", error);
    // 降级：返回预设对话
    return [
      {
        speaker: prophet.name,
        text: `${target.name}，牛市的信号已经越来越明显了。你还要等到什么时候？`,
      },
      {
        speaker: target.name,
        text: "我需要看到更多的证据才能被说服。",
      },
      {
        speaker: prophet.name,
        text: "证据就在链上，每一笔交易都在告诉你方向。",
      },
      {
        speaker: target.name,
        text: "也许你说得有道理，我再想想。",
      },
    ];
  }
}
