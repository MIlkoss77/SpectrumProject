import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// Use environment variable if present, Prisma handles the rest if url is in schema
const prisma = new PrismaClient();

export default prisma;
export { prisma };
