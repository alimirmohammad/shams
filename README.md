# Shams Family Funds

Welcome to Shams Family Funds, an application designed for managing family funds. With this app, you can easily keep track of family members and their shares. You can record payments made toward share bills and loans given to members and when they pay them back. In addition, the app provides account balances and calculates any debts owed.

## Authorization

There are two user roles: `USER` and `ADMIN`. `ADMIN` users can add new data and access the complete list of members, while `USER` users can only view their own share, balance, debt, and loans. They cannot modify any data.

## Tech Stack

This app was developed using `Nuxt 3`, `TypeScript`, `TailwindCSS`, and `DaisyUI`. Form validation is provided by `Vee-Validate` and `Zod`, while data fetching and caching is handled by `Vue-Query`. The app uses a `Postgresql` database and `Prisma` to access it. Authentication is implemented using `JWT`, with cookie-based storage, and an authorization system restricts specific tasks to `ADMIN` users.

The app is also a `PWA`, which means it can be installed on mobile devices and accessed from the home screen. It uses the `Vite-PWA` plugin under the hood.

You can build your container version of this app using `Docker`.

## Container

Using the `Dockerfile` in this repo, you can build and run your container version of the app.

To build an image, run the following command inside the root of the project:

```bash
docker build -t YOUR_TAG_NAME .
```

## CI/CD

This app uses `Github Actions` as its CI/CD. So whenever new code is pushed to the `main` branch, the application is rebuilt and re-deployed.

## Run the Application

To run the app, you must provide two environment variables: `DATABASE_URL` and `NUXT_JWT_SECRET`. You can store these variables in a `.env` file in a local environment.

### Using Node.js Locally

If you don't have `pnpm` installed you must first install it globally using `npm`:

```bash
npm install -g pnpm@8.6.2
```

Then simply run the following commands to get started:

```bash
pnpm install
```

```bash
pnpm dev
```

### Using Docker

After building a `Docker` image, you can run it with `Docker`:

```bash
docker run --rm -it -p 3000:3000/tcp --env-file YOUR_ENV_FILE YOUR_TAG_NAME
```
