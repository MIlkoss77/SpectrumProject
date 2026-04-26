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
// Command: /check <contract>
// ==========================================
bot.onText(/\/check(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const contract = match[1]?.trim();

    if (!contract) {
        return bot.sendMessage(chatId, "🔍 *How to use:* \nSend `/check <address>` to analyze any token contract (Solana, Ethereum, Base, etc.)", { parse_mode: 'Markdown' });
    }

    bot.sendMessage(chatId, `🔍 Analyzing contract: \`${contract}\`...`, { parse_mode: 'Markdown' });

    try {
        const { data } = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${contract}`);
        
        if (!data.pairs || data.pairs.length === 0) {
            return bot.sendMessage(chatId, `❌ *No trading pairs found* for this contract on DexScreener. Ensure the address is correct.`, { parse_mode: 'Markdown' });
        }

        const pair = data.pairs[0];
        const chain = pair.chainId.toUpperCase();
        const price = pair.priceUsd || '0.00';
        const volume = pair.volume?.h24 || 0;
        const fdv = pair.fdv || 0;
        const liquidity = pair.liquidity?.usd || 0;
        
        let score = 50;
        if (liquidity > 50000) score += 20;
        if (volume > 100000) score += 20;
        if (pair.priceChange?.h1 > 0) score += 10;

        const text = `
⚡ *SPECTR INTEL: CONTRACT ANALYSIS* ⚡
*Chain:* ${chain}
*Pair:* ${pair.baseToken.symbol}/${pair.quoteToken.symbol}
*Price:* $${price}

📊 *METRICS:*
• Liquidity: $${liquidity.toLocaleString()}
• 24h Volume: $${volume.toLocaleString()}
• FDV: $${fdv.toLocaleString()}
• 1h Change: ${pair.priceChange?.h1 || 0}%

🧠 *AI CONFIDENCE SCORE:* **${score}/100**
${score > 80 ? '🟢 Looks solid.' : (score > 50 ? '🟡 Average risk. DYOR.' : '🔴 High Risk / Low Liquidity.')}

[View on DexScreener](${pair.url})
        `;

        const opts = {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 Unlock Full Analytics', url: 'https://app.spectrtrading.com' }]
                ]
            }
        };

        bot.sendMessage(chatId, text, opts);
    } catch (error) {
        console.error('Error checking contract:', error.message);
        bot.sendMessage(chatId, `⚠️ *Analysis Failed:* \n${error.message}. Ensure it's a valid contract address.`);
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
