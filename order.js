const BOT_TOKEN="8737188925:AAF9SfdNZwTCgxxQpG-b-WYYqVHLLxSwLOk"
const ADMIN_CHAT_ID=-5458345998
const PORT=3000
const form = document.getElementById('requestForm');

if (form) {
    let sending = false;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (sending) return;
        sending = true;

        const button = form.querySelector('button[type="submit"]');
        const originalText = button ? button.textContent : '';

        if (button) {
            button.disabled = true;
            button.textContent = 'Отправляем…';
        }

        const data = Object.fromEntries(new FormData(form).entries());

        try {
            const response = await fetch('/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Ошибка отправки заявки');
            }

            form.reset();

            const note = form.querySelector('.note');
            if (note) {
                note.classList.remove('disp');
            }

            alert('✅ Заявка отправлена! Я свяжусь с вами в ближайшее время.');

        } catch (error) {
            console.error('Ошибка отправки заявки:', error);

            alert(
                'Не удалось отправить заявку. ' +
                'Пожалуйста, позвоните по номеру 8 905 926-92-93.'
            );

        } finally {
            sending = false;

            if (button) {
                button.disabled = false;
                button.textContent = originalText || 'Отправить заявку →';
            }
        }
    });
}
