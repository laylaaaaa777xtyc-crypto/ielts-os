# IELTS OS

> 本地运行的个人 AI 雅思备考工作台，目标 Band 7.0。不用注册账号，数据只存在你自己的电脑上。
>
> A local-first personal IELTS study workbench. No account, no cloud — your records stay on your machine.

IELTS OS 是一个学习驾驶舱：把四科成绩、每日任务、学习日历、分数趋势、薄弱项和复习提醒放在同一个页面上。它围绕下面这条备考流程设计：

```
学习诊断 → 学习计划 → 每日任务 → 专项训练 → 全真模考 → 阶段报告
```

计划后续与开源的离线练习应用 [BandReady (ielts-prep)](https://github.com/Luxshan2000/ielts-prep) 对接，自动导入练习和模考成绩。

> ⚠️ 本项目与雅思官方（British Council、IDP、剑桥大学出版与考评院）无任何关联。应用里显示的分数都是**估计值**，只供练习参考，不代表官方成绩。

## ✨ 功能

### 已完成

- **Dashboard（`/`）**：目标分进度、四科估分、今日任务、学习日历与连续天数、分数趋势图、模考记录、薄弱项、单词和错题的待复习数量
- **学习计划（`/planner`）**：添加当天任务（按听力、阅读、写作、口语、词汇、复盘分类，记录时长），可以勾选完成或撤销，自动统计完成了多少分钟
- **本地 SQLite 数据库**：第一次启动时自动建表，不需要手动初始化
- **数据真实性标记**：每块数据都标明来源：`real` 是你的真实记录，`demo` 是演示数据，`none` 是暂无数据。演示数据有醒目标签，不会和真实成绩混在一起；没有数据时显示空状态，不编造分数

### 开发路线

| 阶段 | 内容 | 状态 |
|---|---|---|
| 1 | 信息架构 + Dashboard 原型 | ✅ |
| 2 | SQLite 数据模型，Dashboard 读真实记录 | ✅ |
| 3 | 记录录入层 + 学习计划页 | ✅ 计划页已完成；词汇、错题本待做 |
| 4 | BandReady Adapter 接口 + Mock 验证 | ⏳ |
| 5 | 对接 BandReady，导入真实练习数据 | ⏳ |

侧边栏里的学习诊断、四科专项、词汇、错题本、模考与报告、设置这几个页面还在开发中。

## 🚀 快速开始

**环境要求**

- Node.js **22.13 或更新**（项目用的是 Node 内置的 `node:sqlite` 模块）
- [pnpm](https://pnpm.io)

```bash
git clone https://github.com/laylaaaaa777xtyc-crypto/ielts-os.git
cd ielts-os
pnpm install
pnpm dev
```

然后在浏览器打开 <http://localhost:3100>。

- 想先看看界面效果，可以打开 <http://localhost:3100/?demo=1>，页面会显示带 Demo 标签的演示数据
- 数据库默认存放在 `data/` 目录下（已加入 gitignore，不会被提交）。要换一个位置，可以设置环境变量：

  ```bash
  IELTS_OS_DATA_DIR=/path/to/your/data pnpm dev
  ```

### 常用命令

| 命令 | 作用 |
|---|---|
| `pnpm dev` | 启动开发服务器（端口 3100） |
| `pnpm build` / `pnpm start` | 构建并以生产模式运行 |
| `pnpm test` | 运行单元测试（Vitest） |
| `pnpm typecheck` | TypeScript 类型检查 |

## 🧱 技术栈

- [Next.js](https://nextjs.org)（App Router + Server Actions）+ React + TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4
- [Recharts](https://recharts.org)：趋势图
- [Drizzle ORM](https://orm.drizzle.team) + Node 内置 SQLite
- [Vitest](https://vitest.dev)：单元测试

## 🗺 目录结构

```
ielts-os/
  docs/ARCHITECTURE.md  架构设计文档
  data/                 本地 SQLite 数据库（gitignore）
  src/app/              路由页面（Dashboard、planner …）
  src/components/       通用组件与 Dashboard 组件
  src/db/               Drizzle schema、数据库客户端、仓储与测试
  src/lib/              类型、分数计算、演示数据
```

更详细的设计见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。

## 🔒 隐私

- 不需要账号，没有任何遥测
- 所有记录都保存在本机的 SQLite 文件里
- 以后接入的 AI 模型由你自己在设置里配置，配什么、发什么数据都由你决定

## 🤝 参与贡献

欢迎提 Issue 和 Pull Request。提交前请确保 `pnpm test` 和 `pnpm typecheck` 都能通过。

## 📄 许可证

[MIT](LICENSE)
