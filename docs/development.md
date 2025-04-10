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

*   ✅ <font color="green">**技术选型**</font>: 
    *   **前端框架**: Next.js 14 - 重点利用其 SEO 优势。
    *   **UI 库**: Starwind UI - 用于构建美观的界面。
    *   **数据库**: Neon (Serverless Postgres) - 配置信息见 `.env` 文件。
    *   **ORM/数据访问**: Prisma (推荐) 或 Drizzle ORM，用于简化数据库交互。
    *   **部署平台**: Vercel (与 Next.js 和 Neon 集成良好)。
*   ✅ <font color="green">**项目初始化**</font>: 使用 `create-next-app` 创建 Next.js 15 项目。
*   ✅ <font color="green">**数据库连接**</font>: 配置 Neon 数据库连接，参考 `.env` 文件，并设置 Prisma (或选定的 ORM)。
*   ✅ <font color="green">**Starwind UI 集成**</font>: 根据 Starwind UI 文档初始化并集成到 Next.js 项目中。
*   ✅ <font color="green">**代码仓库**</font>: 初始化 Git 仓库并托管 (例如 GitHub, GitLab)。
*   ✅ <font color="green">**项目结构**</font>: 创建基本的文件夹和文件结构 (Next.js App Router 结构, Prisma schema等)。
*   ✅ <font color="green">**部署策略**</font>: 设置 Vercel 自动化部署流程 (连接 Git 仓库，配置环境变量)。

---

## 第二阶段：核心数据收集与处理 (Phase 2: Core Data & Backend/Handling)

*   ✅ <font color="green">**数据整合**</font>: 从 `grok.md`, `gemini.md`, `chagpt.md` 提取结构化的观看信息 (作为补充和交叉验证)。
*   🔴 **混合数据源策略 (关键任务)**: 
    *   主要使用 **TMDB API** 获取基础电影信息（导演、年份、简介、海报图等）。
    *   针对 **观看可用性信息**（流媒体平台、租赁/购买链接、价格、免费渠道如 Kanopy/Hoopla 等），进行 **针对性网络爬取** 或查询特定区域性平台 API/数据源进行补充。
    *   确认补充信息来源的可靠性。
*   ✅ <font color="green">**TMDB API 集成**</font>: 
    *   ✅ <font color="green">**申请 TMDB API 密钥**</font> (已完成，密钥在 `.env`)
    *   ✅ <font color="green">**在后端逻辑中实现调用 TMDB API 获取电影详情的功能。**</font> (已创建 `lib/tmdb.ts` 和 `/api/movies/[id]` 路由)
*   ✅ <font color="green">**数据库 Schema 设计**</font>: 使用 Prisma Schema 设计数据库模型，主要存储 `Availability` (包含 `regionId`, `platformId`, `movieId`, `url`, `type`, `price`, `lastChecked` 等) 和辅助的 `Region`, `Platform` 信息。`Movie` 表的基础信息将主要来自 TMDB，可选择性缓存关键字段。 (注意: `Availability` 模型及相关数据目前已移除)
*   ✅ <font color="green">**数据迁移/种子填充**</font>: 编写脚本将 **电影信息 (Movie)** 填充到 Neon 数据库中 (Prisma Migrate/Seed)。(注意: `Availability` 相关种子填充已移除)
*   🟡 <font color="orange">**数据访问逻辑**</font>: 实现 Next.js 后端逻辑 (API 路由/Server Actions) 来: 
    *   ✅ <font color="green">**(1) 调用 TMDB API 获取基础电影数据 (已实现 `/api/movies/[id]` API 路由)**</font>
    *   ✅ <font color="green">**(2) 查询本地数据库获取Movie List (已实现 `getAllMovies`, `getLatestMovies` 并支持分页)**</font>
    *   ✅ <font color="green">**(3) API路由Bug修复: 移除 `app/api/movies/route.ts` 中对不存在的 `availabilities` 关联的引用**</font>
    *   🔴 (4) 整合 API 数据和数据库数据后返回给前端 (针对电影详情页)。
