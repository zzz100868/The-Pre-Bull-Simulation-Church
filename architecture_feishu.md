# Pre-Bull Simulation Church - 项目主文档（唯一文档源）

更新时间：2026-02-15
维护约定：本项目所有产品、架构、接口、规则、演示信息统一维护在本文件。

## 1. 项目定位

Pre-Bull Simulation Church 是一个多 Agent 叙事说服实验平台。
核心目标是模拟“牛市叙事”如何在 6 个 AI Agent 间传播，并追踪转化、反转化、联盟、教派辩论等动态。

关键边界：
- 这是虚构实验，不是投资建议。
- PBT 是实验内度量与互动代币，不代表真实金融价值。
- 系统输出包含 AI 生成内容（辩论、新闻、经文）。

## 2. 技术架构

### 2.1 分层

1. 前端层（Next.js）
- 展示 Dashboard、Debate Arena、Agent 状态、策略统计。
- 通过 REST API 拉取状态并驱动可视化。

2. 后端层（Node.js + Express + TypeScript）
- 回合调度（/api/round）。
- Agent 状态机与指标计算。
- LLM 调用（辩论、新闻、经文）。
- 链上交互（mint PBT、记录 conversion 事件）。

3. 链上层（Monad Testnet）
- ERC-20 `PBT` 合约。
- `recordConversion` 事件记录实验转化行为。

### 2.2 目录结构

```text
The-Pre-Bull-Simulation-Church/
├─ contracts/
│  ├─ contracts/PBT.sol
│  ├─ scripts/deploy.ts
│  └─ hardhat.config.ts
├─ backend/
│  └─ src/
│     ├─ index.ts
│     ├─ agents.ts
│     ├─ persuasion.ts
│     ├─ llm.ts
│     └─ chain.ts
├─ frontend/
│  └─ src/app/
│     ├─ page.tsx
│     ├─ globals.css
│     └─ layout.tsx
├─ architecture_feishu.md  (唯一主文档)
└─ README.md               (入口说明)
```

## 3. 环境与启动

### 3.1 依赖安装

```bash
cd contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

### 3.2 后端环境变量

后端 `.env` 需至少包含：
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`（可选，默认 OpenAI）
- `LLM_MODEL`（默认 `gpt-4o-mini`）
- `PRIVATE_KEY`（链上模式）
- `PBT_CONTRACT_ADDRESS`（链上模式）

### 3.3 合约部署（可选）

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network monadTestnet
```

### 3.4 启动服务

```bash
cd backend
npm run dev
# http://localhost:3001

cd ../frontend
npm run dev
# http://localhost:3000
```

## 4. 核心接口

### 4.1 主要 API

- `POST /api/start`：初始化实验状态。
- `POST /api/round`：执行一回合（核心入口）。
- `GET /api/status`：返回全量状态（agents/debates/metrics/news/scriptures/alliances/conclusion）。
- `GET /api/debates`：辩论记录。
- `GET /api/leaderboard`：多维榜单。
- `GET /api/conclusion`：实验结论。
- `GET /api/news`：未来新闻。
- `GET /api/scriptures`：经文列表。
- `GET /api/alliances`：联盟信息。
- `GET /api/narrative-bias`：叙事偏差历史。
- `POST /api/apostasy`：手动触发叛教。
- `POST /api/generate-scripture`：手动生成经文。

### 4.2 `/api/round` 回合流程

1. 选择 target（可转化对象）。
2. 选择 persuader（先知或传教士）。
3. 选择主策略 + 副策略。
4. 调用 LLM 生成辩论内容。
5. 判定是否转化，更新 stage、belief、faction。
6. 链上 mint 与 conversion 记录（失败可降级 mock）。
7. 叛教检测与降级。
8. 联盟形成/分裂检测。
9. 更新精神市值与叙事偏差。
10. 生成新闻与经文。
11. 每 5 轮触发一次多教派辩论。

## 5. Agent 体系

### 5.1 固定 6 个 Agent

- `prophet`：先知，初始高信念。
- `skeptic-1`
- `neutral-1`
- `neutral-2`
- `skeptic-2`
- `realist`

### 5.2 状态与阵营

- Stage：`S0` ~ `S4`
- Faction：`pre-bull | neutral | realist`
- 关键属性：`beliefStance`、`riskTolerance`、`conformityBias`、`pbtBalance`、`apostasyCount` 等。

### 5.3 关键数据结构

- `Agent`
- `DebateRecord`
- `NewsItem`
- `Scripture`
- `Alliance`
- `Metrics`
- `ExperimentConclusion`

定义位于：`backend/src/agents.ts`

## 6. 说服与转化机制

### 6.1 四种策略

- `logical`
- `emotional`
- `social_proof`
- `miracle`

当前后端为“主策略 + 副策略”组合。
策略选择与转化概率逻辑位于：`backend/src/persuasion.ts`

### 6.2 当前转化判定（现状）

- `generateDebate` 负责生成对话文本。
- `shouldConvert` 负责概率判定。

说明：当前“对话质量”对转化结果影响较弱，后续将按第 10 章方案优化。

## 7. 19 项能力（现状）

1. 精神市值系统
2. 叛教与降级
3. 实验结论与失败机制
4. 叙事偏差记录
5. 任务奖励体系
6. Token 权重影响
7. 多策略组合
8. 历史案例注入
9. 多维榜单
10. 新闻生成
11. 反对观点模板
12. 策略成功率统计
13. 阵营流动
14. 五步辩论协议
15. 多教派辩论
16. 联盟与分裂
17. 传教士行为
18. 经文/预言生成
19. 风险声明展示

## 8. 合约设计

合约：`contracts/contracts/PBT.sol`

关键能力：
- `mint(address to, uint256 amount)`
- `recordConversion(string agentId)` 触发事件

用途：
- 记录实验代币与转化行为。
- 不用于真实投资场景。

## 9. 演示建议（当前）

最短演示路径：
1. `POST /api/start`
2. 连续调用 `POST /api/round` 5~15 次
3. 用 `GET /api/status` 展示：
- 转化人数
- 策略统计
- 辩论记录
- 联盟变化
- 新闻/经文内容

## 10. 后端重构计划（已确认）

### 10.1 主要问题

1. LLM 对话与转化结果因果弱。
2. Prompt 过硬（固定轮次和发言顺序）。
3. JSON 解析脆弱（正则 + parse）。
4. 策略命中与语境绑定不足。

### 10.2 改造目标

1. 建立“辩论质量 -> 转化结果”的可解释因果。
2. 提升输出稳定性与解析成功率。
3. 保留现有玩法并兼容前端。

### 10.3 分阶段方案

Phase 1（先落地）
- `shouldConvert` 拆成基础分 `baseScore`。
- 新增 `finalScore` 与 `decisionBreakdown`。
- LLM 输出增加严格校验、重试、降级。

Phase 2（质量提升）
- 引入 `debateScore`，与 `baseScore` 融合决策。
- Prompt 改为半结构化，不再硬锁 10 段固定顺序。

Phase 3（演示与复盘）
- 参数化阈值与调试开关。
- 增加可回放日志或 summary 接口。

## 11. 风险声明

Simulation / Fiction / Not Financial Advice

本项目是 AI 叙事实验，不构成投资建议。
所有市场相关内容、新闻和经文均为实验性虚构文本。

## 12. 文档维护规则

1. 禁止将项目核心信息分散到其他说明文档。
2. 新功能上线必须同步更新本文件。
3. 若代码与文档冲突，以代码行为为准，并在本文件修正。
