# Sprint 19 : RapidDispatch

RapidDispatch is a full-stack ecommerce application built with Next.js, Node.js, Express, MongoDB, Redux Toolkit, and GraphQL. Sprint 19 focuses on production bug triage and reliability improvements based on the Live-Ops Phase II engineering directive.

# **Session Isolation**

Fixed a session-state issue where cached client data could remain available after logout.

The logout flow now:

* Removes the persisted authentication data.
* Clears the Redux authentication state.
* Resets the RTK Query cache.
* Prevents previously loaded user-specific data from appearing in another session.

The fix was tested with multiple user accounts by logging in, logging out, and switching between accounts.

# **Cross-Browser Compatibility**

Updated the frontend PostCSS pipeline with Autoprefixer for better CSS compatibility across modern browser engines.

Compatibility was checked with:

* Chrome
* Firefox
* WebKit using Playwright

WebKit verification was performed through Playwright's WebKit runtime on Windows.

# **Memory Leak Triage**

Investigated the reported Node.js heap growth using Chrome DevTools heap snapshots.

A baseline snapshot was compared with a second snapshot after normal application usage, including:

* Product loading
* Authentication
* Profile usage
* Cart operations

Observed heap usage increased from approximately 85.2 MB to 87.5 MB.

No significant accumulation of detached nodes or closures was observed. A backend source audit also found no persistent timers, event listeners, global caches, subscriptions, or unbounded collections that could explain a continuously growing heap.

The reported memory leak could not be reproduced under the tested workload.

# **Tech Stack**

### *Frontend*

* Next.js 16
* React 19
* Redux Toolkit
* RTK Query
* Tailwind CSS
* PostCSS
* Autoprefixer
* Playwright

### *Backend*

* Node.js
* Express
* MongoDB
* Mongoose
* JWT authentication
* Apollo Server
* GraphQL

### *Security*

* Helmet
* CORS
* JWT authentication
* Role-based authorization
* Request validation


# **Running Locally**

### *Backend*

Open a terminal in the backend directory:

```bash
cd backend
npm install
npm run dev
```

The API runs on:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/api/health
```

GraphQL endpoint:

```text
http://localhost:4000/graphql
```

The backend requires environment variables such as the MongoDB connection string and authentication/AI configuration used by the application.

### *Frontend*

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

For local development, the frontend API URL is configured through:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Environment files containing secrets are intentionally excluded from Git.

# **Production Build**

Create an optimized frontend build with:

```bash
npm run build
```

The Sprint 19 production build completed successfully using Next.js 16.3.6.

# **WebKit Smoke Test**

Playwright is configured with a WebKit project for browser-engine compatibility testing.

Run:

```bash
npx playwright test webkit-smoke.spec.js --project=webkit
```

Current smoke test result:

```text
1 passed
```

## *API Routes*

The backend exposes the main application APIs under:

```text
/api/auth
/api/products
/api/cart
/api/orders
/api/users
/api/admin
```

The backend health endpoint is:

```text
GET /api/health
```

GraphQL is available through:

```text
POST /graphql
```

# **Sprint 19** 

Before deployment, the following checks were completed:

* Session isolation tested with multiple accounts
* Logout cache reset implemented
* Frontend production build passed
* PostCSS configured
* Autoprefixer configured
* Chrome compatibility checked
* Firefox compatibility checked
* WebKit smoke test passed
* Node.js heap snapshots compared
* Backend memory-retention patterns audited
* No persistent memory leak reproduced during local investigation

## *This repository is the Sprint 19 version of RapidDispatch and is maintained separately from the previous sprint.*
