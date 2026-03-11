import { prisma } from '../config/database.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Sends an email notification.
 * @param {string} to 
 * @param {string} subject 
 * @param {string} text 
 */
export const sendEmail = async (to, subject, text) => {
    try {
        if (!process.env.SMTP_HOST) {
            console.warn('[Notification] SMTP not configured, skipping email.');
            return;
        }

        await transporter.sendMail({
            from: `"Spectr Trading" <${process.env.SMTP_FROM}>`,
            to,
            subject,
            text,
        });
        console.log(`[Email Sent] To: ${to}`);
    } catch (error) {
        console.error('[Email Error]', error);
    }
};

/**
 * Creates a new notification for a user.
 * @param {string} userId 
 * @param {string} type "INFO" | "SUCCESS" | "WARNING" | "ERROR"
 * @param {string} title 
 * @param {string} message 
 */
export const createNotification = async (userId, type, title, message) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message
            }
        });

        // If email notifications were configured (e.g. via nodemailer), we would send it here.
        // For now, we only store in DB for the UI Bell Menu.
        console.log(`[Notification Created] ${title}: ${message}`);
        
        // Critical alerts check
        if (type === 'WARNING' || type === 'ERROR' || title.includes('Login')) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user && user.email) {
                await sendEmail(user.email, title, message);
            }
        }
        
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

/**
 * Gets all notifications for a user.
 * @param {string} userId 
 */
export const getUserNotifications = async (userId) => {
    return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
};

/**
 * Marks a notification as read.
 * @param {string} notificationId 
 */
export const markAsRead = async (notificationId) => {
    return await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
    });
};

/**
 * Marks all notifications as read for a user.
 * @param {string} userId 
 */
export const markAllAsRead = async (userId) => {
    return await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
    });
};
