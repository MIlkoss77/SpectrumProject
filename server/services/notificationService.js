import { prisma } from '../config/database.js';

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
