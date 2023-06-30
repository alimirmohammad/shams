# Shams Family Funds

Welcome to Shams Family Funds, an application designed for managing family funds. With this app, you can easily keep track of family members and their shares. You can record payments made toward share bills and loans given to members and when they pay them back. In addition, the app provides account balances and calculates any debts owed.

## Authorization

There are two user roles: `USER` and `ADMIN`. `ADMIN` users can add new data and access the complete list of members, while `USER` users can only view their own share, balance, debt, and loans. They cannot modify any data.

## Tech Stack

This app was developed using `Nuxt 3`, `TypeScript`, `TailwindCSS`, and `DaisyUI`. Form validation is provided by `Vee-Validate` and `Zod`, while data fetching and caching is handled by `Vue-Query`. The app uses a `Postgresql` database and `Prisma` to access it. Authentication is implemented using `JWT`, with cookie-based storage, and an authorization system restricts specific tasks to `ADMIN` users.

The app is also a `PWA`, which means it can be installed on mobile devices and accessed from the home screen. It uses the `Vite-PWA` plugin under the hood.

## Run the Application

To run the app, you must provide two environment variables: `DATABASE_URL` and `NUXT_JWT_SECRET`. You can store these variables in a `.env` file in a local environment.

Then simply run the following commands to get started:

```bash
pnpm install
```

```bash
pnpm dev
```
