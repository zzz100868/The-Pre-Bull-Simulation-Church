# Hackathon PRD Alignment (religion.fun)

更新日期：2026-02-15  
项目：Pre-Bull Simulation Church

## 1. 审查结论

- 结论：核心功能整体已达标，PRD 的 Core Requirements 和 Bonus Points 基本覆盖。
- 风险：目前更像“功能完整的模拟器”，但在“评委可验证性”和“稳定复现（3 个转化）”上仍有明显提升空间。
- 建议：优先补 P0 项（见第 4 节），可显著提升比赛现场通过率。

## 2. PRD 要求映射

### 2.1 Core Requirements

| PRD 条款 | 状态 | 代码/文档证据 | 备注 |
|---|---|---|---|
| 创建带宗教叙事的独特 Token | ✅ | `contracts/contracts/PBT.sol`, `README.md` | PBT 已部署测试网并用于转化记录 |
| 实现多种说服策略（逻辑/情绪/社会证明/神迹） | ✅ | `backend/src/persuasion.ts`, `backend/src/llm.ts` | 主策略 + 副策略组合 |
| 响应反对观点与竞争性宗教主张 | ✅ | `backend/src/persuasion.ts`, `backend/src/llm.ts` | 有反驳模板 + 教派辩论 |
| 跟踪 conversion metrics（认可/投资/推广） | ✅ | `backend/src/agents.ts`, `backend/src/index.ts` | stage、invested、promotion、leaderboard 完整 |
| 与其他宗教 agent 在共享空间辩论 | ⚠️ 部分 | `backend/src/index.ts`（faction debate） | 当前为系统内模拟，非外部 shared space |

### 2.2 Success Criteria

| PRD 条款 | 状态 | 风险点 |
|---|---|---|
| 成功转化至少 3 个 Agent | ⚠️ 可达但不保证 | 当前含随机性，比赛现场可能波动 |
| 展示多样说服技术 | ✅ | 已支持 4 策略 + 副策略 |
| 叙事一致且自洽 | ✅ | 文档与 prompt 框架较完整 |
| 处理神学辩论与批评 | ✅ | 反驳模板 + faction debate |

### 2.3 Bonus Points

| PRD 条款 | 状态 | 代码/文档证据 |
|---|---|---|
| 联盟/结盟 | ✅ | `shouldFormAlliance`, `createAlliance` |
| 分裂/宗派改革 | ✅ | `shouldSplit`, `splitAlliance` |
| 传教士行为 | ✅ | `getMissionaryAgents`, `isMissionary` |
| 动态经文/预言生成 | ✅ | `generateScripture`, `/api/generate-scripture` |

## 3. 文档层发现的问题

- `architecture_feishu.md` 同时包含多版本内容（含历史草案），部分描述与当前实现不完全一致。
- 文档中仍存在“旧计划内容”和“现状内容”混排，评委阅读成本较高。
- 缺少“一页式评委说明”，例如：
  - 如何在 3 分钟内验证成功标准
  - 如何快速看到链上证据与 API 指标

## 4. 推荐补充功能（按优先级）

## P0（比赛前强烈建议）

1. 可复现 Demo 模式（保证 >=3 转化）
- 目标：现场演示稳定命中 PRD 成功标准。
- 做法：增加 `DEMO_MODE=true` 或固定随机种子；在 Demo 模式下将关键概率调优到可稳定达标。
- 涉及文件：`backend/src/index.ts`, `backend/src/persuasion.ts`, `README.md`。

2. 一键评委视图 / 评估摘要接口
- 目标：让评委快速看到“是否达标”。
- 做法：新增 `/api/judge-summary`，直接返回：
  - convertedCount（是否 >=3）
  - strategyCoverage（4 策略覆盖情况）
  - conversionTimeline（每轮变化）
  - alliance/schism/missionary/scripture 触发次数
- 涉及文件：`backend/src/index.ts`, `backend/src/agents.ts`, `README.md`。

3. Demo Runbook 文档
- 目标：统一队友演示口径。
- 做法：新增 `docs/DEMO_RUNBOOK.md`（启动、点击顺序、预期结果、失败兜底）。

## P1（可明显加分）

1. 状态持久化（最小版）
- 目标：避免服务重启后数据丢失。
- 做法：内存快照定时写入 JSON 文件（无需上 DB）。

2. 基础测试
- 目标：降低临场改动风险。
- 做法：至少补 3 类测试：
  - `shouldConvert` 概率边界测试
  - `/api/round` 数据结构测试
  - `/api/status` 回归测试

3. LLM 失败降级说明
- 目标：评委网络不稳定时仍可完整跑 Demo。
- 做法：将当前 fallback 机制写入 README，并提供 `MOCK_LLM=true`。

## P2（赛后或时间富余）

1. 外部 shared space 适配
- 例如对接一个 Discord/Telegram channel bot，实现“真实共享空间辩论”证据。

2. 观测与审计
- 增加结构化日志、回合 traceId、可导出的实验报告（CSV/JSON）。

## 5. 最小改动建议（你现在就可以做）

如果只剩很少时间，优先做这三件：

1. `DEMO_MODE` 可复现开关（保证 3 转化）
2. `judge-summary` 接口（评委可直接验收）
3. `DEMO_RUNBOOK.md`（统一演示话术）

这 3 项能显著提高“可验收性”，通常比继续堆新功能更有效。
