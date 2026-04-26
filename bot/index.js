import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../server/config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const token = process.env.TELEGRAM_BOT_TOKEN;

// Global Error Handlers for Stability
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason, promise) => console.error('Unhandled Rejection at:', promise, 'reason:', reason));

if (!token) {
    console.error('CRITICAL: TELEGRAM_BOT_TOKEN is missing in .env');
    process.exit(1);
}

const bot = new TelegramBot(token, { 
    polling: {
        interval: 300,
        autoStart: true,
        params: { timeout: 10 }
    }
});

// Start the background scout for Alpha Signals
import { telegramScout } from '../server/services/telegramService.js';
telegramScout.start();

console.log('🤖 Spectr Bot is running...');

// ==========================================
// Command: /start (User Card)
// ==========================================
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const tgUser = msg.from;
    const tgUserId = tgUser.id.toString();

    try {
        // Try to find user in our Neon DB
        const user = await prisma.user.findUnique({
            where: { telegramId: tgUserId }
        });

        const status = user?.subscriptionStatus || 'FREE TIER';
        const isPro = status === 'PRO';

        const welcomeText = `
🌌 *SPECTR TRADING PROTOCOL*
Welcome, [${tgUser.first_name || tgUser.username}](tg://user?id=${tgUser.id}).

💳 *USER CARD*
ID: \`${tgUserId}\`
Status: ${isPro ? '💎' : '⚪️'} *${status}*
Access: ${isPro ? 'Full Intel & Academy' : 'Basic Market Data'}

*Commands:*
/scout - ⚡ Get latest Alpha Signals
/check <contract> - 🔍 Analyze a token contract
/link <email> - 🔗 Link your Spectr Web account

_Trade with AI. Win with Biology._
        `;

        const opts = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🚀 Launch Spectr App', url: 'https://app.spectrtrading.com' },
                        { text: '🧠 Academy', url: 'https://spectrtrading.com/#academy' }
                    ],
                    [!isPro ? { text: '💎 Upgrade to PRO ($29/mo)', callback_data: 'buy_pro' } : { text: '✅ PRO Active', callback_data: 'pro_info' }]
                ].filter(row => row.length > 0)
            }
        };

        bot.sendMessage(chatId, welcomeText, opts);
    } catch (error) {
        console.error('Error in /start:', error);
        bot.sendMessage(chatId, "🌌 *SPECTR TRADING PROTOCOL* \nSystem online. Use /scout to begin.");
    }
});

// ==========================================
// Command: /scout (Alpha Signals)
// ==========================================
bot.onText(/\/scout/, async (msg) => {
    const chatId = msg.chat.id;
    const tgUserId = msg.from.id.toString();

    try {
        const user = await prisma.user.findUnique({ where: { telegramId: tgUserId } });
        const isPro = user?.subscriptionStatus === 'PRO';

        const signals = telegramScout.getSignals();

        if (!signals || signals.length === 0) {
            return bot.sendMessage(chatId, "🛰 *Scout Status:* Searching for alpha... Check back in a few minutes.", { parse_mode: 'Markdown' });
        }

        // Free users get 2 signals, Pro users get 5
        const limit = isPro ? 5 : 2;
        const latest = signals.slice(0, limit);
        
        let response = `⚡ *FEROCIOUS SCOUT: LATEST ALPHA* ⚡\n`;
        if (!isPro) response += `_(Free Tier: Showing 2/5 signals)_\n\n`;
        else response += `\n`;

        latest.forEach((sig, i) => {
            const time = new Date(sig.timestamp).toLocaleTimeString();
            response += `${i + 1}. *[${sig.channel.toUpperCase()}]* at ${time}\n`;
            response += `> ${sig.text.substring(0, 150)}${sig.text.length > 150 ? '...' : ''}\n`;
            if (sig.contractAddress) {
                response += `> \`CA: ${sig.contractAddress.address}\`\n`;
            }
            response += `📈 *Intel Score: ${sig.intelScore}/100*\n\n`;
        });

        const opts = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    !isPro ? [{ text: '🔓 Unlock All Signals (Get PRO)', url: 'https://app.spectrtrading.com/upgrade' }] : [],
                    [{ text: '🔄 Refresh', callback_data: 'refresh_scout' }]
                ].filter(row => row.length > 0)
            }
        };

        bot.sendMessage(chatId, response, opts);
    } catch (error) {
        console.error('Error fetching signals:', error.message);
        bot.sendMessage(chatId, "⚠️ Failed to fetch alpha signals.");
    }
});

// ==========================================
// Passive Monitoring: Auto-detect Contracts
// ==========================================
bot.on('message', async (msg) => {
    // Skip if it's a command
    if (msg.text?.startsWith('/')) return;

    const solRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/;
    const evmRegex = /0x[a-fA-F0-9]{40}/;
    
    const match = msg.text?.match(solRegex) || msg.text?.match(evmRegex);
    if (match) {
        const contract = match[0];
        // Only auto-check if it looks like a real contract (shallow validation)
        if (contract.length >= 32) {
             handleContractCheck(msg.chat.id, contract, msg.from.username);
        }
    }
});

