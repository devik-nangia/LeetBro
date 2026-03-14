This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploying on Vercel

This app is production-ready and can be deployed easily on Vercel. Because it uses Next-Auth and Prisma, you'll need to set up a few things before hitting deploy.

### 1. Push to GitHub
Upload your code to a GitHub repository if you haven't already.

### 2. Prepare Environment Variables
You'll need these variables ready:
- `AUTH_SECRET`: Generate a random 32-character string (e.g., using `openssl rand -base64 32`).
- `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET`: Get these from the [Google Cloud Console](https://console.cloud.google.com/) by creating OAuth 2.0 Client IDs. Set the authorized redirect URI to `https://your-deployment-url.vercel.app/api/auth/callback/google`.
- `GEMINI_API_KEY`: Get this from Google AI Studio.
- `DATABASE_URL`: You'll need a PostgreSQL database. Vercel provides **Vercel Postgres** which integrates automatically.

### 3. Deploy on Vercel
1. Log into [Vercel](https://vercel.com/) and click **Add New... > Project**.
2. Import your GitHub repository.
3. In the "Environment Variables" section, add all the variables from step 2.
4. If you don't have a database yet, you can add Vercel Postgres in the "Storage" tab of your Vercel project settings later, which will automatically inject `POSTGRES_URL` (you'll need to update your `schema.prisma` or set `DATABASE_URL` to match).
5. Open the "Build and Output Settings" and ensure the Build Command is `npm run build`. 
6. Click **Deploy**.

*(Note: Vercel will automatically run `prisma generate` during the build step because `prisma` is a standard dependency).*
