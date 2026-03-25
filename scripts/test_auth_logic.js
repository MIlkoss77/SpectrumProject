import { prisma } from '../server/config/database.js';
import * as authController from '../server/controllers/authController.js';

async function test() {
    console.log('--- Testing Auth Flow ---');
    
    // Mock req/res for register
    const regReq = {
        body: {
            email: `test_${Date.now()}@example.com`,
            password: 'password123'
        }
    };
    
    let result;
    const regRes = {
        status: (code) => ({ json: (data) => { result = { code, ...data }; } }),
        json: (data) => { result = { code: 200, ...data }; }
    };

    console.log('1. Registering user...');
    await authController.register(regReq, regRes);
    console.log('Result:', result);

    if (result.ok) {
        console.log('2. Attempting login...');
        const loginReq = {
            body: {
                email: regReq.body.email,
                password: 'password123'
            }
        };
        const loginRes = {
            status: (code) => ({ json: (data) => { result = { code, ...data }; } }),
            json: (data) => { result = { code: 200, ...data }; }
        };
        await authController.login(loginReq, loginRes);
        console.log('Login Result:', result);
    }

    await prisma.$disconnect();
}

test().catch(err => {
    console.error('Test Failed:', err);
    process.exit(1);
});
