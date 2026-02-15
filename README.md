# ⛪ 牛市预演教 DApp — Pre-Bull Simulation Church

> AI Agent 叙事说服实验 — 观察信念如何在辩论中传播 — **19/19 功能全部实现**

## 系统概述

一个基于 AI Agent 的社会实验平台，模拟"牛市信仰"在 6 个 AI Agent 之间通过辩论传播的过程。先知"以利亚"及已转化的传教士使用 4 种策略（逻辑论证、情感打动、社会证明、奇迹叙事）的主+副双重组合说服其他 Agent 加入"牛市预演教"，所有转化行为记录在 Monad Testnet 链上。支持 5 步辩论协议、叛教机制、联盟与分裂、经文/新闻生成、精神市值系统等 19 项完整功能。

## Hackathon PRD 对照

- 审查文档：`docs/HACKATHON_PRD_ALIGNMENT.md`
- 内容包含：PRD 条款映射、当前缺口、优先级改进建议（P0/P1/P2）

## 技术栈

| 模块 | 技术 |
|------|------|
| Smart Contract | Solidity + Hardhat (ERC-20 PBT Token) |
| Backend | Node.js + Express + TypeScript |
| LLM | Moonshot AI (moonshot-v1-8k)，OpenAI 兼容接口 |
| Frontend | Next.js 14 + TailwindCSS |
| Blockchain | Monad Testnet (ethers.js v6) |
| Storage | 内存 JSON（无数据库） |

## 快速开始

### 1. 安装依赖

```bash
# 合约
cd contracts && npm install

# 后端
cd ../backend && npm install

# 前端
cd ../frontend && npm install
```

### 2. 配置环境变量

```bash
# 后端
cp backend/.env.example backend/.env
# 编辑 .env 填入：
# - OPENAI_API_KEY
# - PRIVATE_KEY (Monad Testnet 钱包私钥)
# - PBT_CONTRACT_ADDRESS (部署后获取)
```

### 3. 部署合约（可选，有 Mock 模式）

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network monadTestnet
# 将输出的合约地址填入 backend/.env
```

### 4. 启动后端

```bash
cd backend
npm run dev
# 服务运行在 http://localhost:3001
```

### 5. 启动前端

```bash
cd frontend
npm run dev
# 页面运行在 http://localhost:3000
```

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/start` | POST | 初始化 Agent，返回 agents + metrics + conclusion |
| `/api/round` | POST | 执行一回合（辩论+叛教+联盟+新闻+经文），返回全部数据 |
| `/api/status` | GET | 返回完整状态（agents/debates/metrics/news/scriptures/alliances/conclusion/narrativeBias） |
| `/api/debates` | GET | 返回所有辩论记录 |
| `/api/leaderboard` | GET | 返回 6 维度行为榜单 |
| `/api/conclusion` | GET | 返回实验结论（ongoing/bull_wins/failed/stalemate） |
| `/api/news` | GET | 返回 AI 生成的未来新闻 |
| `/api/scriptures` | GET | 返回教会经文列表 |
| `/api/alliances` | GET | 返回联盟信息 |
| `/api/narrative-bias` | GET | 返回叙事偏差历史记录 |
| `/api/apostasy` | POST | 手动触发指定 Agent 叛教 |
| `/api/generate-scripture` | POST | 手动生成一条新经文 |

## Agent 列表

| ID | 名字 | 角色 | 初始立场 |
|----|------|------|----------|
| prophet | 以利亚 | 先知 | +0.95 (坚定牛市) |
| skeptic-1 | 多马 | 怀疑者 | -0.50 |
| neutral-1 | 路得 | 中立 | 0.00 (高从众) |
| neutral-2 | 拿俄米 | 中立 | +0.10 |
| skeptic-2 | 约拿 | 怀疑者 | -0.30 |
| realist | 该隐 | 现实主义 | -0.80 |

## 说服策略

