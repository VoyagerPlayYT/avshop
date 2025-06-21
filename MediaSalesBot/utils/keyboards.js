const { Markup } = require('telegraf');

const keyboards = {
    mainMenu: Markup.inlineKeyboard([
        [Markup.button.callback('🛍️ Каталог товаров', 'shop')],
        [Markup.button.callback('📞 Поддержка', 'support')]
    ]),

    shopMenu: Markup.inlineKeyboard([
        [Markup.button.callback('💻 Цифровые товары', 'category_digital')],
        [Markup.button.callback('📦 Физические товары', 'category_physical')],
        [Markup.button.callback('📺 Telegram-каналы', 'category_channels')],
        [Markup.button.callback('⬅️ Главное меню', 'main_menu')]
    ]),

    getPaymentKeyboard(productId, productType) {
        const buttons = [];
        
        // Telegram Stars only for digital products
        if (productType === 'digital') {
            buttons.push([Markup.button.callback('⭐ Telegram Stars', `payment_stars_${productId}`)]);
        }
        
        // Click payment
        buttons.push([Markup.button.callback('💳 Click / Uzcard', `payment_click_${productId}`)]);
        
        // Card payment
        buttons.push([Markup.button.callback('💰 Банковская карта', `payment_card_${productId}`)]);
        
        // Back button
        buttons.push([Markup.button.callback('⬅️ Назад', 'shop')]);
        
        return Markup.inlineKeyboard(buttons);
    },

    getProductKeyboard(productId) {
        return Markup.inlineKeyboard([
            [Markup.button.callback('🛒 Купить', `buy_${productId}`)],
            [Markup.button.callback('⬅️ К каталогу', 'shop')]
        ]);
    },

    cancelKeyboard: Markup.inlineKeyboard([
        [Markup.button.callback('❌ Отменить', 'cancel')]
    ])
};

module.exports = keyboards;
