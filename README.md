# Ghibli Watch Guide (Project Title - Placeholder)

English Version | [中文版本](README.zh.md)

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It aims to provide a guide for watching Studio Ghibli movies.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Database ORM:** [Prisma](https://www.prisma.io/)
*   **Package Manager:** [pnpm](https://pnpm.io/)

## Getting Started

### Prerequisites

*   Node.js (Version recommended by Next.js)
*   pnpm (Install via `npm install -g pnpm`)

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repository-url>
    cd ghibli-watch-guide
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Set up environment variables:
    *   Copy `.env.example` to `.env`:
        ```bash
        cp .env.example .env
        ```
    *   Fill in the required values in the `.env` file (e.g., database connection string, API keys).
4.  Set up the database (if using Prisma):
    *   Run database migrations:
        ```bash
        pnpm prisma migrate dev
        ```
    *   (Optional) Seed the database:
        ```bash
        pnpm run db:seed
        ```

### Running the Development Server

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Automated Tasks and Cron Jobs

This project includes automated scripts that run as Vercel Cron Jobs to keep the content up-to-date:

### Movie Data Collection

- **Purpose**: Fetches movie data from TMDB API and updates the database with the latest Studio Ghibli film information.
- **Implementation**: Located at `/app/api/cron/seed-movies/route.ts`
- **Schedule**: Runs daily through Vercel Cron Jobs
- **Authentication**: Protected by a `CRON_SECRET` environment variable
- **Manual Trigger**: You can manually trigger this script locally with:
  ```bash
  curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/seed-movies
  ```

### Sitemap Generation

- **Purpose**: Automatically generates a sitemap.xml file for search engine optimization
- **Implementation**: Located at `/app/api/cron/generate-sitemap/route.ts`
- **Schedule**: Runs daily through Vercel Cron Jobs
- **Output**: Creates/updates `/public/sitemap.xml`
- **Manual Trigger**: You can manually trigger this script locally with:
  ```bash
  curl http://localhost:3000/api/cron/generate-sitemap
  ```

### Setting Up Cron Jobs on Vercel

When deploying to Vercel, the Cron Jobs are configured in the `vercel.json` file. Make sure to set the `CRON_SECRET` environment variable in your Vercel project settings.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The recommended way to deploy this Next.js application is using the [Vercel Platform](https://vercel.com/).

Follow these steps:

1.  **Push your code** to a Git repository (e.g., GitHub, GitLab, Bitbucket).
2.  **Import your project** into Vercel:
    *   Go to your Vercel dashboard and click "Add New... -> Project".
    *   Connect your Git provider and select the repository for this project.
    *   Vercel should automatically detect that you are using Next.js and configure the build settings. The default settings are usually sufficient. Ensure the "Framework Preset" is set to "Next.js" and the "Package Manager" is detected as "pnpm".
3.  **Configure Environment Variables**:
    *   This is a crucial step. Go to your project settings in Vercel (Settings -> Environment Variables).
    *   Add the required environment variables based on your `.env.example` or `.env` file. At minimum, you will likely need:
        *   `DATABASE_URL`: Your Neon (or other provider's) database connection string.
        *   `TMDB_API_KEY`: API key for The Movie Database.
        *   `DOMAIN`: Your site's domain (e.g., https://www.whereghibli.cc).
        *   `CRON_SECRET`: A secure random string for Cron Job authentication.
    *   Ensure you set these variables for the appropriate environments (Production, Preview, Development).
4.  **Deploy**:
    *   Click the "Deploy" button. Vercel will build and deploy your application.
    *   Once deployed, you will get a URL to access your live site.

For more detailed information on deploying Next.js applications to Vercel, refer to the official [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
