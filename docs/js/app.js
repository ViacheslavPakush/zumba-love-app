// Dance LOVE Rhythm: логіка (частина 1)

// Підключаємося до Telegram
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand(); // відкрити на весь екран

// 1. Сьогоднішня дата вгорі
const today = new Date();
document.getElementById('todayLabel').textContent =
  today.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' });

// 2. Тиждень: будується автоматично від понеділка
function renderWeek() {
  const week = document.getElementById('week');
  const names = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  week.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    const el = document.createElement('div');
    el.className = 'day';
    if (d.toDateString() === today.toDateString()) el.classList.add('is-today');
    el.innerHTML = `<span>${names[i]}</span><span class="day__num">${d.getDate()}</span>`;
    week.appendChild(el);
  }
}
renderWeek();

// 3. Відеоплеєр: відкривається при натисканні на картку
const player = document.getElementById('player');
const playerTitle = document.getElementById('playerTitle');
const playerVideo = document.getElementById('playerVideo');

document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', () => {
    playerTitle.textContent = card.querySelector('.card__title').textContent;
    playerVideo.src = card.dataset.video;   // беремо адресу відео з data-video
    player.showModal();                      // відкриваємо вікно
    tg?.HapticFeedback?.impactOccurred('light'); // легка вібрація
  });
});

// Закриття: хрестик ✕ або натискання на темний фон
document.getElementById('playerClose').addEventListener('click', () => player.close());
player.addEventListener('click', (e) => {
  if (e.target === player) player.close();
});

// Коли вікно закрилось, зупиняємо відео
player.addEventListener('close', () => {
  playerVideo.pause();
  playerVideo.removeAttribute('src');
  playerVideo.load();
});
