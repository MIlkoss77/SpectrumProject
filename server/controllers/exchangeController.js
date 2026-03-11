import { prisma } from '../config/database.js';
import * as encryption from '../services/encryption.js';

export const saveExchangeKeys = async (req, res) => {
    try {
        const { userId } = req.user;
        const { exchange, apiKey, secret } = req.body;

        if (!exchange || !apiKey || !secret) {
            return res.status(400).json({ ok: false, error: 'Exchange, API Key, and Secret are required' });
        }

        const apiKeyEnc = encryption.encrypt(apiKey);
        const secretEnc = encryption.encrypt(secret);

        const creds = await prisma.exchangeCreds.upsert({
            where: {
                userId_exchange: {
                    userId,
                    exchange: exchange.toLowerCase()
                }
            },
            update: {
                apiKeyHash: apiKeyEnc,
                secretHash: secretEnc
            },
            create: {
                userId,
                exchange: exchange.toLowerCase(),
                apiKeyHash: apiKeyEnc,
                secretHash: secretEnc
            }
        });

        res.json({ ok: true, message: `Account for ${exchange} secured and saved.` });
    } catch (error) {
        console.error('Save Keys Error:', error.message);
        res.status(500).json({ ok: false, error: 'Internal Server Error' });
    }
};

export const getExchangeKeys = async (req, res) => {
    try {
        const { userId } = req.user;
        const { exchange } = req.query;

        if (!exchange) {
            return res.status(400).json({ ok: false, error: 'Exchange parameter is required' });
        }

        const creds = await prisma.exchangeCreds.findUnique({
            where: {
                userId_exchange: {
                    userId,
                    exchange: exchange.toLowerCase()
                }
            }
        });

        if (!creds) {
            return res.status(404).json({ ok: false, error: 'Credentials not found' });
        }

        const apiKey = encryption.decrypt(creds.apiKeyHash);
        const secret = encryption.decrypt(creds.secretHash);

        res.json({ ok: true, exchange: creds.exchange, apiKey, secret });
    } catch (error) {
        console.error('Get Keys Error:', error.message);
        res.status(500).json({ ok: false, error: 'Internal Server Error' });
    }
};

export const listUserExchanges = async (req, res) => {
    try {
        const { userId } = req.user;
        const exchanges = await prisma.exchangeCreds.findMany({
            where: { userId },
            select: { exchange: true, updatedAt: true }
        });
        res.json({ ok: true, exchanges });
    } catch (error) {
        res.status(500).json({ ok: false, error: 'Internal Server Error' });
    }
};
