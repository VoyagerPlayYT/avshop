const { products, paymentCards } = require('../config/products');
const orderManager = require('./orderManager');
const pdfGenerator = require('./pdfGenerator');

class PaymentHandler {
    constructor() {
        this.adminId = process.env.ADMIN_ID || ''; // Set admin Telegram ID
    }

    async processStarsPayment(ctx, productId, amount) {
        try {
            const product = products[productId];
            if (!product) {
                throw new Error('Товар не найден');
            }

            const invoice = {
                title: product.name,
                description: product.description,
                payload: `product_${productId}`,
                provider_token: '', // Empty for Telegram Stars
                currency: 'XTR', // Telegram Stars currency
                prices: [{ label: product.name, amount: amount }]
            };

            await ctx.replyWithInvoice(invoice);
            return true;
        } catch (error) {
            console.error('Stars payment error:', error);
            return false;
        }
    }

    async processClickPayment(ctx, orderId) {
        const order = orderManager.getOrder(orderId);
        if (!order) {
            await ctx.reply('❌ Заказ не найден');
            return;
        }

        const message = `
💳 Оплата через Click

📦 Заказ #${orderId}: ${order.product.name}
💰 Сумма: ${order.product.price.toLocaleString()} ${order.product.currency}

💳 Карты для оплаты:
• Uzcard (виртуальная): ${paymentCards.uzcard_virtual}
• Uzcard (физическая): ${paymentCards.uzcard_physical}

📝 После оплаты отправьте скриншот чека в этот чат.
`;

        ctx.session.awaitingPaymentProof = orderId;
        await ctx.reply(message);
    }

    async processCardPayment(ctx, orderId) {
        const order = orderManager.getOrder(orderId);
        if (!order) {
            await ctx.reply('❌ Заказ не найден');
            return;
        }

        let cardNumber = paymentCards.uzcard_virtual;
        let additionalInfo = '';

        if (order.product.type === 'channel') {
            cardNumber = order.product.payment_card;
            additionalInfo = `\n👤 После оплаты писать: ${order.product.contact}`;
        }

        const message = `
💳 Оплата картой

📦 Заказ #${orderId}: ${order.product.name}
💰 Сумма: ${order.product.price.toLocaleString()} ${order.product.currency}

💳 Карта для оплаты: ${cardNumber}${additionalInfo}

📝 После оплаты отправьте скриншот чека в этот чат.
`;

        ctx.session.awaitingPaymentProof = orderId;
        await ctx.reply(message);
    }

    async handlePaymentProof(ctx, orderId) {
        const order = orderManager.getOrder(orderId);
        if (!order) {
            await ctx.reply('❌ Заказ не найден');
            return;
        }

        // Mark order as paid and notify admin
        orderManager.markOrderAsPaid(orderId, { 
            proof: 'screenshot_provided',
            userId: ctx.from.id,
            username: ctx.from.username || 'Unknown'
        });

        await ctx.reply('✅ Чек получен! Ваш заказ передан на обработку. Ожидайте подтверждения.');

        // Notify admin
        if (this.adminId) {
            try {
                const adminMessage = `
🔔 Новая оплата!

📦 Заказ #${orderId}
👤 Пользователь: @${ctx.from.username || 'Unknown'} (ID: ${ctx.from.id})
🛍️ Товар: ${order.product.name}
💰 Сумма: ${order.product.price.toLocaleString()} ${order.product.currency}
⏰ Время: ${new Date().toLocaleString('ru-RU')}

Пользователь отправил чек об оплате.
`;
                await ctx.telegram.sendMessage(this.adminId, adminMessage);
            } catch (error) {
                console.error('Failed to notify admin:', error);
            }
        }

        // Auto-deliver digital products
        if (order.product.type === 'digital') {
            await this.deliverDigitalProduct(ctx, order);
        }
    }

    async handleSuccessfulStarsPayment(ctx) {
        const payload = ctx.message.successful_payment.invoice_payload;
        const productId = parseInt(payload.replace('product_', ''));
        const product = products[productId];

        if (!product) {
            await ctx.reply('❌ Ошибка: товар не найден');
            return;
        }

        // Create order
        const order = orderManager.createOrder(
            ctx.from.id,
            productId,
            product,
            'telegram_stars'
        );

        // Mark as paid
        orderManager.markOrderAsPaid(order.id, {
            telegram_payment_charge_id: ctx.message.successful_payment.telegram_payment_charge_id,
            provider_payment_charge_id: ctx.message.successful_payment.provider_payment_charge_id
        });

        await ctx.reply(`✅ Оплата успешно принята! Заказ #${order.id}`);

        // Auto-deliver digital product
        if (product.type === 'digital') {
            await this.deliverDigitalProduct(ctx, order);
        }
    }

    async deliverDigitalProduct(ctx, order) {
        try {
            let filepath;
            
            switch (order.productId) {
                case 1: // Business plan
                    filepath = await pdfGenerator.generateBusinessPlan(order.id);
                    break;
                case 2: // Online business guide
                    filepath = await pdfGenerator.generateOnlineBusinessGuide(order.id);
                    break;
                case 3: // Sound pack
                    filepath = await pdfGenerator.generateSoundPack(order.id);
                    break;
                default:
                    throw new Error('Unknown digital product');
            }

            // Send file
            await ctx.replyWithDocument({ source: filepath });
            await ctx.reply('📁 Ваш файл доставлен! Спасибо за покупку в AVShop!');

            // Mark order as completed
            orderManager.markOrderAsCompleted(order.id);

            // Clean up file
            setTimeout(() => {
                pdfGenerator.cleanupFile(filepath);
            }, 60000); // Delete after 1 minute

        } catch (error) {
            console.error('Digital delivery error:', error);
            await ctx.reply('❌ Ошибка при доставке файла. Обратитесь в поддержку.');
        }
    }
}

module.exports = new PaymentHandler();
