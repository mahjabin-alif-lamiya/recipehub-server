# RecipeHub — Server

Express + MongoDB backend for RecipeHub, a recipe sharing platform. Handles
authentication, recipe CRUD, favorites, reports, and Stripe payments.

**Live API:** https://recipehub-server-a8ff.onrender.com

## Tech stack

- Node.js, Express
- MongoDB (native driver, no ODM)
- JWT auth stored in an httpOnly cookie
- Google login (ID token verification via google-auth-library)
- Stripe Checkout

## Features

- Credential and Google authentication
- Recipe CRUD with server-side pagination, category filter (`$in`), and search
- Free accounts limited to 2 recipes; premium accounts unlimited
- Likes, favorites, and recipe reporting with admin moderation
- Stripe Checkout for buying a single recipe or a premium membership
- Admin routes: manage users (block/unblock), manage recipes
  (edit/feature/delete), view transactions, admin stats
- Rate limiting on login/register routes

## Getting started

```bash
npm install
```

Create a `.env` file in the project root with the variables listed below,
then:

```bash
npm run dev
```

The API runs on [http://localhost:5000](http://localhost:5000) by default.

### Environment variables

| Variable | Description |
|---|---|
| `PORT` | Port the API runs on (default 5000) |
| `CLIENT_URL` | URL of the deployed/local frontend, used for CORS and Stripe redirects |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `GOOGLE_CLIENT_ID` | OAuth client ID from Google Cloud Console |
| `STRIPE_SECRET_KEY` | Stripe secret key (optional — payment routes error clearly until this is set) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the Stripe webhook |
| `NODE_ENV` | `development` locally, `production` when deployed |

### Creating the admin account

```bash
node scripts/createAdmin.js admin@recipehub.com YourStrongPass1
```

Running it again with the same email promotes that user to admin instead of
creating a duplicate.

## API overview

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/google` | Public |
| POST | `/api/auth/logout` | Public |
| GET | `/api/auth/me` | Logged in |
| GET | `/api/recipes` | Public (pagination + category filter via `?categories=a,b` + `?search=`) |
| GET | `/api/recipes/featured` | Public |
| GET | `/api/recipes/popular` | Public |
| GET | `/api/recipes/my` | Logged in |
| POST | `/api/recipes` | Logged in |
| GET | `/api/recipes/:id` | Public |
| PUT | `/api/recipes/:id` | Owner only |
| DELETE | `/api/recipes/:id` | Owner only |
| PATCH | `/api/recipes/:id/like` | Logged in |
| POST | `/api/favorites` | Logged in |
| DELETE | `/api/favorites/:recipeId` | Logged in |
| GET | `/api/favorites/my` | Logged in |
| POST | `/api/reports` | Logged in |
| GET | `/api/reports` | Admin |
| PATCH | `/api/reports/:id` | Admin |
| POST | `/api/payments/create-checkout-session` | Logged in |
| POST | `/api/payments/webhook` | Stripe only |
| GET | `/api/payments/my` | Logged in |
| GET | `/api/payments` | Admin |
| PATCH | `/api/users/profile` | Logged in |
| GET | `/api/users/stats` | Logged in |
| GET | `/api/admin/stats` | Admin |
| GET | `/api/admin/users` | Admin |
| PATCH | `/api/admin/users/:id/block` | Admin |
| PATCH | `/api/admin/users/:id/unblock` | Admin |
| GET | `/api/admin/recipes` | Admin |
| PUT | `/api/admin/recipes/:id` | Admin |
| DELETE | `/api/admin/recipes/:id` | Admin |
| PATCH | `/api/admin/recipes/:id/feature` | Admin |

## Project structure
# RecipeHub — Server

Express + MongoDB backend for RecipeHub, a recipe sharing platform. Handles
authentication, recipe CRUD, favorites, reports, and Stripe payments.

**Live API:** https://recipehub-server-a8ff.onrender.com

## Tech stack

- Node.js, Express
- MongoDB (native driver, no ODM)
- JWT auth stored in an httpOnly cookie
- Google login (ID token verification via google-auth-library)
- Stripe Checkout

## Features

- Credential and Google authentication
- Recipe CRUD with server-side pagination, category filter (`$in`), and search
- Free accounts limited to 2 recipes; premium accounts unlimited
- Likes, favorites, and recipe reporting with admin moderation
- Stripe Checkout for buying a single recipe or a premium membership
- Admin routes: manage users (block/unblock), manage recipes
  (edit/feature/delete), view transactions, admin stats
- Rate limiting on login/register routes

## Getting started

```bash
npm install
```

Create a `.env` file in the project root with the variables listed below,
then:

```bash
npm run dev
```

The API runs on [http://localhost:5000](http://localhost:5000) by default.

### Environment variables

| Variable | Description |
|---|---|
| `PORT` | Port the API runs on (default 5000) |
| `CLIENT_URL` | URL of the deployed/local frontend, used for CORS and Stripe redirects |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `GOOGLE_CLIENT_ID` | OAuth client ID from Google Cloud Console |
| `STRIPE_SECRET_KEY` | Stripe secret key (optional — payment routes error clearly until this is set) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the Stripe webhook |
| `NODE_ENV` | `development` locally, `production` when deployed |

### Creating the admin account

```bash
node scripts/createAdmin.js admin@recipehub.com YourStrongPass1
```

Running it again with the same email promotes that user to admin instead of
creating a duplicate.

## API overview

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/google` | Public |
| POST | `/api/auth/logout` | Public |
| GET | `/api/auth/me` | Logged in |
| GET | `/api/recipes` | Public (pagination + category filter via `?categories=a,b` + `?search=`) |
| GET | `/api/recipes/featured` | Public |
| GET | `/api/recipes/popular` | Public |
| GET | `/api/recipes/my` | Logged in |
| POST | `/api/recipes` | Logged in |
| GET | `/api/recipes/:id` | Public |
| PUT | `/api/recipes/:id` | Owner only |
| DELETE | `/api/recipes/:id` | Owner only |
| PATCH | `/api/recipes/:id/like` | Logged in |
| POST | `/api/favorites` | Logged in |
| DELETE | `/api/favorites/:recipeId` | Logged in |
| GET | `/api/favorites/my` | Logged in |
| POST | `/api/reports` | Logged in |
| GET | `/api/reports` | Admin |
| PATCH | `/api/reports/:id` | Admin |
| POST | `/api/payments/create-checkout-session` | Logged in |
| POST | `/api/payments/webhook` | Stripe only |
| GET | `/api/payments/my` | Logged in |
| GET | `/api/payments` | Admin |
| PATCH | `/api/users/profile` | Logged in |
| GET | `/api/users/stats` | Logged in |
| GET | `/api/admin/stats` | Admin |
| GET | `/api/admin/users` | Admin |
| PATCH | `/api/admin/users/:id/block` | Admin |
| PATCH | `/api/admin/users/:id/unblock` | Admin |
| GET | `/api/admin/recipes` | Admin |
| PUT | `/api/admin/recipes/:id` | Admin |
| DELETE | `/api/admin/recipes/:id` | Admin |
| PATCH | `/api/admin/recipes/:id/feature` | Admin |

## Project structure
# RecipeHub — Server

Express + MongoDB backend for RecipeHub, a recipe sharing platform. Handles
authentication, recipe CRUD, favorites, reports, and Stripe payments.

**Live API:** https://recipehub-server-a8ff.onrender.com

## Tech stack

- Node.js, Express
- MongoDB (native driver, no ODM)
- JWT auth stored in an httpOnly cookie
- Google login (ID token verification via google-auth-library)
- Stripe Checkout

## Features

- Credential and Google authentication
- Recipe CRUD with server-side pagination, category filter (`$in`), and search
- Free accounts limited to 2 recipes; premium accounts unlimited
- Likes, favorites, and recipe reporting with admin moderation
- Stripe Checkout for buying a single recipe or a premium membership
- Admin routes: manage users (block/unblock), manage recipes
  (edit/feature/delete), view transactions, admin stats
- Rate limiting on login/register routes

## Getting started

```bash
npm install
```

Create a `.env` file in the project root with the variables listed below,
then:

```bash
npm run dev
```

The API runs on [http://localhost:5000](http://localhost:5000) by default.

### Environment variables

| Variable | Description |
|---|---|
| `PORT` | Port the API runs on (default 5000) |
| `CLIENT_URL` | URL of the deployed/local frontend, used for CORS and Stripe redirects |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `GOOGLE_CLIENT_ID` | OAuth client ID from Google Cloud Console |
| `STRIPE_SECRET_KEY` | Stripe secret key (optional — payment routes error clearly until this is set) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the Stripe webhook |
| `NODE_ENV` | `development` locally, `production` when deployed |

### Creating the admin account

```bash
node scripts/createAdmin.js admin@recipehub.com YourStrongPass1
```

Running it again with the same email promotes that user to admin instead of
creating a duplicate.

## API overview

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/google` | Public |
| POST | `/api/auth/logout` | Public |
| GET | `/api/auth/me` | Logged in |
| GET | `/api/recipes` | Public (pagination + category filter via `?categories=a,b` + `?search=`) |
| GET | `/api/recipes/featured` | Public |
| GET | `/api/recipes/popular` | Public |
| GET | `/api/recipes/my` | Logged in |
| POST | `/api/recipes` | Logged in |
| GET | `/api/recipes/:id` | Public |
| PUT | `/api/recipes/:id` | Owner only |
| DELETE | `/api/recipes/:id` | Owner only |
| PATCH | `/api/recipes/:id/like` | Logged in |
| POST | `/api/favorites` | Logged in |
| DELETE | `/api/favorites/:recipeId` | Logged in |
| GET | `/api/favorites/my` | Logged in |
| POST | `/api/reports` | Logged in |
| GET | `/api/reports` | Admin |
| PATCH | `/api/reports/:id` | Admin |
| POST | `/api/payments/create-checkout-session` | Logged in |
| POST | `/api/payments/webhook` | Stripe only |
| GET | `/api/payments/my` | Logged in |
| GET | `/api/payments` | Admin |
| PATCH | `/api/users/profile` | Logged in |
| GET | `/api/users/stats` | Logged in |
| GET | `/api/admin/stats` | Admin |
| GET | `/api/admin/users` | Admin |
| PATCH | `/api/admin/users/:id/block` | Admin |
| PATCH | `/api/admin/users/:id/unblock` | Admin |
| GET | `/api/admin/recipes` | Admin |
| PUT | `/api/admin/recipes/:id` | Admin |
| DELETE | `/api/admin/recipes/:id` | Admin |
| PATCH | `/api/admin/recipes/:id/feature` | Admin |

## Project structure
config/ MongoDB connection
controllers/ Route logic
middleware/ JWT verification, admin check, rate limiting, error handling
models/ Collection shape documentation (no ODM schemas)
routes/ Express routers
scripts/ One-off scripts (admin account creation)
server.js App entry point


## Deployment notes

- Deployed on Render (free tier): https://recipehub-server-a8ff.onrender.com
- The free tier spins down after inactivity — the first request after idle
  time can take 30-50 seconds to respond.
- `CLIENT_URL` env var is set to the deployed client URL for CORS to work.
- MongoDB Atlas Network Access is set to allow access from anywhere
  (`0.0.0.0/0`) since Render's outbound IP isn't fixed on the free tier.
- Stripe webhook endpoint (once configured): `https://recipehub-server-a8ff.onrender.com/api/payments/webhook`
