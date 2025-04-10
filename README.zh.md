# Ghibli 观看指南 (项目标题 - 占位符)

[English Version](README.md) | 中文版本

这是一个使用 [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) 引导创建的 [Next.js](https://nextjs.org/) 项目。旨在提供一个观看吉卜力工作室电影的指南。

## 技术栈

*   **框架:** [Next.js](https://nextjs.org/) (App Router)
*   **语言:** [TypeScript](https://www.typescriptlang.org/)
*   **样式:** [Tailwind CSS](https://tailwindcss.com/)
*   **数据库 ORM:** [Prisma](https://www.prisma.io/)
*   **包管理器:** [pnpm](https://pnpm.io/)

## 开始使用

### 先决条件

*   Node.js (Next.js 推荐的版本)
*   pnpm (通过 `npm install -g pnpm` 安装)

### 安装

1.  克隆仓库:
    ```bash
    git clone <你的仓库URL>
    cd ghibli-watch-guide
    ```
2.  安装依赖:
    ```bash
    pnpm install
    ```
3.  设置环境变量:
    *   复制 `.env.example` 到 `.env`:
        ```bash
        cp .env.example .env
        ```
    *   在 `.env` 文件中填写所需的值 (例如，数据库连接字符串, API 密钥)。
4.  设置数据库 (如果使用 Prisma):
    *   运行数据库迁移:
        ```bash
        pnpm prisma migrate dev
        ```
    *   (可选) 填充数据库:
        ```bash
        pnpm run db:seed
        ```

### 运行开发服务器

运行开发服务器:

```bash
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

你可以通过修改 `app/page.tsx` 文件来开始编辑页面。文件修改后页面会自动更新。

本项目使用 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) 自动优化和加载 [Geist](https://vercel.com/font)，这是 Vercel 的一个新字体系列。

## 了解更多

要了解更多关于 Next.js 的信息，请查看以下资源：

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 的特性和 API。
- [学习 Next.js](https://nextjs.org/learn) - 一个交互式的 Next.js 教程。

你可以查看 [Next.js 的 GitHub 仓库](https://github.com/vercel/next.js) - 欢迎你的反馈和贡献！

## 在 Vercel 上部署

部署此 Next.js 应用程序的推荐方法是使用 [Vercel 平台](https://vercel.com/)。

请遵循以下步骤：

1.  **推送代码** 到 Git 仓库 (例如, GitHub, GitLab, Bitbucket)。
2.  **将项目导入** Vercel:
    *   进入 Vercel 仪表板，点击 "Add New... -> Project"。
    *   连接你的 Git 提供商并选择此项目的仓库。
    *   Vercel 应该会自动检测到你正在使用 Next.js 并配置构建设置。通常默认设置就足够了。确保 "Framework Preset" 设置为 "Next.js"，并且 "Package Manager" 检测为 "pnpm"。
3.  **配置环境变量**:
    *   这是关键一步。进入 Vercel 的项目设置 (Settings -> Environment Variables)。
    *   根据你的 `.env.example` 或 `.env` 文件添加所需的环境变量。至少，你可能需要：
        *   `DATABASE_URL`: 你的 Neon (或其他提供商) 数据库连接字符串。
        *   *(在此处添加你集成的任何其他必需的 API 密钥或秘密信息，例如 `TMDB_API_KEY`)*
    *   确保为适当的环境 (生产、预览、开发) 设置这些变量。
4.  **部署**:
    *   点击 "Deploy" 按钮。Vercel 将构建并部署你的应用程序。
    *   部署完成后，你将获得一个访问你线上站点的 URL。

有关将 Next.js 应用程序部署到 Vercel 的更详细信息，请参阅官方 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。 