import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

app.post('/api/order', async (req, res) => {
    const { name, phone, service, time, message } = req.body || {};

    if (!name || !phone || !message) {
        return res.status(400).json({
            error: 'Заполните имя, телефон и описание задачи.'
        });
    }

    if (!process.env.BOT_TOKEN || !process.env.ADMIN_CHAT_ID) {
        return res.status(500).json({
            error: 'Telegram не настроен на сервере.'
        });
    }

    const text = [
        '🔔 <b>НОВАЯ ЗАЯВКА С САЙТА</b>',
        '',
        `👤 <b>Имя:</b> ${escapeHtml(name)}`,
        `📞 <b>Телефон:</b> ${escapeHtml(phone)}`,
        '',
        `🔧 <b>Услуга:</b> ${escapeHtml(service || 'Не указана')}`,
        `🕐 <b>Время:</b> ${escapeHtml(time || 'Не указано')}`,
        '',
        '📝 <b>Задача:</b>',
        escapeHtml(message),
        '',
        '📍 <b>Барнаул</b> · выезд по всем районам'
    ].join('\n');

    try {
        const tg = await fetch(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: process.env.ADMIN_CHAT_ID,
                    text,
                    parse_mode: 'HTML'
                })
            }
        );

        const result = await tg.json();

        if (!result.ok) {
            console.error('Telegram error:', result);
            return res.status(502).json({
                error: 'Telegram не принял сообщение.'
            });
        }

        return res.json({ ok: true });

    } catch (error) {
        console.error('ОШИБКА TELEGRAM:', error);
        return res.status(500).json({
            error: 'Ошибка соединения с Telegram.'
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
});

