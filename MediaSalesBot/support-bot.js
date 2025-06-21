const { Telegraf, Markup } = require('telegraf');

// Support bot token
const SUPPORT_BOT_TOKEN = '8068165251:AAGWg5PrG0SFATKZdsAjdLBT-2wg67mgGyQ';

// Admin contacts
const ADMIN_CONTACTS = ['@Ashraf_ASH2013', '@m_asadbek_b'];
const ADMIN_IDS = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : []; // Set admin Telegram IDs
const ADMIN_PASSWORD = 'V0yageRpl@y2013@';

// Create support bot instance
const supportBot = new Telegraf(SUPPORT_BOT_TOKEN);

// Initialize session store for support bot
const supportSessions = new Map();

// Middleware for session management
supportBot.use((ctx, next) => {
    const sessionKey = ctx.from?.id || 'anonymous';
    if (!supportSessions.has(sessionKey)) {
        supportSessions.set(sessionKey, {});
    }
    ctx.session = supportSessions.get(sessionKey);
    return next();
});

// Support categories
const supportCategories = {
    order: '📦 Вопросы по заказам',
    payment: '💳 Проблемы с оплатой',
    delivery: '🚚 Доставка и получение',
    technical: '🔧 Технические проблемы',
    other: '❓ Другие вопросы'
};

// FAQ data
const faqData = {
    order: {
        title: '📦 Вопросы по заказам',
        items: [
            'Q: Как проверить статус заказа?\nA: Обратитесь к администратору @Ashraf_ASH2013 с номером заказа.',
            'Q: Можно ли отменить заказ?\nA: Да, до момента обработки заказ можно отменить.',
            'Q: Как изменить заказ?\nA: Свяжитесь с поддержкой до обработки заказа.'
        ]
    },
    payment: {
        title: '💳 Проблемы с оплатой',
        items: [
            'Q: Какие способы оплаты доступны?\nA: Telegram Stars, Click/Uzcard, банковские карты.',
            'Q: Оплата не прошла, что делать?\nA: Проверьте данные карты или попробуйте другой способ.',
            'Q: Деньги списались, но заказ не оформился?\nA: Обратитесь к администратору с чеком об оплате.'
        ]
    },
    delivery: {
        title: '🚚 Доставка и получение',
        items: [
            'Q: Сколько времени занимает доставка?\nA: Цифровые товары - мгновенно, физические - 1-3 дня.',
            'Q: Как получить цифровой товар?\nA: Файл отправляется автоматически в чат после оплаты.',
            'Q: Не получил файл после оплаты?\nA: Обратитесь к администратору с номером заказа.'
        ]
    },
    technical: {
        title: '🔧 Технические проблемы',
        items: [
            'Q: Бот не отвечает на команды?\nA: Попробуйте перезапустить чат или написать /start.',
            'Q: Не работают кнопки?\nA: Обновите Telegram или попробуйте позже.',
            'Q: Проблемы с файлом?\nA: Убедитесь, что у вас достаточно места для загрузки.'
        ]
    },
    other: {
        title: '❓ Другие вопросы',
        items: [
            'Q: Как связаться с администратором?\nA: Напишите @Ashraf_ASH2013 напрямую.',
            'Q: Есть ли гарантия на товары?\nA: Да, мы гарантируем качество всех товаров.',
            'Q: Можно ли вернуть товар?\nA: Возврат возможен в течение 3 дней после покупки.'
        ]
    }
};

// Admin command
supportBot.command('admin', async (ctx) => {
    ctx.session.awaitingAdminPassword = true;
    await ctx.reply('🔐 Введите пароль администратора:');
});

// Start command
supportBot.start(async (ctx) => {
    const welcomeMessage = `
🎧 Добро пожаловать в службу поддержки AVShop!

Я помогу вам решить любые вопросы, связанные с покупками в нашем магазине.

👨‍💼 Администраторы: ${ADMIN_CONTACTS.join(', ')}

Выберите категорию вашего вопроса:
    `;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📦 Заказы', 'faq_order')],
        [Markup.button.callback('💳 Оплата', 'faq_payment')],
        [Markup.button.callback('🚚 Доставка', 'faq_delivery')],
        [Markup.button.callback('🔧 Технические', 'faq_technical')],
        [Markup.button.callback('❓ Другое', 'faq_other')],
        [Markup.button.callback('👨‍💼 Связаться с админом', 'contact_admin')]
    ]);

    await ctx.reply(welcomeMessage, keyboard);
});

