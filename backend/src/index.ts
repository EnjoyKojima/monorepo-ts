import { Elysia, t, CookieOptions } from "elysia";
import { cron } from '@elysiajs/cron'
import { jwt } from '@elysiajs/jwt'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

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
app.post('user', async ({ body }) => {
  const hashedPassword = await Bun.password.hash(body.password)
  const newUser = await db.user.create({
    data: {
      username: body.username,
      password: hashedPassword
    }
  })
  return {
    id: newUser.id,
    username: newUser.username
  }
}, {
  body: t.Object({
    username: t.String(),
    password: t.String()
  })
})
app.post("/auth", async ({ jwtAccess, jwtRefresh, cookie: { accessToken, refreshToken }, body, set }) => {
  const user = await db.user.findUnique({
    where: {
      username: body.username
    }
  })
  const isMatch = await Bun.password.verify(body.password, user?.password || '')
  if (!isMatch) {
    return (set.status = 'Unauthorized')
  }
  const commonAttrs: CookieOptions = {
    httpOnly: true,
    domain: 'monorepo.localhost',
    secure: true,
    sameSite: 'strict'
  } as const
  accessToken.set({
    value: await jwtAccess.sign({
      username: body.username,
      role: 'admin'
    }),
    ...commonAttrs
  })
  refreshToken.set({
    value: await jwtRefresh.sign({
      username: body.username
    }),
    ...commonAttrs
  })
  return 'Authorized'
}, {
  body: t.Object({
    username: t.String(),
    password: t.String()
  })
})
app.get('/products', async ({ }) => {
  return [
    { id: 1, name: 'Product 1' },
    { id: 2, name: 'Product 2' },
    { id: 3, name: 'Product 3' },
  ]
}, {
  async beforeHandle({ jwtAccess, set, cookie: { accessToken } }) {
    const auth = await jwtAccess.verify(accessToken.value)
    console.log({ auth })
    if (!auth) {
      return (set.status = 'Unauthorized')
    }
  }
})

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