async function handleContractCheck(chatId, contract, username) {
    try {
        const { data } = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${contract}`);
        
        if (!data.pairs || data.pairs.length === 0) return; // Silent fail for passive check to avoid spam

        const pair = data.pairs[0];
        const chain = pair.chainId.toUpperCase();
        
        let score = 50;
        const liq = pair.liquidity?.usd || 0;
        const vol = pair.volume?.h24 || 0;
        
        if (liq > 100000) score += 25;
        if (vol > 500000) score += 20;
        if (pair.priceChange?.h1 > 5) score += 5;

        const text = `
🌌 *SPECTR INTEL: ALPHA DETECTED*
Analysis for \`${pair.baseToken.symbol}/${pair.quoteToken.symbol}\` on *${chain}*

📊 *ON-CHAIN METRICS:*
• Price: \`$${pair.priceUsd}\`
• Liq: \`$${liq.toLocaleString()}\`
• Vol: \`$${vol.toLocaleString()}\`
• 1h: \`${pair.priceChange?.h1 || 0}%\`

🧠 *INTEL SCORE:* **${score}/100**
${score > 75 ? '🟢 *HIGH CONVICTION:* Low risk, high liquidity.' : (score > 40 ? '🟡 *NEUTRAL:* Standard risk. Check holders.' : '🔴 *HIGH RISK:* Low liquidity or sell pressure.')}

📢 *CTA:* 
[Unlock Full IntelScore & Academy Guides](https://app.spectrtrading.com)
        `;

        const opts = {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 Open in Spectr App', url: 'https://app.spectrtrading.com' }],
                    [{ text: '📊 DexScreener', url: pair.url }]
                ]
            }
        };

        bot.sendMessage(chatId, text, opts);
    } catch (e) {
        // Silent fail for passive
    }
}

// ==========================================
// Command: /check <contract>
// ==========================================
bot.onText(/\/check(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const contract = match[1]?.trim();

    if (!contract) {
        return bot.sendMessage(chatId, "🔍 *QuickCheck Protocol:* \nSend a contract address to get instant AI validation.", { parse_mode: 'Markdown' });
    }

    handleContractCheck(chatId, contract, msg.from.username);
});

// ==========================================
// Command: /admin (Restricted)
// ==========================================
bot.onText(/\/admin/, async (msg) => {
    const chatId = msg.chat.id;
    const tgId = msg.from.id.toString();

    try {
        const user = await prisma.user.findUnique({ where: { telegramId: tgId } });
        if (user?.role !== 'ADMIN') {
            return bot.sendMessage(chatId, "🚫 *ACCESS DENIED:* Administrative privileges required.", { parse_mode: 'Markdown' });
        }

        const userCount = await prisma.user.count();
        const proCount = await prisma.user.count({ where: { subscriptionStatus: 'PRO' } });

        const text = `
🛠 *SPECTR ADMIN TERMINAL*
Status: \`AUTHENTICATED\`

📈 *NETWORK STATS:*
• Total Agents: \`${userCount}\`
• Pro Nodes: \`${proCount}\`
• DB Status: \`CONNECTED (NEON)\`

*Controls:*
/stats - Full growth report
/broadcast <msg> - Alert all users
        `;

        bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    } catch (e) {
        bot.sendMessage(chatId, "⚠️ Admin Terminal Error.");
    }
});

// ==========================================
// Command: /link <email>
// ==========================================
bot.onText(/\/link (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const email = match[1].trim();
    const tgId = msg.from.id.toString();

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return bot.sendMessage(chatId, `❌ *User not found:* \`${email}\`. \nPlease register at [spectrtrading.com](https://spectrtrading.com) first.`, { parse_mode: 'Markdown' });
        }

        await prisma.user.update({
            where: { email },
            data: { telegramId: tgId }
        });

        bot.sendMessage(chatId, `✅ *Success!* \nYour Telegram is now linked to \`${email}\`. \nYour *${user.subscriptionStatus}* status is active.`, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, `⚠️ *Link Failed:* ${error.message}`);
    }
});

// ==========================================
// Callback Queries (Buttons)
// ==========================================
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    if (query.data === 'buy_pro') {
        bot.sendMessage(chatId, "💎 *Spectr PRO Subscription* \n- Full access to all Alpha Signals \n- Unlock IntelScore 100 \n- Academy Biohacking Guides \n\nPrice: $29/mo \n[Buy Now via Web App](https://app.spectrtrading.com/upgrade)", { parse_mode: 'Markdown' });
    }
    bot.answerCallbackQuery(query.id);
});
