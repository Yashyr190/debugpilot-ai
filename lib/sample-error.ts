export interface SamplePreset {
  label: string;
  issue: string;
}

export const samplePresets: SamplePreset[] = [
  {
    label: "React rendering error",
    issue: `TypeError: Cannot read properties of undefined (reading 'map')
    at OrdersTable (app/(dashboard)/orders/page.tsx:68:24)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:15486:18)
    at updateFunctionComponent (node_modules/react-dom/cjs/react-dom.development.js:19617:20)

GET /api/orders?status=open 200 in 412ms
x-request-id: req_ord_49af21

Response preview:
{
  "orders": null,
  "cursor": "eyJpZCI6IjEwMjgifQ=="
}`
  },
  {
    label: "500 API failure",
    issue: `POST /api/billing/checkout 500 in 836ms
x-request-id: req_bill_72d91c
userId=user_8K2m

Error: Missing customerId for checkout session
    at createCheckoutSession (app/api/billing/checkout/route.ts:57:13)
    at async POST (app/api/billing/checkout/route.ts:24:21)
    at async AppRouteRouteModule.do (node_modules/next/dist/server/route-modules/app-route/module.js:342:17)

Response:
{"error":"Internal Server Error"}`
  },
  {
    label: "Expired auth token",
    issue: `GET /api/account/profile 401 in 58ms
x-request-id: req_auth_18c02f
cookie: session=eyJhbGciOiJIUzI1NiIs...

JWTExpired: token expired at 2026-05-11T09:20:14.000Z
    at requireSession (lib/auth/session.ts:34:11)
    at async GET (app/api/account/profile/route.ts:13:19)

Client symptom:
Profile page flashes content, then redirects to /login.`
  },
  {
    label: "Database timeout",
    issue: `PrismaClientInitializationError:
Timed out fetching a new connection from the connection pool.
Current timeout: 10s, pool limit: 5

Can't reach database server at db.internal:5432
    at getRecentDeployments (lib/deployments.ts:74:21)
    at async DashboardPage (app/(dashboard)/dashboard/page.tsx:18:16)

Environment: production
Region: iad1
Provider: Postgres`
  },
  {
    label: "Build failure",
    issue: `next build failed on Vercel
Commit: 7a4c9d2
Node.js: 20.x

./app/(dashboard)/settings/page.tsx:42:19
Type error: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.

  40 |   const org = await getCurrentOrg();
  41 |
> 42 |   return <SettingsForm organizationId={org.slug} />;
     |                   ^

Error: Command "npm run build" exited with 1`
  }
];

export const sampleError = samplePresets[0].issue;
