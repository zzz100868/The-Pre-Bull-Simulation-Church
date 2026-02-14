# ⛪ 牛市预演教 DApp — Pre-Bull Simulation Church

> AI Agent 叙事说服实验 — 观察信念如何在辩论中传播

## 系统概述

一个基于 AI Agent 的社会实验平台，模拟"牛市信仰"在 6 个 AI Agent 之间通过辩论传播的过程。先知"以利亚"使用 4 种策略（逻辑论证、情感打动、社会证明、奇迹叙事）说服其他 Agent 加入"牛市预演教"，所有转化行为记录在 Monad Testnet 链上。

## 技术栈

| 模块 | 技术 |
|------|------|
| Smart Contract | Solidity + Hardhat (ERC-20 PBT Token) |
| Backend | Node.js + Express + TypeScript |
| LLM | OpenAI GPT-4o-mini |
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
| `/api/start` | POST | 初始化 Agent，返回 agents + metrics |
| `/api/round` | POST | 执行一回合辩论，返回 debate + agents + metrics |
| `/api/status` | GET | 返回完整状态 |
| `/api/debates` | GET | 返回所有辩论记录 |

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

## 项目结构

```
monadaiagent/
├── contracts/          # Solidity 合约 + Hardhat
│   ├── contracts/PBT.sol
│   ├── scripts/deploy.ts
│   └── hardhat.config.ts
├── backend/            # Express API 服务
│   └── src/
│       ├── index.ts    # API入口 (4个接口)
│       ├── agents.ts   # Agent 定义 + 状态管理
│       ├── persuasion.ts # 策略选择 + 转化判定
│       ├── llm.ts      # OpenAI 对话生成
│       └── chain.ts    # 合约交互 (mint/record)
├── frontend/           # Next.js 前端
│   └── src/app/
│       ├── page.tsx    # Dashboard + Debate Arena
│       └── layout.tsx
└── README.md
```

## 注意事项

⚠️ **Simulation / Fiction / Not Financial Advice**

这是一个虚构的社会实验项目，用于观察叙事如何影响信念传播。不涉及任何真实的金融建议或价格预测。
