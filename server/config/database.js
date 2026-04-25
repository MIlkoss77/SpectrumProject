import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// Force local SQLite path if environment variable is missing or empty
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

export default prisma;
export { prisma };
