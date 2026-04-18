// 线上
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const accelerateUrl = process.env.DATABASE_URL;

if (!accelerateUrl) {
    throw new Error("DATABASE_URL 未设置.");
}

const createPrismaClient = () =>
    new PrismaClient({
        accelerateUrl,
    }).$extends(withAccelerate());

const globalForPrisma = globalThis as typeof globalThis & {
    prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;



// 本地
// import { PrismaClient } from "@prisma/client";
// import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// const connectionString = process.env.DIRECT_DATABASE_URL;

// if (!connectionString) {
//     throw new Error("DIRECT_DATABASE_URL 未设置");
// }

// const prismaClient = new PrismaClient({
//     adapter: new PrismaMariaDb(connectionString),
// });

// const globalForPrisma = globalThis as typeof globalThis & {
//     prisma?: typeof prismaClient;

// };

// export const prisma = globalForPrisma.prisma ?? prismaClient;

// if (process.env.NODE_ENV !== "production") {
//     globalForPrisma.prisma = prisma;
// }

// export default prisma;