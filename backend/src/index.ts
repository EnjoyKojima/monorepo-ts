import { Elysia } from "elysia";
import { bearer } from '@elysiajs/bearer'
import { cron } from '@elysiajs/cron'
import { jwt } from '@elysiajs/jwt'


const app = new Elysia()
  .use(bearer())
  .use(jwt({
    name: 'jwt',
    secret: 'Fischl von Luftschloss Narfidort'
  }))
  .use(cron({
    name: 'heartbeat',
    pattern: '*/10 * * * * *',
    run() {
      console.log('Heartbeat')
    }
  }))

app.get("/", () => "Hello Elysia")
app.get("/auth", () => "Hello Elysia")

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
