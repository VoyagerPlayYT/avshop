// Скрипт для запуска обоих ботов одновременно
const { spawn } = require('child_process');

console.log('🚀 Запуск AVShop Bot System...');

// Запуск основного бота
const mainBot = spawn('node', ['index.js'], {
    stdio: 'pipe'
});

// Запуск бота поддержки
const supportBot = spawn('node', ['support-bot.js'], {
    stdio: 'pipe'
});

// Логирование основного бота
mainBot.stdout.on('data', (data) => {
    console.log(`[MAIN BOT] ${data.toString().trim()}`);
});

mainBot.stderr.on('data', (data) => {
    console.error(`[MAIN BOT ERROR] ${data.toString().trim()}`);
});

// Логирование бота поддержки
supportBot.stdout.on('data', (data) => {
    console.log(`[SUPPORT BOT] ${data.toString().trim()}`);
});

supportBot.stderr.on('data', (data) => {
    console.error(`[SUPPORT BOT ERROR] ${data.toString().trim()}`);
});

// Обработка завершения
mainBot.on('close', (code) => {
    console.log(`Main bot exited with code ${code}`);
    process.exit(code);
});

supportBot.on('close', (code) => {
    console.log(`Support bot exited with code ${code}`);
    process.exit(code);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down bots...');
    mainBot.kill();
    supportBot.kill();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down bots...');
    mainBot.kill();
    supportBot.kill();
    process.exit(0);
});