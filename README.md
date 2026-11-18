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

## CMS security and storage

Set these variables in the server environment (for example, Vercel Project Settings). Do not prefix secrets with `NEXT_PUBLIC_` and do not enter a GitHub token in the browser:

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Yes | Password used to sign in to `/admin`. |
| `GITHUB_PAT` | Yes in production | GitHub token with permission to read and update the content file. |
| `GITHUB_OWNER` | Yes in production | GitHub account or organization that owns the repository. |
| `GITHUB_REPO` | Yes in production | Repository containing the content file. |
| `GITHUB_BRANCH` | No | Branch to update; defaults to `main`. |
| `GITHUB_PATH` | No | Safe repository-relative content path; defaults to `content.json`. |

Admin sessions are signed with a key derived from `ADMIN_PASSWORD` using HKDF, so no separate session secret is required. Production content changes are stored in GitHub. Local development can read and write the validated content file when GitHub storage variables are not set. Production requests fail closed if persistent GitHub storage is not configured.

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
