import { Elysia, t } from "elysia";
import { cron } from '@elysiajs/cron'
import { jwt } from '@elysiajs/jwt'


const app = new Elysia()
  .use(jwt({
    name: 'jwtAccess',
    secret: process.env.JWT_SECRET!,
    schema: t.Object({
      username: t.String(),
      role: t.String()
    }),
    exp: '15m',
    alg: 'HS256',
    iss: 'monorepo.localhost',
  }))
  .use(jwt({
    name: 'jwtRefresh',
    secret: process.env.JWT_SECRET!,
    schema: t.Object({
      username: t.String()
    }),
    exp: '10d',
    alg: 'HS256',
    iss: 'monorepo.localhost',
  }))
  .use(cron({
    name: 'heartbeat',
    pattern: '*/10 * * * * *',
    run() {
      console.log('Heartbeat')
    }
  }))

app.get("/", () => "Hello Elysia")
app.post("/auth", async ({ jwtAccess, jwtRefresh, cookie: { accessToken, refreshToken }, body }) => {
  if (body.username !== 'kojima' || body.password !== 'super-secure') {
    return 'Unauthorized'
  }
  accessToken.set({
    value: await jwtAccess.sign({
      username: body.username,
      role: 'admin'
    }),
    httpOnly: true,
    domain: 'monorepo.localhost',
    secure: true,
    sameSite: 'strict',
  })
  refreshToken.set({
    value: await jwtRefresh.sign({
      username: body.username
    }),
    httpOnly: true,
    domain: 'monorepo.localhost',
    secure: true,
    sameSite: 'strict',
  })
  return 'Authorized'
}, {
  body: t.Object({
    username: t.String(),
    password: t.String()
  })
})

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
