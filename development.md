# 吉卜力工作室电影观看指南网站 - 开发计划

**宗旨**: 为用户提供尽可能全面、准确的吉卜力工作室电影观看来源信息（包括收费和免费渠道）。
**开发者**: 独立开发者
**时间要求**: 无

**状态标识**:
*   🔴 <font color="red">**待开发 (To Do)**</font>
*   🟡 <font color="orange">**进行中 (In Progress)**</font>
*   ✅ <font color="green">**已完成 (Done)**</font>

*(注：Markdown本身不支持颜色，这里使用HTML font标签尝试模拟，显示效果可能因环境而异。核心是状态分类)*

---

## 第一阶段：项目设置与基础架构 (Phase 1: Setup & Foundation)

*   🔴 **技术选型**: 
    *   **前端框架**: Next.js 15 (RC) - 重点利用其 SEO 优势。
    *   **UI 库**: Starwind UI - 用于构建美观的界面。
    *   **数据库**: Neon (Serverless Postgres) - 配置信息见 `.env` 文件。
    *   **ORM/数据访问**: Prisma (推荐) 或 Drizzle ORM，用于简化数据库交互。
    *   **部署平台**: Vercel (与 Next.js 和 Neon 集成良好)。
*   ✅ <font color="green">**项目初始化**</font>: 使用 `create-next-app` 创建 Next.js 15 项目。
*   ✅ <font color="green">**数据库连接**</font>: 配置 Neon 数据库连接，参考 `.env` 文件，并设置 Prisma (或选定的 ORM)。
*   ✅ <font color="green">**Starwind UI 集成**</font>: 根据 Starwind UI 文档初始化并集成到 Next.js 项目中。
*   🔴 **代码仓库**: 初始化 Git 仓库并托管 (例如 GitHub, GitLab)。
*   🔴 **项目结构**: 创建基本的文件夹和文件结构 (Next.js App Router 结构, Prisma schema等)。
*   🔴 **部署策略**: 设置 Vercel 自动化部署流程 (连接 Git 仓库，配置环境变量)。

---

## 第二阶段：核心数据收集与处理 (Phase 2: Core Data & Backend/Handling)

*   🔴 **数据整合**: 从 `grok.md`, `gemini.md`, `chagpt.md` 提取结构化的观看信息。
*   🔴 **补充调研 (关键任务)**: 搜索互联网，查找更多未在报告中提及的观看来源，**目标是"尽可能全面"**:
    *   免费渠道 (图书馆流媒体如 Kanopy/Hoopla, 公共电视台, 官方活动等)。
    *   其他付费渠道 (区域性平台, 动漫专业平台)。
    *   确认信息来源可靠性。
*   🔴 **数据库 Schema 设计**: 使用 Prisma Schema (或 SQL) 设计数据库模型，用于存储地区 (Region)、电影 (Movie)、平台 (Platform)、可用性 (Availability) 等信息。考虑关系：
    *   `Movie` (id, title_en, title_ja, year, ...)
    *   `Platform` (id, name, website, type - streaming/rental/purchase/free/cinema/physical)
    *   `Region` (id, code, name)
    *   `Availability` (id, movieId, platformId, regionId, url, priceInfo, notes, isSubscription, isFree, lastChecked)
*   🔴 **数据迁移/种子填充**: 编写脚本将收集和整理好的数据填充到 Neon 数据库中 (Prisma Migrate/Seed)。
*   🔴 **数据访问逻辑**: 实现 Next.js 后端 API 路由或 Server Actions 来查询数据库 (使用 Prisma Client)，获取特定地区或电影的观看信息。
*   🔴 **数据更新流程**: 规划如何保持信息时效性。**初步计划**: 手动定期检查关键平台信息，并通过脚本或管理界面更新数据库记录。在 `Availability` 表中加入 `lastChecked` 字段跟踪更新时间。

---

## 第三阶段：前端界面开发 (Phase 3: Frontend Development)

*   🔴 **UI 基础**: 使用 Starwind UI 组件搭建网站整体布局、导航和基本样式。
*   🔴 **地区选择器**: 实现让用户选择目标地理位置的组件 (使用 Starwind UI 组件)。
*   🔴 **信息展示组件**: 开发用于显示不同观看方式信息的 React 组件 (使用 Starwind UI):
    *   🔴 按地区展示: 默认或选择地区后，调用后端 API 获取数据并渲染。
    *   🔴 按电影展示 (可选，但推荐): 用户选择电影后，调用后端 API 获取数据并渲染。
    *   🔴 清晰区分: 使用 Starwind UI 的图标、标签或卡片样式区分订阅、租赁/购买、免费等类型。
*   🔴 **特殊电影处理**: 在获取和展示数据时，确保《萤火虫之墓》等特殊情况得到正确处理和清晰标注。
*   🔴 **响应式设计**: 利用 Starwind UI 的响应式工具确保在不同设备上的适配。
*   🔴 **"最后更新"显示**: 在页面上显示数据的 `lastChecked` 时间或一个全局的"最后更新日期"。
*   🔴 **(可选) 电影搜索功能**: 实现搜索框 (Starwind UI 组件)，调用后端 API 实现按电影名称搜索观看信息。
*   🔴 **SEO 优化**: 利用 Next.js 的特性 (Server Components, Metadata API) 优化页面 SEO。

---

## 第四阶段：内容填充与测试 (Phase 4: Content Population & Testing)

*   🔴 **数据录入/迁移**: 执行第二阶段准备好的数据迁移/种子脚本，确保所有数据正确录入数据库。
*   🔴 **文案撰写**: 编写网站介绍、使用说明等文本内容。
*   🔴 **UI/UX 优化**: 使用 Starwind UI 提供的组件和样式，进一步优化界面布局和用户体验。
*   🔴 **全面测试**:
    *   🔴 **功能测试**: API 路由/Server Actions、数据库查询、地区/电影切换、信息过滤、外部链接有效性。
    *   🔴 **Starwind UI 组件测试**: 确保组件按预期工作。
    *   🔴 **兼容性测试**: 主流浏览器及不同屏幕尺寸。
    *   🔴 **数据准确性核对**: 抽查数据库数据与最新官方来源的一致性。

---

## 第五阶段：部署与维护 (Phase 5: Deployment & Maintenance)

*   🔴 **首次部署**: 将 Next.js 应用部署到 Vercel 生产环境。
*   🔴 **环境变量配置**: 确保 Vercel 项目中正确配置了 Neon 数据库连接等环境变量。
*   🔴 **线上测试**: 在生产环境中进行最终的功能、性能和显示测试。
*   🔴 **(可选) 网站分析**: 集成分析工具。
*   🔴 **建立维护计划**: 正式确定数据库数据更新的检查周期和流程。考虑未来可能开发一个简单的内部管理界面来更新数据。