// FAQ handlers
supportBot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;

    try {
        if (data.startsWith('faq_')) {
            const category = data.replace('faq_', '');
            const faq = faqData[category];
            
            if (faq) {
                let message = `${faq.title}\n\n`;
                faq.items.forEach((item, index) => {
                    message += `${index + 1}. ${item}\n\n`;
                });
                
                message += `Если ваш вопрос не решен, обратитесь к администраторам ${ADMIN_CONTACTS.join(' или ')}`;

                const backKeyboard = Markup.inlineKeyboard([
                    [Markup.button.callback('⬅️ Назад к категориям', 'back_to_main')],
                    [Markup.button.callback('👨‍💼 Связаться с админом', 'contact_admin')]
                ]);

                await ctx.reply(message, backKeyboard);
            }
        } else if (data === 'contact_admin') {
            await handleContactAdmin(ctx);
        } else if (data === 'back_to_main') {
            // Send start message again
            const welcomeMessage = `
🎧 Добро пожаловать в службу поддержки AVShop!

Я помогу вам решить любые вопросы, связанные с покупками в нашем магазине.

👨‍💼 Администраторы: ${ADMIN_CONTACTS.join(', ')}

Выберите категорию вашего вопроса:
            `;

            const keyboard = Markup.inlineKeyboard([
                [Markup.button.callback('📦 Заказы', 'faq_order')],
                [Markup.button.callback('💳 Оплата', 'faq_payment')],
                [Markup.button.callback('🚚 Доставка', 'faq_delivery')],
                [Markup.button.callback('🔧 Технические', 'faq_technical')],
                [Markup.button.callback('❓ Другое', 'faq_other')],
                [Markup.button.callback('👨‍💼 Связаться с админом', 'contact_admin')]
            ]);

            await ctx.reply(welcomeMessage, keyboard);
        } else if (data === 'send_to_admin') {
            ctx.session.awaitingMessage = true;
            await ctx.reply('📝 Напишите ваше сообщение администратору. Я передам его и уведомлю о ответе.');
        } else if (data === 'cancel_message') {
            ctx.session.awaitingMessage = false;
            await ctx.reply('❌ Отменено. Возвращаемся к главному меню.');
            const welcomeMessage = `
🎧 Добро пожаловать в службу поддержки AVShop!

Я помогу вам решить любые вопросы, связанные с покупками в нашем магазине.

👨‍💼 Администраторы: ${ADMIN_CONTACTS.join(', ')}

Выберите категорию вашего вопроса:
            `;

            const keyboard = Markup.inlineKeyboard([
                [Markup.button.callback('📦 Заказы', 'faq_order')],
                [Markup.button.callback('💳 Оплата', 'faq_payment')],
                [Markup.button.callback('🚚 Доставка', 'faq_delivery')],
                [Markup.button.callback('🔧 Технические', 'faq_technical')],
                [Markup.button.callback('❓ Другое', 'faq_other')],
                [Markup.button.callback('👨‍💼 Связаться с админом', 'contact_admin')]
            ]);

            await ctx.reply(welcomeMessage, keyboard);
        } else if (data === 'admin_help') {
            const helpMessage = `
📋 Команды администратора поддержки:

/reply [user_id] [сообщение] - Ответить пользователю
• Пример: /reply 123456789 Ваш заказ обработан

/help - Общая помощь
/admin - Админ панель

💡 Советы:
• ID пользователя указывается в уведомлениях
• Ответы автоматически форматируются
• Пользователи получают уведомление об ответе
            `;
            
            await ctx.reply(helpMessage);
        }

        await ctx.answerCbQuery();
    } catch (error) {
        console.error('Support bot callback error:', error);
        try {
            await ctx.answerCbQuery('Произошла ошибка');
        } catch (answerError) {
            console.log('Callback query expired');
        }
    }
});

// Handle contact admin
async function handleContactAdmin(ctx) {
    const contactMessage = `
👨‍💼 Связь с администратором

📞 Прямые контакты: ${ADMIN_CONTACTS.join(', ')}

💬 Или отправьте сообщение через бота:
Я передам ваше сообщение администратору и уведомлю вас о получении ответа.

⏰ Время ответа: обычно в течение 1-2 часов
    `;

    const contactKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📨 Отправить сообщение', 'send_to_admin')],
        [Markup.button.url('💬 Написать @Ashraf_ASH2013', 'https://t.me/Ashraf_ASH2013')],
        [Markup.button.url('💬 Написать @m_asadbek_b', 'https://t.me/m_asadbek_b')],
        [Markup.button.callback('⬅️ Назад', 'back_to_main')]
    ]);

    await ctx.reply(contactMessage, contactKeyboard);
}

