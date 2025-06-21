const { Telegraf, Markup } = require('telegraf');
const commandHandlers = require('./handlers/commandHandlers');
const adminHandlers = require('./handlers/adminHandlers');
const orderManager = require('./services/orderManager');

// Bot token from environment or hardcoded
const BOT_TOKEN = process.env.BOT_TOKEN || '7257034501:AAHmfA3k4Vv3_uqdLmhQGA05vyWStfU1_Qg';

// Create bot instance
const bot = new Telegraf(BOT_TOKEN);

// Initialize session store
const sessions = new Map();

// Middleware to track user sessions
bot.use((ctx, next) => {
    const sessionKey = ctx.from?.id || 'anonymous';
    if (!sessions.has(sessionKey)) {
        sessions.set(sessionKey, {});
    }
    ctx.session = sessions.get(sessionKey);
    return next();
});

// Command handlers
bot.start(commandHandlers.handleStart);
bot.command('shop', commandHandlers.handleShop);
bot.command('buy', commandHandlers.handleBuy);
bot.command('admin', adminHandlers.handleAdminAuth);

// Callback query handlers
bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    
    try {
        if (data.startsWith('buy_')) {
            await commandHandlers.handleBuyCallback(ctx);
        } else if (data.startsWith('payment_')) {
            await commandHandlers.handlePaymentCallback(ctx);
        } else if (data.startsWith('admin_')) {
            await adminHandlers.handleAdminCallback(ctx);
        } else if (data.startsWith('order_')) {
            await adminHandlers.handleOrderCallback(ctx);
        } else if (data === 'shop') {
            await commandHandlers.handleShop(ctx);
        } else if (data === 'support') {
            await commandHandlers.handleSupport(ctx);
        } else if (data === 'main_menu') {
            await commandHandlers.handleStart(ctx);
        } else if (data.startsWith('category_')) {
            await commandHandlers.handleCategory(ctx);
        }
        
        await ctx.answerCbQuery();
    } catch (error) {
        console.error('Callback query error:', error);
        try {
            await ctx.answerCbQuery('Произошла ошибка');
        } catch (answerError) {
            // Ignore callback answer errors (timeout/expired)
            console.log('Callback query already expired');
        }
        await ctx.reply('❌ Произошла ошибка. Попробуйте еще раз.');
    }
});

// Text message handlers
bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    
    // Admin password check
    if (ctx.session.awaitingAdminPassword) {
        await adminHandlers.handlePasswordInput(ctx);
        return;
    }
    
    // Payment proof handling
    if (ctx.session.awaitingPaymentProof) {
        await commandHandlers.handlePaymentProof(ctx);
        return;
    }
});

// Pre-checkout query handler for Telegram Stars
bot.on('pre_checkout_query', async (ctx) => {
    try {
        await ctx.answerPreCheckoutQuery(true);
    } catch (error) {
        console.error('Pre-checkout error:', error);
        await ctx.answerPreCheckoutQuery(false, 'Ошибка при обработке платежа');
    }
});

// Successful payment handler
bot.on('successful_payment', async (ctx) => {
    await commandHandlers.handleSuccessfulPayment(ctx);
});

// Error handling
bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('Произошла ошибка. Попробуйте позже.');
});

// Start the bot
console.log('Starting AVShop Telegram Bot...');

async function startBot() {
    try {
        // Clear any existing webhooks
        await bot.telegram.deleteWebhook();
        console.log('Webhook cleared');
        
        // Test bot connection first
        const me = await bot.telegram.getMe();
        console.log(`Bot info: ${me.first_name} (@${me.username})`);
        
        // Start polling with timeout
        await Promise.race([
            bot.launch(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Startup timeout')), 10000)
            )
        ]);
        
        console.log('Bot is running!');
        console.log('Ready to receive messages...');
        
    } catch (error) {
        console.error('Failed to start bot:', error);
        console.log('Attempting alternative startup...');
        
        // Alternative startup method
        try {
            bot.startPolling();
            console.log('Bot started with alternative method');
        } catch (altError) {
            console.error('Alternative startup failed:', altError);
            process.exit(1);
        }
    }
}

startBot();

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;
