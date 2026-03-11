// Mock Prisma Client to unblock server refactoring until Prisma v7 configuration is resolved
const prisma = {
    user: { findUnique: async () => null },
    session: { findUnique: async () => null },
    $connect: async () => console.log('Mock DB Connected'),
    $disconnect: async () => { }
};

export default prisma;
export { prisma };