// Handle text messages
supportBot.on('text', async (ctx) => {
    // Admin password check
    if (ctx.session.awaitingAdminPassword) {
        const password = ctx.message.text;
        ctx.session.awaitingAdminPassword = false;

        if (password === ADMIN_PASSWORD) {
            ctx.session.isAdmin = true;
            await showSupportAdminPanel(ctx);
        } else {
            await ctx.reply('❌ Неверный пароль');
        }
        return;
    }
    
    if (ctx.session.awaitingMessage) {
        const userMessage = ctx.message.text;
        const user = ctx.from;
        
        // Format message for admin
        const adminMessage = `
🔔 Новое сообщение от пользователя

👤 От: ${user.first_name} ${user.last_name || ''} (@${user.username || 'без username'})
🆔 ID: ${user.id}
⏰ Время: ${new Date().toLocaleString('ru-RU')}

💬 Сообщение:
${userMessage}

Для ответа используйте: /reply ${user.id} [ваш ответ]
        `;

        // Send to admins if IDs are set
        if (ADMIN_IDS.length > 0) {
            let sentCount = 0;
            for (const adminId of ADMIN_IDS) {
                try {
                    await ctx.telegram.sendMessage(adminId, adminMessage);
                    sentCount++;
                } catch (error) {
                    console.error(`Failed to send message to admin ${adminId}:`, error);
                }
            }
            
            if (sentCount > 0) {
                await ctx.reply('✅ Ваше сообщение отправлено администраторам. Ожидайте ответ в течение 1-2 часов.');
            } else {
                await ctx.reply(`❌ Не удалось отправить сообщение. Напишите напрямую: ${ADMIN_CONTACTS.join(' или ')}`);
            }
        } else {
            await ctx.reply(`📝 Ваше сообщение записано. Обратитесь к администраторам: ${ADMIN_CONTACTS.join(' или ')}\n\nВаше сообщение:\n"${userMessage}"`);
        }

        ctx.session.awaitingMessage = false;
        
        // Show return to menu button
        const returnKeyboard = Markup.inlineKeyboard([
            [Markup.button.callback('🏠 Главное меню', 'back_to_main')]
        ]);
        
        setTimeout(async () => {
            await ctx.reply('Вернуться в главное меню:', returnKeyboard);
        }, 2000);
    } else {
        // Default response for unrecognized messages
        await ctx.reply('🤖 Я бот поддержки AVShop. Используйте /start для навигации по меню или выберите категорию вопроса.');
    }
});

// Admin reply command
supportBot.command('reply', async (ctx) => {
    if (ADMIN_IDS.length === 0 || !ADMIN_IDS.includes(ctx.from.id.toString())) {
        await ctx.reply('❌ Эта команда доступна только администраторам.');
        return;
    }

    const args = ctx.message.text.split(' ');
    if (args.length < 3) {
        await ctx.reply('❌ Использование: /reply [user_id] [сообщение]');
        return;
    }

    const userId = args[1];
    const replyMessage = args.slice(2).join(' ');

    try {
        const adminReply = `
📬 Ответ от администратора AVShop

💬 ${replyMessage}

👨‍💼 С уважением, команда поддержки AVShop
Если у вас есть еще вопросы, используйте /start
        `;

        await ctx.telegram.sendMessage(userId, adminReply);
        await ctx.reply('✅ Ответ отправлен пользователю.');
    } catch (error) {
        console.error('Failed to send reply:', error);
        await ctx.reply('❌ Не удалось отправить ответ пользователю.');
    }
});

// Help command
supportBot.command('help', async (ctx) => {
    const helpMessage = `
🎧 Бот поддержки AVShop

📋 Доступные команды:
• /start - Главное меню поддержки
• /help - Это сообщение

💡 Возможности бота:
• FAQ по категориям
• Прямая связь с администраторами
• Быстрые ответы на частые вопросы

👨‍💼 Администраторы: ${ADMIN_CONTACTS.join(', ')}
    `;

    await ctx.reply(helpMessage);
});

// Error handling
supportBot.catch((err, ctx) => {
    console.error('Support bot error:', err);
    ctx.reply('Произошла ошибка. Обратитесь к администраторам: ' + ADMIN_CONTACTS.join(' или '));
});

// Start the support bot
console.log('Starting AVShop Support Bot...');

async function startSupportBot() {
    try {
        // Clear any existing webhooks
        await supportBot.telegram.deleteWebhook();
        console.log('Support bot webhook cleared');
        
        // Test bot connection
        const me = await supportBot.telegram.getMe();
        console.log(`Support bot info: ${me.first_name} (@${me.username})`);
        
        // Start polling with timeout
        await Promise.race([
            supportBot.launch(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Support bot startup timeout')), 10000)
            )
        ]);
        
        console.log('Support bot is running!');
        console.log('Ready to handle support requests...');
        
    } catch (error) {
        console.error('Failed to start support bot:', error);
        console.log('Attempting alternative startup for support bot...');
        
        try {
            supportBot.startPolling();
            console.log('Support bot started with alternative method');
        } catch (altError) {
            console.error('Support bot alternative startup failed:', altError);
            process.exit(1);
        }
    }
}

startSupportBot();

// Graceful shutdown
process.once('SIGINT', () => supportBot.stop('SIGINT'));
process.once('SIGTERM', () => supportBot.stop('SIGTERM'));

// Support admin panel
async function showSupportAdminPanel(ctx) {
    if (!ctx.session.isAdmin) {
        await ctx.reply('❌ Доступ запрещен');
        return;
    }

    const adminMessage = `
👨‍💼 Панель администратора поддержки AVShop

📊 Возможности:
• Просмотр обращений пользователей
• Ответы через команду /reply
• Управление FAQ

Статистика будет добавлена в следующих обновлениях.

Используйте команды:
• /reply [user_id] [сообщение] - ответить пользователю
• /help - помощь по командам
    `;

    const adminKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📋 Помощь по командам', 'admin_help')],
        [Markup.button.callback('🏠 Главное меню', 'back_to_main')]
    ]);

    await ctx.reply(adminMessage, adminKeyboard);
}

module.exports = supportBot;