*   🔴 **数据更新流程**: 规划如何保持信息时效性。**初步计划**: 
    *   (1) 基础电影信息依赖 TMDB API 的更新 (可在前端或后端做缓存)。
    *   (2) 定期（手动检查或未来考虑自动化脚本）检查并更新数据库中的观看可用性信息 (`Availability` 表记录)。在 `Availability` 表中加入 `lastChecked` 字段跟踪更新时间。(注：`Availability` 相关逻辑暂缓)
*   🟡 <font color="orange">**加载优化**</font>: 实现更流畅的加载体验 (分页是第一步)。

---

## 第三阶段：前端界面开发 (Phase 3: Frontend Development)

*   ✅ <font color="green">**UI 基础**</font>: 使用 Starwind UI 组件搭建网站整体布局、导航和基本样式。
*   ✅ <font color="green">**首页 (`/`)**</font>: 实现首页布局，并展示最新的 9 部电影。
*   ✅ <font color="green">**Movie List页 (`/movies`)**</font>: 实现Movie List展示和分页功能。
*   🟡 <font color="orange">**地区选择器 (重新规划)**</font>: 
    * 🔴 设计并实现地区切换组件，让用户可选择查看不同地区的观看信息。
    * 🔴 实现地区偏好的持久化（使用浏览器localStorage或cookies）。
*   🟡 <font color="orange">**信息展示组件**</font>: 开发用于显示不同观看方式信息的 React 组件:
    *   🔴 **按地区展示**: 实现地区过滤功能，支持选择特定地区查看电影观看选项。
    *   ✅ <font color="green">**按电影展示 (列表页)**</font>: `/movies` 页面已实现。
    *   🔴 **观看信息展示**: 设计并实现观看渠道信息展示组件。
    *   🔴 **价格信息展示**: 设计并实现价格信息的清晰展示方式。
*   ✅ <font color="green">**电影详情页面 (`/movies/[id]`)**</font>:
    *   ✅ <font color="green">**基本信息**</font>: 展示电影详细信息，包括导演、年份、时长等 (已使用 TMDB API 数据展示)。
    *   🔴 **观看选项**: 在电影详情页实现观看选项展示，按地区分组显示。
    *   🔴 **价格比较**: 实现不同平台的价格比较功能。
*   🟡 <font color="orange">**加载状态优化**</font>:
    *   🟡 <font color="orange">**骨架屏**</font>: 为电影卡片添加加载状态。
    *   🟡 <font color="orange">**过渡动画**</font>: 添加平滑的状态转换动画。
*   🟡 <font color="orange">**特殊电影处理**</font>: 在获取和展示数据时，确保《萤火虫之墓》等特殊情况得到正确处理和清晰标注 (已添加初步提示)。
*   🟡 <font color="orange">**响应式设计**</font>: 利用 Starwind UI 的响应式工具确保在不同设备上的适配。
*   🔴 **"最后更新"显示**: 在页面上显示数据的 `lastChecked` 时间或一个全局的"最后更新日期"。
*   🔴 **电影搜索功能**: 
    *   🔴 **搜索框组件**: 实现搜索框，支持按电影名称搜索。
    *   🔴 **搜索建议**: 实现输入时的自动建议功能。
    *   🔴 **多语言搜索**: 支持中文、英文、日文电影名称搜索。
*   🔴 **排序和筛选**:
    *   🔴 **排序选项**: 按年份、片名等排序。
    *   🔴 **筛选选项**: 按导演、发行年代等筛选。
*   🟡 <font color="orange">**SEO 优化**</font>: 利用 Next.js 的特性 (Server Components, Metadata API) 优化页面 SEO (为详情页添加了 `generateMetadata` 框架)。

---

## 第四阶段：内容填充与测试 (Phase 4: Content Population & Testing)

*   ✅ <font color="green">**数据录入/迁移**</font>: 执行第二阶段准备好的数据迁移/种子脚本，确保 **电影信息** 正确录入数据库。
*   🔴 **文案撰写**: 
    *   🔴 **网站介绍**: 编写网站的目的和使用说明。
    *   🔴 **帮助文档**: 编写如何使用网站的详细指南。
    *   🔴 **免责声明**: 编写必要的法律声明和免责条款。
*   🟡 <font color="orange">**UI/UX 优化**</font>: 
    *   🔴 **用户反馈**: 添加用户反馈机制。
    *   🟡 <font color="orange">**错误处理**</font>: 完善错误提示和处理流程。
    *   🟡 <font color="orange">**加载优化**</font>: 实现更流畅的加载体验 (分页已完成)。
