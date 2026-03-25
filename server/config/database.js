// Mock Prisma Client to unblock server refactoring until Prisma v7 configuration is resolved
const prisma = {
    user: { findUnique: async () => null },
    session: { findUnique: async () => null },
    payment: {
        create: async ({ data }) => ({ id: 'mock_pay_' + Date.now(), ...data }),
        findFirst: async () => null,
        findMany: async () => [],
        update: async ({ data }) => ({ status: 'COMPLETED', ...data })
    },
    auditLog: {
        create: async ({ data }) => ({ id: 'mock_log_' + Date.now(), ...data })
    },
    $connect: async () => console.log('Mock DB Connected'),
    $disconnect: async () => { }
};

export default prisma;
export { prisma };
