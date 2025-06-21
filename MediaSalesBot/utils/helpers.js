const helpers = {
    getProductTypeText(type) {
        const types = {
            'digital': '💻 Цифровой товар',
            'physical': '📦 Физический товар',
            'channel': '📺 Telegram-канал'
        };
        return types[type] || 'Неизвестный тип';
    },

    getStatusEmoji(status) {
        const statuses = {
            'pending': '⏳',
            'paid': '💰',
            'completed': '✅',
            'cancelled': '❌',
            'processing': '🔄'
        };
        return statuses[status] || '❓';
    },

    formatPrice(price, currency) {
        if (currency === 'сум') {
            return `${price.toLocaleString()} ${currency}`;
        }
        return `${price}${currency}`;
    },

    formatDate(date) {
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    generateOrderNumber() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8);
        return `AVS${timestamp.slice(-6)}${random.toUpperCase()}`;
    },

    validateProductId(id) {
        const productId = parseInt(id);
        return !isNaN(productId) && productId >= 1 && productId <= 12;
    },

    escapeMarkdown(text) {
        return text.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
    },

    createPaginationKeyboard(currentPage, totalPages, callbackPrefix) {
        const buttons = [];
        
        if (currentPage > 1) {
            buttons.push(Markup.button.callback('⬅️', `${callbackPrefix}_${currentPage - 1}`));
        }
        
        buttons.push(Markup.button.callback(`${currentPage}/${totalPages}`, 'noop'));
        
        if (currentPage < totalPages) {
            buttons.push(Markup.button.callback('➡️', `${callbackPrefix}_${currentPage + 1}`));
        }
        
        return [buttons];
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    isValidPaymentMethod(method, productType) {
        const validMethods = ['click', 'card'];
        
        if (productType === 'digital') {
            validMethods.push('stars');
        }
        
        return validMethods.includes(method);
    },

    generatePaymentReference(orderId, method) {
        const timestamp = Date.now().toString(36);
        return `${method.toUpperCase()}_${orderId}_${timestamp}`;
    },

    calculateDeliveryTime(productType) {
        switch (productType) {
            case 'digital':
                return 'мгновенно';
            case 'physical':
                return '1-3 рабочих дня';
            case 'channel':
                return 'после подтверждения оплаты';
            default:
                return 'уточняется';
        }
    }
};

module.exports = helpers;
