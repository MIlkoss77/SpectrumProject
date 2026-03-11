import * as notificationService from '../services/notificationService.js';

export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.user;
        const notifications = await notificationService.getUserNotifications(userId);
        res.json({ ok: true, notifications });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
};

export const markRead = async (req, res) => {
    try {
        const { id } = req.params;
        await notificationService.markAsRead(id);
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
};

export const markAllRead = async (req, res) => {
    try {
        const { userId } = req.user;
        await notificationService.markAllAsRead(userId);
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
};
