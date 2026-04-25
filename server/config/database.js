import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// In Prisma 7, we pass the URL directly to the constructor
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || 'file:./dev.db'
});

export default prisma;
export { prisma };
