import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

try {
    const adminUser = await prisma.user.findUnique({
        where: { username: 'admin' },
    })
    if (!adminUser) {
        await prisma.user.create({
            data: {
                username: 'admin',
                password: await Bun.password.hash('admin'),
            },
        })
    }

    const normalUser = await prisma.user.findUnique({
        where: { username: 'user' },
    })
    if (!normalUser) {
        await prisma.user.create({
            data: {
                username: 'user',
                password: await Bun.password.hash('user'),
            },
        })
    }
} catch (e) {
    console.error(e)
} finally {
    await prisma.$disconnect()
    process.exit(0)
}