*   🟡 <font color="orange">**全面测试**</font>:
    *   🟡 <font color="orange">**功能测试**</font>: 
        *   ✅ <font color="green">**API 路由/Server Actions (部分)**</font>: `/api/movies/[id]`, `getAllMovies`, `getLatestMovies` 测试。
        *   🔴 数据库查询 (更全面的测试)。
        *   ✅ <font color="green">**Movie List分页**</font>
        *   🔴 信息过滤 (暂无)。
        *   🔴 外部链接有效性 (暂无)。
    *   🟡 <font color="orange">**组件测试**</font>: 确保所有组件按预期工作。
    *   🟡 <font color="orange">**兼容性测试**</font>: 主流浏览器及不同屏幕尺寸。
    *   🔴 **数据准确性核对**: 抽查数据库数据与最新官方来源的一致性。
    *   🟡 <font color="orange">**性能测试**</font>: 检查并优化加载时间和响应速度。

---

## 第五阶段：部署与维护 (Phase 5: Deployment & Maintenance)

*   🟡 <font color="orange">**首次部署**</font>: 将 Next.js 应用部署到 Vercel 生产环境。
*   🟡 <font color="orange">**环境变量配置**</font>: 确保 Vercel 项目中正确配置了 Neon 数据库连接等环境变量。
*   🟡 <font color="orange">**线上测试**</font>: 在生产环境中进行最终的功能、性能和显示测试。
*   🔴 **监控与分析**:
    *   🔴 **错误监控**: 集成错误跟踪工具。
    *   🔴 **性能监控**: 监控应用性能指标。
    *   🔴 **用户分析**: 集成用户行为分析工具。
*   🔴 **维护计划**:
    *   🔴 **数据更新流程**: 建立定期数据更新机制 (特别注意 `Availability` 数据)。
    *   🔴 **备份策略**: 制定数据备份计划。
    *   🔴 **更新日志**: 记录所有重要更新和变更。

---

## 新增阶段：观看可用性功能恢复 (Phase 6: Availability Feature Restoration)

*   🔴 **Availability数据模型恢复**: 
    * 🔴 更新Prisma Schema，重新添加`Availability`、`Region`和`Platform`模型及其关联关系。
    * 🔴 确保与`Movie`模型的正确关联 (一对多关系)。
    * 🔴 执行数据库迁移以应用新的schema。
*   🔴 **Region与Platform数据填充**:
    * 🔴 编写种子脚本填充主要地区数据(美国、日本、中国、欧洲主要国家等)。
    * 🔴 编写种子脚本填充主要平台数据(Netflix、Disney+、HBO Max、哔哩哔哩、优酷等)。
*   🔴 **Availability数据收集与填充**:
    * 🔴 设计数据收集方法(手动收集/爬虫/API)。
    * 🔴 实现数据处理和导入逻辑。 
    * 🔴 添加`lastChecked`字段记录数据最后更新时间。
*   🔴 **API路由更新**:
    * 🔴 更新`/api/movies/route.ts`以正确包含`availabilities`关联数据。
    * 🔴 开发新的API端点`/api/availability`用于按地区查询电影可用性。
    * 🔴 实现`/api/regions`和`/api/platforms`获取支持的地区和平台列表。
*   🔴 **Server Actions开发**:
    * 🔴 编写`getMovieAvailability`查询特定电影的观看选项。
    * 🔴 开发`getAvailabilityByRegion`支持按地区筛选。
    * 🔴 添加缓存机制优化性能。
*   🔴 **前端组件实现**:
    * 🔴 地区选择器组件。
    * 🔴 可用性信息卡片组件。
    * 🔴 价格比较组件。
    * 🔴 将这些组件集成到电影详情页。
*   🔴 **错误处理与优化**:
    * 🔴 添加数据加载边界值处理。
    * 🔴 优化数据库查询以提高性能。
    * 🔴 实现失败重试和回退策略。
*   🔴 **数据管理面板** (可选):
    * 🔴 开发简单的管理界面，便于管理员更新观看可用性信息。
    * 🔴 添加批量导入/导出功能。
    * �� 实现用户身份验证以保护管理界面。
