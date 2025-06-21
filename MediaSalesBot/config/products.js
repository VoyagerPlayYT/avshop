const products = {
    // Digital products
    1: {
        id: 1,
        name: 'Бизнес-план онлайн-магазина',
        price: 30000,
        currency: 'сум',
        type: 'digital',
        description: 'Готовый бизнес-план для запуска интернет-магазина',
        deliveryMethod: 'pdf',
        stars_price: 100 // Telegram Stars price
    },
    2: {
        id: 2,
        name: 'Гайд: Как начать онлайн-бизнес с нуля',
        price: 25000,
        currency: 'сум',
        type: 'digital',
        description: 'Пошаговое руководство по созданию онлайн-бизнеса',
        deliveryMethod: 'pdf',
        stars_price: 85
    },
    3: {
        id: 3,
        name: 'Сборник звуков и музыки для монтажа (30 файлов)',
        price: 15000,
        currency: 'сум',
        type: 'digital',
        description: 'Коллекция звуковых эффектов и музыки для видеомонтажа',
        deliveryMethod: 'zip',
        stars_price: 50
    },
    
    // Physical products
    4: {
        id: 4,
        name: 'Проводные наушники с микрофоном',
        price: 80000,
        currency: 'сум',
        type: 'physical',
        description: 'Качественные проводные наушники с встроенным микрофоном'
    },
    5: {
        id: 5,
        name: 'Силиконовый чехол',
        price: 80000,
        currency: 'сум',
        type: 'physical',
        description: 'Защитный силиконовый чехол для смартфона'
    },
    6: {
        id: 6,
        name: 'Кабель зарядки (Type-C / iPhone / micro)',
        price: 70000,
        currency: 'сум',
        type: 'physical',
        description: 'Универсальный кабель для зарядки различных устройств'
    },
    7: {
        id: 7,
        name: 'Мини USB-лампа',
        price: 60000,
        currency: 'сум',
        type: 'physical',
        description: 'Компактная USB-лампа для освещения'
    },
    8: {
        id: 8,
        name: 'Складная подставка для телефона',
        price: 60000,
        currency: 'сум',
        type: 'physical',
        description: 'Удобная складная подставка для мобильных устройств'
    },
    9: {
        id: 9,
        name: 'Мини-духи (10 мл)',
        price: 70000,
        currency: 'сум',
        type: 'physical',
        description: 'Компактные духи в удобной упаковке'
    },
    
    // Telegram channels
    10: {
        id: 10,
        name: 'Telegram-канал "MemeDrip" (мемы/юмор)',
        price: 25,
        currency: '$',
        type: 'channel',
        description: 'Готовый канал с мемами и юморным контентом',
        payment_card: '4023 0601 2795 6166',
        contact: '@Ashraf_ASH2013'
    },
    11: {
        id: 11,
        name: 'Крипто-канал "CryptoFlex"',
        price: 30,
        currency: '$',
        type: 'channel',
        description: 'Канал о криптовалютах и трейдинге',
        payment_card: '4023 0601 2795 6166',
        contact: '@Ashraf_ASH2013'
    },
    12: {
        id: 12,
        name: 'Бизнес-канал "UpStart"',
        price: 25,
        currency: '$',
        type: 'channel',
        description: 'Канал о бизнесе и предпринимательстве',
        payment_card: '4023 0601 2795 6166',
        contact: '@Ashraf_ASH2013'
    }
};

const paymentCards = {
    uzcard_virtual: '8802 3032 5919 0695',
    uzcard_physical: '8600 5304 2287 2476',
    visa_new: '4023 0601 2795 6166'
};

module.exports = {
    products,
    paymentCards
};
