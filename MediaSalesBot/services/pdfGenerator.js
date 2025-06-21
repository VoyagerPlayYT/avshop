const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const content = require('../data/content');

class PDFGenerator {
    constructor() {
        this.outputDir = path.join(__dirname, '..', 'generated_files');
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async generateBusinessPlan(orderId) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const filename = `business_plan_${orderId}_${Date.now()}.pdf`;
                const filepath = path.join(this.outputDir, filename);
                
                doc.pipe(fs.createWriteStream(filepath));
                
                // Add content
                doc.fontSize(20).text('Бизнес-план онлайн-магазина', 50, 50);
                doc.moveDown();
                
                doc.fontSize(14);
                content.businessPlan.sections.forEach((section, index) => {
                    doc.fontSize(16).text(section.title, { underline: true });
                    doc.moveDown(0.5);
                    doc.fontSize(12).text(section.content);
                    doc.moveDown(1);
                    
                    if (index < content.businessPlan.sections.length - 1) {
                        doc.addPage();
                    }
                });
                
                doc.end();
                
                doc.on('end', () => {
                    resolve(filepath);
                });
                
                doc.on('error', (err) => {
                    reject(err);
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    async generateOnlineBusinessGuide(orderId) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const filename = `online_business_guide_${orderId}_${Date.now()}.pdf`;
                const filepath = path.join(this.outputDir, filename);
                
                doc.pipe(fs.createWriteStream(filepath));
                
                // Add content
                doc.fontSize(20).text('Гайд: Как начать онлайн-бизнес с нуля', 50, 50);
                doc.moveDown();
                
                doc.fontSize(14);
                content.onlineBusinessGuide.sections.forEach((section, index) => {
                    doc.fontSize(16).text(section.title, { underline: true });
                    doc.moveDown(0.5);
                    doc.fontSize(12).text(section.content);
                    doc.moveDown(1);
                    
                    if (index < content.onlineBusinessGuide.sections.length - 1) {
                        doc.addPage();
                    }
                });
                
                doc.end();
                
                doc.on('end', () => {
                    resolve(filepath);
                });
                
                doc.on('error', (err) => {
                    reject(err);
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    async generateSoundPack(orderId) {
        // For demonstration, we'll create a text file with download instructions
        // In a real scenario, you would package actual audio files
        return new Promise((resolve, reject) => {
            try {
                const filename = `sound_pack_${orderId}_${Date.now()}.txt`;
                const filepath = path.join(this.outputDir, filename);
                
                const instructions = `
Сборник звуков и музыки для монтажа
====================================

Ваш заказ: #${orderId}
Дата: ${new Date().toLocaleDateString('ru-RU')}

Инструкции по загрузке:
1. Перейдите по ссылке: https://example.com/soundpack/${orderId}
2. Введите код доступа: AVSHOP${orderId}
3. Загрузите архив с 30 аудиофайлами

Состав пакета:
- 10 фоновых музыкальных треков
- 15 звуковых эффектов
- 5 джинглов для интро/аутро

Техническая поддержка: @Ashraf_ASH2013
`;

                fs.writeFileSync(filepath, instructions, 'utf8');
                resolve(filepath);
                
            } catch (error) {
                reject(error);
            }
        });
    }

    cleanupFile(filepath) {
        try {
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        } catch (error) {
            console.error('Error cleaning up file:', error);
        }
    }
}

module.exports = new PDFGenerator();
