const { Markup } = require('telegraf');
const orderManager = require('../services/orderManager');
const helpers = require('../utils/helpers');

const ADMIN_PASSWORD = 'V0yageRpl@y2013@';

const adminHandlers = {
    async handleAdminAuth(ctx) {
        ctx.session.awaitingAdminPassword = true;
        await ctx.reply('🔐 Введите пароль администратора:');
    },

    async handlePasswordInput(ctx) {
        const password = ctx.message.text;
        ctx.session.awaitingAdminPassword = false;

        if (password === ADMIN_PASSWORD) {
            ctx.session.isAdmin = true;
            await adminHandlers.showAdminPanel(ctx);
        } else {
            await ctx.reply('❌ Неверный пароль');
        }
    },

    async showAdminPanel(ctx) {
        if (!ctx.session.isAdmin) {
            await ctx.reply('❌ Доступ запрещен');
            return;
        }

        const stats = orderManager.getOrderStats();
        const message = `
👨‍💼 Панель администратора AVShop

📊 Статистика заказов:
• Всего: ${stats.total}
• Ожидают: ${stats.pending}
• Оплачены: ${stats.paid}
• Выполнены: ${stats.completed}
• Отменены: ${stats.cancelled}

Выберите действие:
`;

        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('📋 Все заказы', 'admin_orders_all')],
            [Markup.button.callback('⏳ Ожидающие', 'admin_orders_pending')],
            [Markup.button.callback('💰 Оплаченные', 'admin_orders_paid')],
            [Markup.button.callback('📊 Статистика', 'admin_stats')]
        ]);

        await ctx.reply(message, keyboard);
    },

    async handleAdminCallback(ctx) {
        if (!ctx.session.isAdmin) {
            await ctx.reply('❌ Доступ запрещен');
            return;
        }

        const data = ctx.callbackQuery.data;
        const action = data.replace('admin_', '');

        switch (action) {
            case 'orders_all':
                await adminHandlers.showAllOrders(ctx);
                break;
            case 'orders_pending':
                await adminHandlers.showPendingOrders(ctx);
                break;
            case 'orders_paid':
                await adminHandlers.showPaidOrders(ctx);
                break;
            case 'stats':
                await adminHandlers.showDetailedStats(ctx);
                break;
        }
    },

    async showAllOrders(ctx) {
        const orders = orderManager.getAllOrders();
        
        if (orders.length === 0) {
            await ctx.reply('📭 Заказов пока нет');
            return;
        }

        let message = '📋 Все заказы:\n\n';
        
        orders.slice(0, 10).forEach(order => { // Show last 10 orders
            message += `🆔 #${order.id} | ${helpers.getStatusEmoji(order.status)} ${order.status}\n`;
            message += `👤 ID: ${order.userId}\n`;
            message += `🛍️ ${order.product.name}\n`;
            message += `💰 ${order.product.price.toLocaleString()} ${order.product.currency}\n`;
            message += `⏰ ${order.createdAt.toLocaleString('ru-RU')}\n`;
            message += '─────────────\n';
        });

        if (orders.length > 10) {
            message += `\n... и еще ${orders.length - 10} заказов`;
        }

        // Add order management buttons
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('🔄 Обновить', 'admin_orders_all')],
            [Markup.button.callback('⬅️ Назад', 'admin_panel')]
        ]);

        await ctx.reply(message, keyboard);
    },

    async showPendingOrders(ctx) {
        const orders = orderManager.getPendingOrders();
        
        if (orders.length === 0) {
            await ctx.reply('✅ Нет ожидающих заказов');
            return;
        }

        let message = '⏳ Ожидающие заказы:\n\n';
        
        orders.forEach(order => {
            message += `🆔 #${order.id} | ${helpers.getStatusEmoji(order.status)} ${order.status}\n`;
            message += `👤 ID: ${order.userId}\n`;
            message += `🛍️ ${order.product.name}\n`;
            message += `💰 ${order.product.price.toLocaleString()} ${order.product.currency}\n`;
            message += `⏰ ${order.createdAt.toLocaleString('ru-RU')}\n`;
            
            // Add action buttons for each order
            const orderKeyboard = Markup.inlineKeyboard([
                [
                    Markup.button.callback('✅ Подтвердить', `order_confirm_${order.id}`),
                    Markup.button.callback('❌ Отменить', `order_cancel_${order.id}`)
                ]
            ]);
            
            message += '─────────────\n';
        });

        await ctx.reply(message);
        
        // Show management buttons for pending orders
        const mainKeyboard = Markup.inlineKeyboard([
            [Markup.button.callback('🔄 Обновить', 'admin_orders_pending')],
            [Markup.button.callback('⬅️ Назад', 'admin_panel')]
        ]);

        await ctx.reply('Управление заказами:', mainKeyboard);
    },

    async showPaidOrders(ctx) {
        const orders = orderManager.getAllOrders().filter(o => o.status === 'paid');
        
        if (orders.length === 0) {
            await ctx.reply('💰 Нет оплаченных заказов');
            return;
        }

        let message = '💰 Оплаченные заказы:\n\n';
        
        orders.forEach(order => {
            message += `🆔 #${order.id}\n`;
            message += `👤 ID: ${order.userId}\n`;
            message += `🛍️ ${order.product.name}\n`;
            message += `💰 ${order.product.price.toLocaleString()} ${order.product.currency}\n`;
            message += `⏰ ${order.paidAt?.toLocaleString('ru-RU') || 'N/A'}\n`;
            message += '─────────────\n';
        });

        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('🔄 Обновить', 'admin_orders_paid')],
            [Markup.button.callback('⬅️ Назад', 'admin_panel')]
        ]);

        await ctx.reply(message, keyboard);
    },

    async showDetailedStats(ctx) {
        const orders = orderManager.getAllOrders();
        const stats = orderManager.getOrderStats();
        
        // Calculate revenue
        const revenue = {
            total: 0,
            byType: { digital: 0, physical: 0, channel: 0 },
            byCurrency: { сум: 0, '$': 0 }
        };

        orders.filter(o => o.status === 'completed' || o.status === 'paid').forEach(order => {
            const price = order.product.price;
            const currency = order.product.currency;
            const type = order.product.type;
            
            revenue.byType[type] += price;
            revenue.byCurrency[currency] += price;
            
            if (currency === 'сум') {
                revenue.total += price;
            } else {
                revenue.total += price * 12000; // Approximate USD to UZS conversion
            }
        });

        const message = `
📊 Детальная статистика

📈 Заказы:
• Всего: ${stats.total}
• Ожидают: ${stats.pending}
• Оплачены: ${stats.paid}
• Выполнены: ${stats.completed}
• Отменены: ${stats.cancelled}

💰 Выручка:
• Общая: ~${revenue.total.toLocaleString()} сум
• Цифровые: ${revenue.byType.digital.toLocaleString()} сум
• Физические: ${revenue.byType.physical.toLocaleString()} сум
• Каналы: ${revenue.byType.channel}$

📊 По валютам:
• Сум: ${revenue.byCurrency['сум'].toLocaleString()}
• Доллары: ${revenue.byCurrency['$']}$
`;

        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('🔄 Обновить', 'admin_stats')],
            [Markup.button.callback('⬅️ Назад', 'admin_panel')]
        ]);

        await ctx.reply(message, keyboard);
    },

    async handleOrderCallback(ctx) {
        if (!ctx.session.isAdmin) {
            await ctx.reply('❌ Доступ запрещен');
            return;
        }

        const data = ctx.callbackQuery.data;
        const [, action, orderId] = data.split('_');
        const order = orderManager.getOrder(parseInt(orderId));

        if (!order) {
            await ctx.reply('❌ Заказ не найден');
            return;
        }

        switch (action) {
            case 'confirm':
                orderManager.markOrderAsCompleted(parseInt(orderId));
                await ctx.reply(`✅ Заказ #${orderId} подтвержден и выполнен`);
                
                // Notify customer
                try {
                    await ctx.telegram.sendMessage(
                        order.userId,
                        `✅ Ваш заказ #${orderId} подтвержден и выполнен!\n\nТовар: ${order.product.name}\n\nСпасибо за покупку в AVShop!`
                    );
                } catch (error) {
                    console.error('Failed to notify customer:', error);
                }
                break;

            case 'cancel':
                orderManager.updateOrderStatus(parseInt(orderId), 'cancelled');
                await ctx.reply(`❌ Заказ #${orderId} отменен`);
                
                // Notify customer
                try {
                    await ctx.telegram.sendMessage(
                        order.userId,
                        `❌ К сожалению, ваш заказ #${orderId} был отменен.\n\nТовар: ${order.product.name}\n\nДля уточнения деталей обратитесь в поддержку.`
                    );
                } catch (error) {
                    console.error('Failed to notify customer:', error);
                }
                break;
        }
    }
};

module.exports = adminHandlers;
