import pkg from '@prisma/client';
import dotenv from 'dotenv';
const { PrismaClient } = pkg;

dotenv.config();

const prisma = new PrismaClient();

export default prisma;
export { prisma };
