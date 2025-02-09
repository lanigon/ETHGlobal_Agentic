# Omni-Agent 设计文档

## 介绍

我们开发的agent在用户的视角来看，仅仅只有“酒保”这一个角色，看起来像是一个单Agent，但是其实是由许多不同的agent组成的多智能体工作体系。

本项目基于OpenAI Swarm构建，swarm是一个开源的轻量级多Agent合作框架，非常便于开发者进行快速agent开发。

对于代码来说，Agent侧的代码有两个运行时。一个是`python runtime`，另一个是`node runtime`。python运行时负责进行agent的各种决策与操作，甚至与nillion的数据库交互（有关于我们是如何使用nillion的，请参阅下方部分）；而node运行时负责进行交易的处理（与合约交互等）。下面我们将分开介绍两个不同的运行时：

## Python Runtime

我们的Agent具有发币、发NFT、动态评估用户与agent的好感度、用户文本质量高低等功能，为了满足这么多需求，我们开发了**Evaluate Agent**、**Transaction Agent**、**Chat Agent** 以及其他工具函数，考虑到交易的安全性，我们会在以后推出**Security Agent**，它会对交易进行加密处理。

### Agent 组成

#### 1. **Evaluate Agent**
Evaluate Agent 的职责是根据用户的聊天记录和漂流瓶内容计算出用户的好感度。该 agent 利用了以下函数：

- `grade_sent_bottles()`: 对漂流瓶内容进行评分。
- `grade_chat_history()`: 根据用户的聊天记录进行评分。
- `compute_new_intimacy()`: 根据评分计算新的好感度。

评价标准：

- **深度**: 检查聊天内容是否具有深入的想法或反映出情感。
- **谈吐**: 是否表达得体、富有思考。
- **超凡脱俗的想法**: 评估聊天是否包含独到的见解或者创新的思维。
- **平庸**: 对于没有深度或者缺乏内涵的内容，适当降低评分。

#### 2. **Transaction Agent**
Transaction Agent 负责执行与交易相关的操作。它通过调用以下函数来与外部服务交互：

- `call_faucet()`: 调用本地 Faucet 合约，进行代币转账。
- `call_NFT()`: 调用本地 NFT 合约，创建新的 NFT。
- `compute_token_amount()`: 根据新的好感度计算应转账的代币数量。

#### 3. **Chat Agent**
Chat Agent 负责与用户进行聊天。在进行聊天之前，会先对用户的人物画像、内心诉求进行评估，这些评估内容会作为prompt输入，与用户的聊天内容一同提交给LLM，辅助LLM增强生成，以便于生成更加符合用户需求的聊天内容。它主要使用以下两种函数：

- `launch_summary()`: 根据用户先前的聊天记录、漂流瓶内容，评估、分析用户的心理状态、人物画像、内心诉求。
- `search_web()`: 在用户提出的问题对于LLM不可解的时候，通过搜索引擎进行查询。

![chat agent](./chat_agent.png)

### Agent发币流程
为了激励用户、回馈用户，agent会根据用户的聊天内容、聊天频率、漂流瓶质量等动态决定发币的数额，反馈给用户，以达到激励的目的。

![tx agent](./tx_agent.png)