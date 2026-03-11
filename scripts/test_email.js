import { sendEmail } from '../server/services/notificationService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testEmail() {
    console.log('Testing email notification...');
    console.log('SMTP Config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: process.env.SMTP_FROM
    });

    try {
        await sendEmail(
            process.env.SMTP_FROM || 'test@example.com', 
            'Test Notification', 
            'This is a test notification from Spectr Trading.'
        );
        console.log('Test completed successfully!');
    } catch (err) {
        console.error('Test failed:', err);
    }
}

testEmail();
