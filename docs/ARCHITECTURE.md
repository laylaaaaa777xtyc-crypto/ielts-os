# IELTS OS 架构设计（Phase 1）

> 定位：Mac 本地运行的个人 AI 雅思备考工作台，目标 IELTS 7.0。本地优先，数据不出本机。

## 1. 核心流程

学习诊断 → 学习计划 → 每日任务 → 专项训练 → 全真模考 → 阶段报告

## 2. 信息架构（页面 / 路由）

注意：需求文档的模块清单第 1–9 项在传输中被截断，仅看到第 10 项 Study Planner 和第 11 项 Settings。下表前 9 项是按核心流程和四科推断的，待用户确认。

| # | 模块 | 路由 | 职责 |
|---|---|---|---|
| 1 | Dashboard | `/` | 学习驾驶舱：目标进度、四科、今日任务、日历、趋势、薄弱项、复习提醒 |
| 2 | Diagnostic | `/diagnostic` | 学习诊断，生成初始能力画像（推断） |
| 3 | Listening | `/listening` | 听力专项训练与记录（推断） |
| 4 | Reading | `/reading` | 阅读专项训练与记录（推断） |
| 5 | Writing | `/writing` | 写作练习与批改记录（推断） |
| 6 | Speaking | `/speaking` | 口语练习与记录（推断） |
| 7 | Vocabulary | `/vocabulary` | 词汇与 SRS 复习（推断） |
| 8 | Mistakes | `/mistakes` | 错题本与错题提醒（推断） |
| 9 | Mock Exams & Reports | `/mock`, `/reports` | 全真模考、阶段报告（推断） |
| 10 | Study Planner | `/planner` | 每日计划、周计划、任务完成情况 |
| 11 | Settings | `/settings` | 模型配置、本地数据目录、隐私设置 |

## 3. 数据真实性规则（硬约束）

- 所有展示的数据都带来源标记：`real`（用户实际记录）、`demo`（演示数据）、`none`（暂无数据）。
- `demo` 数据在 UI 上必须有明显的 Demo 标签，不得与真实成绩混在同一曲线里。
- `none` 时显示空状态和引导，不显示任何分数。
- 估分一律标注为「估计值」。BandReady 自己声明评分尚未校准，IELTS OS 不得把它包装成官方分数。

## 4. 技术架构

- 前端：Next.js（App Router）+ React + TypeScript + Tailwind CSS + Recharts。
- 存储：SQLite 本地文件，ORM 用 Drizzle，数据库文件放在项目 `data/` 下（已 gitignore）。
- 本地优先：不需要账号，不上传数据；模型调用由用户在 Settings 里配置。
- 分层：`UI 组件` → `服务层（src/server）` → `仓储（src/db）` / `Adapter（src/adapters）`。页面不直接访问数据库或 BandReady。
- 依赖策略：只做项目本地安装，不装、不升级任何全局依赖。

## 5. BandReady Adapter 设计

已审计的 BandReady 接口（只读）：Bearer token 鉴权，sidecar 端口随机且只绑定本机回环地址。可用端点：

- `GET /api/v1/progress/summary | estimates | trajectory | criteria | heatmap`
- `GET /api/v1/plan`、`POST /api/v1/plan/generate`
- `GET /api/v1/{listening,writing}/attempts`，`GET /api/v1/{listening,writing,speaking}/mock/sessions`
- `GET /api/v1/srs/stats`、`GET /api/v1/vocab/stats`
- 已知缺口：没有 `GET /api/v1/reading/attempts`，Adapter 需要降级（Reading 记录标记为 none）。

接口形态：

```ts
type Source = 'real' | 'demo' | 'none'
interface Sourced<T> { source: Source; data: T | null }

interface BandReadyAdapter {
  health(): Promise<Sourced<{ connected: boolean }>>
  skillEstimates(): Promise<Sourced<SkillEstimates>>
  trajectory(skill: Skill, weeks: number): Promise<Sourced<BandPoint[]>>
  todayPlan(): Promise<Sourced<PlanSession | null>>
  vocabStats(): Promise<Sourced<VocabStats>>
  mockHistory(): Promise<Sourced<MockResult[]>>
}
```

- `MockAdapter`：返回明显标注的 demo 数据，用于 Phase 1–3 验证。
- `HttpAdapter`：Phase 5，等另一个窗口完成 BandReady 部署后再接入，URL 和 token 来自 Settings。

## 6. 目录结构（计划）

```
ielts-os/
  docs/            设计文档
  data/            本地 SQLite（gitignore）
  src/app/         路由页面（按模块分目录）
  src/components/  通用与 Dashboard 组件
  src/db/          Drizzle schema 与仓储
  src/adapters/    BandReady Adapter（types / mock / http）
  src/lib/         工具、分数与日期计算
```

## 7. 阶段

1. 信息架构 + 技术架构 + Dashboard 原型（当前阶段，demo 数据）
2. SQLite 数据模型与仓储，Dashboard 改读真实记录
3. Planner / Vocabulary / Mistakes 模块
4. Adapter 接口 + Mock 验证
5. 等待 BandReady 部署完成，再做真实数据集成
