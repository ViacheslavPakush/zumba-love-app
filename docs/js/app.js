// Dance LOVE Rhythm: дата, календар і відеоплеєр

// Підключення до Telegram
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

// 1. Сьогоднішня дата
const today = new Date();

document.getElementById('todayLabel').textContent =
  today.toLocaleDateString('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

// 2. Тиждень від понеділка
function renderWeek() {
  const week = document.getElementById('week');
  const names = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
  const monday = new Date(today);

  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  week.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    const day = document.createElement('div');
    day.className = 'day';

    if (date.toDateString() === today.toDateString()) {
      day.classList.add('is-today');
    }

    day.innerHTML = `
      <span>${names[i]}</span>
      <span class="day__num">${date.getDate()}</span>
    `;

    week.appendChild(day);
  }
}

renderWeek();

// 3. YouTube-відео
// start та end — час у секундах від початку відео.
const youtube = {
  zumba:
    'https://www.youtube.com/embed/1FFwfdlAdco' +
    '?start=0&end=870&playsinline=1&rel=0'
};

// 4. Елементи плеєра
const player = document.getElementById('player');
const playerTitle = document.getElementById('playerTitle');
const playerVideo = document.getElementById('playerVideo');

// Створюємо YouTube-плеєр без змін у HTML і CSS
const playerYoutube = document.createElement('iframe');

playerYoutube.id = 'playerYoutube';
playerYoutube.title = 'Відео тренування на YouTube';
playerYoutube.allow =
  'autoplay; encrypted-media; picture-in-picture; fullscreen';
playerYoutube.allowFullscreen = true;
playerYoutube.referrerPolicy = 'strict-origin-when-cross-origin';

playerYoutube.style.cssText = `
  display: none;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
  border-radius: var(--radius-sm);
  background: #000;
`;

playerVideo.before(playerYoutube);

// 5. Зупинка обох плеєрів
function stopPlayback() {
  playerVideo.pause();
  playerVideo.removeAttribute('src');
  playerVideo.load();
  playerVideo.hidden = true;

  playerYoutube.removeAttribute('src');
  playerYoutube.style.display = 'none';
}

// 6. Відкриття тренування
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', () => {
    stopPlayback();

    playerTitle.textContent =
      card.querySelector('.card__title').textContent;

    const youtubeUrl = youtube[card.dataset.id];

    if (youtubeUrl) {
      playerYoutube.title = `Тренування: ${playerTitle.textContent}`;
      playerYoutube.src = youtubeUrl;
      playerYoutube.style.display = 'block';
    } else {
      playerVideo.hidden = false;
      playerVideo.src = card.dataset.video;
    }

    player.showModal();
    tg?.HapticFeedback?.impactOccurred('light');
  });
});

// 7. Закриття хрестиком
document.getElementById('playerClose').addEventListener('click', () => {
  player.close();
});

// Закриття натисканням поза межами вікна
player.addEventListener('click', (event) => {
  if (event.target !== player) return;

  const rect = player.getBoundingClientRect();
  const outside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (outside) player.close();
});

// Зупинка відео при будь-якому закритті, зокрема через Escape
player.addEventListener('close', stopPlayback);
