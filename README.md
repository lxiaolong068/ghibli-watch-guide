# Ghibli Watch Guide (Project Title - Placeholder)

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