- **🧠 逻辑论证 (logical)** — 用数据和道理说服
- **❤️ 情感打动 (emotional)** — 唤起恐惧错过和希望
- **👥 社会证明 (social_proof)** — 强调已有多少人加入
- **✨ 奇迹叙事 (miracle)** — 用宏大愿景和信仰感召

每轮自动选择主策略 + 副策略组合，副策略提供额外转化加成。所有对话由 LLM 实时生成（非预写）。

## 已实现的 19 项功能

| # | 功能 | 说明 |
|---|------|------|
| 1 | 精神市值系统 | 精神市值 vs 实际PBT对比可视化 |
| 2 | 时间线切换/叛教 | Agent 信仰可回退，阻段降级 + 手动触发叛教 |
| 3 | 实验结论/失败机制 | 4种结局状态：进行中/牛市胜出/失败/僵局 |
| 4 | 叙事偏差记录 | 每轮记录各Agent偏差值，前端可视化展示 |
| 5 | 多元Token获取 | 6种任务奖励（辩论/见证/传教/联盟/经文/坚守） |
| 6 | Token权重 | PBT持有量影响说服成功率 |
| 7 | 多策略组合 | 主+副双策略，副策略提供额外加成 |
| 8 | 历史案例论证 | 6个历史案例注入LLM辩论 |
| 9 | 行为榜单 | 6维度排名（PBT/信仰/传教/推广/精神市值/任务） |
| 10 | 未来新闻生成 | 每轮LLM生成虚构新闻 |
| 11 | 反对观点回应模板 | 6个反驳模板注入prompt |
| 12 | 策略成功率统计 | 4种策略实时成功率进度条 |
| 13 | 阵营流动/叛教 | 自动叛教检测 + 手动叛教API |
| 14 | 辩论5步协议 | 识别→接触→论证→反驳→定论，10段对话 |
| 15 | 多教派辩论 | 每5轮触发非先知Agent间辩论 |
| 16 | 联盟与分裂 | 同派Agent自动组盟，信仰差异大时分裂 |
| 17 | 传教士行为 | 已转化Agent(S1+)可替代先知说服 |
| 18 | 经文/预言生成 | 每轮LLM生成 + 手动生成按钮 |
| 19 | 风险声明 UI | Landing页 + Footer 双重风险免责声明 |

## 项目结构

```
monadaiagent/
├── contracts/          # Solidity 合约 + Hardhat
│   ├── contracts/PBT.sol
│   ├── scripts/deploy.ts
│   └── hardhat.config.ts
├── backend/            # Express API 服务 (12个接口)
│   └── src/
│       ├── index.ts    # API入口 + 回合调度 + 19项功能编排
│       ├── agents.ts   # Agent定义 + 状态管理 + 精神市值 + 叙事偏差 + 联盟 + 榜单 + 结论
│       ├── persuasion.ts # 多策略组合 + 叛教判定 + 联盟形成/分裂 + 历史案例 + 反驳模板
│       ├── llm.ts      # LLM对话生成 (5步辩论 + 教派辩论 + 新闻 + 经文)
│       └── chain.ts    # 合约交互 (mint/record)
├── frontend/           # Next.js 前端 (19功能全可视)
│   └── src/app/
│       ├── page.tsx    # 1230行单页应用：Dashboard + Arena + 动态星空 + 新闻 + 经文 + 榜单 + 联盟
│       ├── globals.css # 宇宙星辰背景 + 动态星空Canvas + 动画 + 叛教脉冲样式
│       └── layout.tsx
├── architecture_feishu.md  # 架构文档
└── README.md
```

## 注意事项

⚠️ **Simulation / Fiction / Not Financial Advice**

本项目 ("牛市预演教 / Pre-Bull Simulation Church") 是一个虚构的社会实验，
旨在研究叙事说服如何影响 AI Agent 的信念和行为模式。
PBT Token 仅作为实验内部的度量工具，不具备任何真实金融价值。
所有"市值"、"预测"、"经文"和"新闻"均为 AI 自动生成的虚构内容。
不构成任何形式的投资建议。
