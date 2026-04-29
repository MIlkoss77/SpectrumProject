import { prisma } from '../config/database.js';
import * as authService from '../services/authService.js';
import * as notificationService from '../services/notificationService.js';

export const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ ok: false, error: 'Email and password required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ ok: false, error: 'Email already exists' });
        }

        const passwordHash = await authService.hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash
            }
        });

        const token = authService.generateToken(user.id);

        // Create Welcome Notification
        await notificationService.createNotification(
            user.id,
            'SUCCESS',
            'Welcome to Spectr Trading! 🚀',
            'Your account has been successfully created. We recommend completing the onboarding tour to get started.'
        );

        res.status(201).json({ ok: true, user: { id: user.id, email: user.email }, token });
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({ ok: false, error: 'Internal Server Error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ ok: false, error: 'Invalid credentials' });
        }

        const isValid = await authService.comparePassword(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ ok: false, error: 'Invalid credentials' });
        }

        const token = authService.generateToken(user.id);

        // Create Login Notification
        await notificationService.createNotification(
            user.id,
            'INFO',
            'New Login Detected',
            `Successfully logged in from ${req.ip || 'unknown IP'}.`
        );

        res.json({ ok: true, user: { id: user.id, email: user.email }, token });
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ ok: false, error: 'Internal Server Error' });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, createdAt: true }
        });
        res.json({ ok: true, user });
    } catch (error) {
        res.status(500).json({ ok: false, error: 'Internal Server Error' });
    }
};
