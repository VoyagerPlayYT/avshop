const { Markup } = require('telegraf');
const { products } = require('../config/products');
const orderManager = require('../services/orderManager');
const paymentHandler = require('../services/paymentHandler');
const keyboards = require('../utils/keyboards');
const helpers = require('../utils/helpers');

const commandHandlers = {
    async handleStart(ctx) {
        const welcomeMessage = `
🛍️ Добро пожаловать в AVShop!

Ваш надежный онлайн-магазин цифровых и физических товаров.

🔍 Доступные команды:
• /shop - Каталог товаров
• /buy [id] - Купить товар по ID

💫 У нас вы найдете:
📱 Цифровые продукты (бизнес-планы, гайды)
🎧 Физические товары (наушники, аксессуары)
📺 Готовые Telegram-каналы

Выберите действие:
`;

        await ctx.reply(welcomeMessage, keyboards.mainMenu);
    },

    async handleShop(ctx) {
        let message = '🛍️ Каталог товаров AVShop\n\n';
        
        // Digital products
        message += '💻 ЦИФРОВЫЕ ТОВАРЫ:\n';
        Object.values(products).filter(p => p.type === 'digital').forEach(product => {
            message += `${product.id}. ${product.name}\n`;
            message += `   💰 ${product.price.toLocaleString()} ${product.currency}\n`;
            message += `   ⭐ ${product.stars_price} Stars\n\n`;
        });

        // Physical products
        message += '📦 ФИЗИЧЕСКИЕ ТОВАРЫ:\n';
        Object.values(products).filter(p => p.type === 'physical').forEach(product => {
            message += `${product.id}. ${product.name}\n`;
            message += `   💰 ${product.price.toLocaleString()} ${product.currency}\n\n`;
        });

        // Channels
        message += '📺 TELEGRAM-КАНАЛЫ:\n';
        Object.values(products).filter(p => p.type === 'channel').forEach(product => {
            message += `${product.id}. ${product.name}\n`;
            message += `   💰 ${product.price} ${product.currency}\n\n`;
        });

        message += '🛒 Для покупки используйте: /buy [номер товара]';

        await ctx.reply(message, keyboards.shopMenu);
    },

    async handleBuy(ctx) {
        const args = ctx.message.text.split(' ');
        if (args.length < 2) {
            await ctx.reply('❌ Укажите ID товара. Например: /buy 1');
            return;
        }

        const productId = parseInt(args[1]);
        const product = products[productId];

        if (!product) {
            await ctx.reply('❌ Товар с таким ID не найден. Используйте /shop для просмотра каталога.');
            return;
        }

        await commandHandlers.showProductDetails(ctx, productId);
    },

    async handleBuyCallback(ctx) {
        const productId = parseInt(ctx.callbackQuery.data.replace('buy_', ''));
        await commandHandlers.showProductDetails(ctx, productId);
    },

    async showProductDetails(ctx, productId) {
        const product = products[productId];
        if (!product) {
            await ctx.reply('❌ Товар не найден');
            return;
        }

        const message = `
🛍️ ${product.name}

📝 ${product.description}
💰 Цена: ${product.price.toLocaleString()} ${product.currency}
${product.stars_price ? `⭐ Или ${product.stars_price} Telegram Stars` : ''}
📦 Тип: ${helpers.getProductTypeText(product.type)}

Выберите способ оплаты:
`;

        await ctx.reply(message, keyboards.getPaymentKeyboard(productId, product.type));
    },

    async handlePaymentCallback(ctx) {
        const data = ctx.callbackQuery.data;
        const [, method, productId] = data.split('_');
        const product = products[parseInt(productId)];

        if (!product) {
            await ctx.reply('❌ Товар не найден');
            return;
        }

        // Create order
        const order = orderManager.createOrder(
            ctx.from.id,
            parseInt(productId),
            product,
            method
        );

        switch (method) {
            case 'stars':
                if (product.type !== 'digital') {
                    await ctx.reply('❌ Telegram Stars доступны только для цифровых товаров');
                    return;
                }
                await paymentHandler.processStarsPayment(ctx, parseInt(productId), product.stars_price);
                break;

            case 'click':
                await paymentHandler.processClickPayment(ctx, order.id);
                break;

            case 'card':
                await paymentHandler.processCardPayment(ctx, order.id);
                break;

            default:
                await ctx.reply('❌ Неизвестный способ оплаты');
        }
    },

    async handlePaymentProof(ctx) {
        const orderId = ctx.session.awaitingPaymentProof;
        if (!orderId) {
            return;
        }

        ctx.session.awaitingPaymentProof = null;
        await paymentHandler.handlePaymentProof(ctx, orderId);
    },

    async handleSuccessfulPayment(ctx) {
        await paymentHandler.handleSuccessfulStarsPayment(ctx);
    },

    async handleSupport(ctx) {
        const supportMessage = `
📞 Поддержка AVShop

🎧 Бот поддержки: @AVShopofficialsupportbot
👨‍💼 Администраторы: @Ashraf_ASH2013, @m_asadbek_b

💡 Для быстрой помощи используйте наш бот поддержки:
• FAQ по всем вопросам
• Прямая связь с администратором
• Отслеживание обращений

📋 Быстрые ответы:
• Цифровые товары - доставка мгновенная
• Физические товары - 1-3 рабочих дня
• Каналы - после подтверждения оплаты

💳 Способы оплаты:
• Telegram Stars (только цифровые товары)
• Click/Uzcard • Банковские карты
        `;

        const supportKeyboard = Markup.inlineKeyboard([
            [Markup.button.url('🎧 Бот поддержки', 'https://t.me/AVShopofficialsupportbot')],
            [Markup.button.url('👨‍💼 @Ashraf_ASH2013', 'https://t.me/Ashraf_ASH2013')],
            [Markup.button.url('👨‍💼 @m_asadbek_b', 'https://t.me/m_asadbek_b')],
            [Markup.button.callback('⬅️ Главное меню', 'main_menu')]
        ]);

        await ctx.reply(supportMessage, supportKeyboard);
    },

    async handleCategory(ctx) {
        const category = ctx.callbackQuery.data.replace('category_', '');
        let message = '';
        let filteredProducts = [];

        switch (category) {
            case 'digital':
                message = '💻 ЦИФРОВЫЕ ТОВАРЫ:\n\n';
                filteredProducts = Object.values(products).filter(p => p.type === 'digital');
                break;
            case 'physical':
                message = '📦 ФИЗИЧЕСКИЕ ТОВАРЫ:\n\n';
                filteredProducts = Object.values(products).filter(p => p.type === 'physical');
                break;
            case 'channels':
                message = '📺 TELEGRAM-КАНАЛЫ:\n\n';
                filteredProducts = Object.values(products).filter(p => p.type === 'channel');
                break;
        }

        filteredProducts.forEach(product => {
            message += `${product.id}. ${product.name}\n`;
            message += `💰 ${product.price.toLocaleString()} ${product.currency}`;
            if (product.stars_price) {
                message += ` (⭐ ${product.stars_price} Stars)`;
            }
            message += `\n📝 ${product.description}\n\n`;
        });

        message += '🛒 Для покупки используйте: /buy [номер товара]';

        // Create buy buttons for each product in category
        const buyButtons = filteredProducts.map(product => {
            const shortName = product.name.length > 25 ? 
                product.name.substring(0, 22) + '...' : 
                product.name;
            return [Markup.button.callback(`🛒 ${shortName}`, `buy_${product.id}`)];
        });

        buyButtons.push([Markup.button.callback('⬅️ К каталогу', 'shop')]);
        buyButtons.push([Markup.button.callback('🏠 Главное меню', 'main_menu')]);

        await ctx.reply(message, Markup.inlineKeyboard(buyButtons));
    }
};

module.exports = commandHandlers;
