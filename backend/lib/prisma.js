import { PrismaClient } from "@prisma/client";

let prisma;
if (!global._prisma) {
    global._prisma = new PrismaClient();
}
prisma = global._prisma;

export { prisma };
export default prisma;
