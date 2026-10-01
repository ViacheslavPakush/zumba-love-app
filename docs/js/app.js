// Dance LOVE Rhythm
// Плеєр, таймер заняття, локальна історія тренувань

const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

// --------------------------------------------------
// 1. Налаштування
// --------------------------------------------------

const LIMIT_MS = 60 * 60 * 1000;
const MIN_WORKOUT_MS = 10 * 60 * 1000;
const STORAGE_KEY = 'danceLoveRhythm.training.v1';

// Пізніше вкажемо шлях до запису твоїм голосом.
// Наприклад: 'audio/workout-finished.mp3'
const FINISH_VOICE_URL = '';

const youtube = {
  zumba:
    'https://www.youtube.com/embed/1FFwfdlAdco' +
    '?start=0&end=865&playsinline=1&rel=0'
};

// --------------------------------------------------
// 2. Допоміжні функції
// --------------------------------------------------

function dayKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function dateFromKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);

  return (
    String(minutes).padStart(2, '0') +
    ':' +
    String(seconds % 60).padStart(2, '0')
  );
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);

  return (
    `${Math.floor(seconds / 60)} хв ` +
    `${String(seconds % 60).padStart(2, '0')} с`
  );
}

function newSession() {
  return {
    id: globalThis.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    day: dayKey(),
    elapsedMs: 0,
    startedAt: null,
    finished: false
  };
}

function emptyState() {
  return {
    session: null,
    history: [],
    message: ''
  };
}

// --------------------------------------------------
// 3. Локальне збереження
// --------------------------------------------------

let storageAvailable = true;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();

    const saved = JSON.parse(raw);

    if (!saved || !Array.isArray(saved.history)) {
      return emptyState();
    }

    const history = saved.history.filter((record) =>
      record &&
      typeof record.id === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(record.day) &&
      Number.isFinite(record.durationMs) &&
      record.durationMs >= MIN_WORKOUT_MS &&
      record.durationMs <= LIMIT_MS
    );

    const s = saved.session;

    const validSession =
      s &&
      typeof s.id === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(s.day) &&
      Number.isFinite(s.elapsedMs) &&
      s.elapsedMs >= 0 &&
      s.elapsedMs <= LIMIT_MS &&
      typeof s.finished === 'boolean' &&
      (
        s.startedAt === null ||
        (
          Number.isFinite(s.startedAt) &&
          s.startedAt > 0 &&
          s.startedAt <= Date.now()
        )
      ) &&
      (!s.finished || s.startedAt === null);

    return {
      session: validSession ? s : null,
      history,
      message: typeof saved.message === 'string'
        ? saved.message
        : ''
    };
  } catch (error) {
    storageAvailable = false;
    return emptyState();
  }
}

let state = loadState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageAvailable = true;
  } catch (error) {
    storageAvailable = false;
  }
}

function elapsedMs(now = Date.now()) {
  const s = state.session;
  if (!s) return 0;

  const runningMs = s.startedAt === null
    ? 0
    : Math.max(0, now - s.startedAt);

  return Math.min(LIMIT_MS, s.elapsedMs + runningMs);
}

// --------------------------------------------------
// 4. Елементи сторінки
// --------------------------------------------------

const player = document.getElementById('player');
const playerTitle = document.getElementById('playerTitle');
const playerVideo = document.getElementById('playerVideo');
const doneBtn = document.getElementById('doneBtn');

const elapsedLabels =
  document.querySelectorAll('[data-session-elapsed]');

const remainingLabels =
  document.querySelectorAll('[data-session-remaining]');

const sessionButtons =
  document.querySelectorAll('[data-session-toggle]');

const sessionStatuses =
  document.querySelectorAll('[data-session-status]');

// --------------------------------------------------
// 5. YouTube-плеєр
// --------------------------------------------------

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

function stopPlayback() {
  playerVideo.pause();
  playerVideo.removeAttribute('src');
  playerVideo.load();
  playerVideo.hidden = true;

  playerYoutube.removeAttribute('src');
  playerYoutube.style.display = 'none';
}

function closePlayer() {
  stopPlayback();
  if (player.open) player.close();
}

document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', () => {
    if (card.disabled) return;

    checkLimit();

    const s = state.session;

    if (s?.finished && s.elapsedMs >= LIMIT_MS) {
      state.message =
        'Заняття завершено. Для наступного натисни «Нове тренування».';
      saveState();
      renderTimer();

      document.getElementById('sessionTitle')?.scrollIntoView({
        block: 'center'
      });

      return;
    }

    stopPlayback();

    playerTitle.textContent =
      card.querySelector('.card__title').textContent;

    const youtubeUrl = youtube[card.dataset.id];

    if (youtubeUrl) {
      playerYoutube.title =
        `Тренування: ${playerTitle.textContent}`;

      playerYoutube.src = youtubeUrl;
      playerYoutube.style.display = 'block';
    } else if (card.dataset.video) {
      playerVideo.hidden = false;
      playerVideo.src = card.dataset.video;
    } else {
      return;
    }

    player.showModal();
    player.scrollTop = 0;
    tg?.HapticFeedback?.impactOccurred('light');
  });
});

document.getElementById('playerClose')
  .addEventListener('click', closePlayer);

function closeOnBackdrop(dialog) {
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;

    const rect = dialog.getBoundingClientRect();

    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (outside) dialog.close();
  });
}

closeOnBackdrop(player);
player.addEventListener('close', stopPlayback);

// --------------------------------------------------
// 6. Сигнал завершення
// --------------------------------------------------

let audioContext = null;
let voiceDelay = null;
let pendingAlarm = false;

const recordedVoice = FINISH_VOICE_URL
  ? new Audio(FINISH_VOICE_URL)
  : null;

if (recordedVoice) {
  recordedVoice.preload = 'auto';
}

function prepareAudio() {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!audioContext && AudioContextClass) {
      audioContext = new AudioContextClass();
    }

    if (audioContext?.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
  } catch (error) {
    // Візуальне повідомлення працює і без звуку.
  }
}

function stopFinishAudio() {
  pendingAlarm = false;
  clearTimeout(voiceDelay);

  if (recordedVoice) {
    recordedVoice.pause();
    recordedVoice.currentTime = 0;
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function speakFinish() {
  if (recordedVoice) {
    recordedVoice.currentTime = 0;
    recordedVoice.play().catch(() => {});
    return;
  }

  if (!('speechSynthesis' in window)) return;

  const speech = new SpeechSynthesisUtterance(
    'Ваше тренування завершене'
  );

  speech.lang = 'uk-UA';
  speech.rate = 0.95;
  speech.volume = 1;

  const ukrainianVoice = window.speechSynthesis
    .getVoices()
    .find((voice) => voice.lang.toLowerCase().startsWith('uk'));

  if (ukrainianVoice) speech.voice = ukrainianVoice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

function playFinishAlarm() {
  if (document.hidden) {
    pendingAlarm = true;
    return;
  }

  pendingAlarm = false;
  prepareAudio();

  if (audioContext?.state === 'running') {
    const start = audioContext.currentTime;

    // Три короткі сигнали.
    for (let i = 0; i < 3; i++) {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const time = start + i * 0.4;

      oscillator.type = 'square';
      oscillator.frequency.value = 880;

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.18, time + 0.02);
      gain.gain.setValueAtTime(0.18, time + 0.18);
      gain.gain.linearRampToValueAtTime(0, time + 0.23);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(time);
      oscillator.stop(time + 0.25);

      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    }
  }

  voiceDelay = setTimeout(speakFinish, 1300);
}

// --------------------------------------------------
// 7. Вікно статистики
// --------------------------------------------------

const historyButton = document.createElement('button');
historyButton.type = 'button';
historyButton.className = 'btn-primary';
historyButton.textContent = 'Статистика →';

document.querySelector('.stats').after(historyButton);

const historyDialog = document.createElement('dialog');
historyDialog.className = 'player library';
historyDialog.setAttribute('aria-labelledby', 'historyTitle');

historyDialog.innerHTML = `
  <div class="player__inner">
    <header class="player__head">
      <h3 id="historyTitle">Статистика</h3>
      <button
        type="button"
        class="icon-btn"
        aria-label="Закрити статистику"
      >✕</button>
    </header>

    <p data-history-summary></p>
    <div class="library__list" data-history-list></div>

    <p class="workouts-note">
      Зараховуються заняття від 10 хвилин.
      День визначається за датою початку заняття.
      Історія зберігається в цьому браузері.
    </p>
  </div>
`;

document.body.appendChild(historyDialog);

historyDialog.querySelector('button')
  .addEventListener('click', () => historyDialog.close());

closeOnBackdrop(historyDialog);

historyButton.addEventListener('click', () => {
  checkLimit();
  renderHistory();
  historyDialog.showModal();
  historyDialog.scrollTop = 0;
});

function renderHistory() {
  const list =
    historyDialog.querySelector('[data-history-list]');

  const summary =
    historyDialog.querySelector('[data-history-summary]');

  list.replaceChildren();

  const totalMs = state.history.reduce(
    (sum, record) => sum + record.durationMs,
    0
  );

  summary.textContent =
    `Занять: ${state.history.length} · ` +
    `Час: ${formatDuration(totalMs)}`;

  if (!state.history.length) {
    const empty = document.createElement('p');
    empty.className = 'workouts-note';
    empty.textContent = 'Зарахованих тренувань поки немає.';
    list.appendChild(empty);
    return;
  }

  const days = new Map();

  state.history.forEach((record) => {
    if (!days.has(record.day)) days.set(record.day, []);
    days.get(record.day).push(record);
  });

  [...days.keys()].sort().reverse().forEach((key) => {
    const records = days.get(key);

    const dayTotal = records.reduce(
      (sum, record) => sum + record.durationMs,
      0
    );

    const block = document.createElement('article');
    block.className = 'stat';

    const title = document.createElement('strong');
    title.textContent = dateFromKey(key).toLocaleDateString(
      'uk-UA',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    );

    const total = document.createElement('p');
    total.textContent =
      `${formatDuration(dayTotal)} · Занять: ${records.length}`;

    block.append(title, total);

    records.forEach((record, index) => {
      const row = document.createElement('p');
      row.className = 'workouts-note';
      row.style.margin = '0';
      row.textContent =
        `${index + 1}. ${formatDuration(record.durationMs)}`;

      block.appendChild(row);
    });

    list.appendChild(block);
  });
}

// --------------------------------------------------
// 8. Дата, календар, стрік і підсумки
// --------------------------------------------------

let renderedDay = '';

function calculateStreak(completedDays) {
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);

  // Якщо сьогодні ще немає заняття,
  // учорашній стрік залишається чинним.
  if (!completedDays.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;

  while (completedDays.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function renderDashboard() {
  const now = new Date();
  renderedDay = dayKey(now);

  document.getElementById('todayLabel').textContent =
    now.toLocaleDateString('uk-UA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

  const completedDays = new Set(
    state.history.map((record) => record.day)
  );

  const totalMs = state.history.reduce(
    (sum, record) => sum + record.durationMs,
    0
  );

  document.getElementById('minValue').textContent =
    Math.floor(totalMs / 60000);

  document.getElementById('totalValue').textContent =
    state.history.length;

  // Оцінку калорій підключимо окремо.
  document.getElementById('kcalValue').textContent = '—';

  const streak = calculateStreak(completedDays);

  document.getElementById('streakValue').textContent = streak;
  document.getElementById('goalText').textContent =
    `${Math.min(streak, 5)} / 5`;

  document.getElementById('goalFill').style.setProperty(
    '--progress',
    `${Math.min(streak / 5, 1) * 100}%`
  );

  const week = document.getElementById('week');
  const names = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

  const monday = new Date(now);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(
    monday.getDate() - ((monday.getDay() + 6) % 7)
  );

  week.replaceChildren();

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    const key = dayKey(date);
    const day = document.createElement('div');
    day.className = 'day';

    if (key === renderedDay) day.classList.add('is-today');
    if (completedDays.has(key)) day.classList.add('is-done');

    day.innerHTML = `
      <span>${names[i]}</span>
      <span class="day__num">${date.getDate()}</span>
    `;

    week.appendChild(day);
  }

  renderHistory();
}

// --------------------------------------------------
// 9. Завершення заняття
// --------------------------------------------------

function finishSession(atLimit = false) {
  const s = state.session;
  if (!s || s.finished) return;

  const duration = atLimit ? LIMIT_MS : elapsedMs();

  s.elapsedMs = duration;
  s.startedAt = null;
  s.finished = true;

  if (duration >= MIN_WORKOUT_MS) {
    // Захист від повторного додавання того самого заняття.
    if (!state.history.some((record) => record.id === s.id)) {
      state.history.push({
        id: s.id,
        day: s.day,
        durationMs: duration,
        finishedAt: Date.now()
      });
    }

    state.message = atLimit
      ? 'Ваше тренування завершене. 60 хв збережено ❤️'
      : `Збережено: ${formatDuration(duration)} ❤️`;
  } else {
    state.message =
      `Заняття завершене: ${formatTime(duration)}. ` +
      'Менше 10 хв — до статистики не додано.';
  }

  // Історію і стан заняття зберігаємо разом.
  saveState();

  closePlayer();
  renderDashboard();
  renderTimer();

  if (atLimit) playFinishAlarm();

  if (!document.hidden && !historyDialog.open) {
    document.getElementById('sessionTitle')?.scrollIntoView({
      block: 'center'
    });
  }
}

function checkLimit() {
  const s = state.session;

  if (s && !s.finished && elapsedMs() >= LIMIT_MS) {
    finishSession(true);
  }
}

// --------------------------------------------------
// 10. Відображення таймера
// --------------------------------------------------

function renderTimer() {
  const s = state.session;

  // Після завершення лічильники готові до нового заняття.
  const elapsed = !s || s.finished ? 0 : elapsedMs();

  const seconds = Math.floor(elapsed / 1000);
  const remaining = LIMIT_MS - seconds * 1000;

  elapsedLabels.forEach((label) => {
    label.textContent = formatTime(elapsed);
  });

  remainingLabels.forEach((label) => {
    label.textContent = formatTime(remaining);
  });

  const running = Boolean(
    s && !s.finished && s.startedAt !== null
  );

  sessionButtons.forEach((button) => {
    button.disabled = false;

    button.textContent = !s
      ? 'Почати'
      : s.finished
        ? 'Нове тренування'
        : running
          ? 'Пауза'
          : 'Продовжити';
  });

  doneBtn.disabled = !s || s.finished;

  let message;

  if (!s || s.finished) {
    message = state.message ||
      'Натисни «Почати», коли будеш готова.';
  } else if (running) {
    message = 'Час іде. Для перерви натисни «Пауза».';
  } else {
    message = 'Пауза. Час не рахується.';
  }

  if (!storageAvailable) {
    message +=
      ' Збереження недоступне: дані можуть втратитися після закриття.';
  }

  sessionStatuses.forEach((label) => {
    if (label.textContent !== message) {
      label.textContent = message;
    }
  });
}

// --------------------------------------------------
// 11. Початок, пауза, продовження
// --------------------------------------------------

sessionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    prepareAudio();

    const current = state.session;

    // Якщо ліміт щойно настав — спочатку завершуємо заняття.
    if (
      current &&
      !current.finished &&
      elapsedMs() >= LIMIT_MS
    ) {
      finishSession(true);
      return;
    }

    stopFinishAudio();

    if (!state.session || state.session.finished) {
      state.session = newSession();
      state.session.startedAt = Date.now();
      state.message = '';
    } else if (state.session.startedAt !== null) {
      state.session.elapsedMs = elapsedMs();
      state.session.startedAt = null;
    } else {
      state.session.startedAt = Date.now();
    }

    saveState();
    renderTimer();
  });
});

doneBtn.addEventListener('click', () => {
  const s = state.session;
  if (!s || s.finished) return;

  const duration = elapsedMs();

  if (duration >= LIMIT_MS) {
    finishSession(true);
    return;
  }

  if (duration < MIN_WORKOUT_MS) {
    const confirmed = window.confirm(
      'Минуло менше 10 хвилин. ' +
      'Завершити без додавання до статистики?'
    );

    if (!confirmed) return;
  }

  finishSession(false);
});

// --------------------------------------------------
// 12. Оновлення без накопичення похибки
// --------------------------------------------------

function refreshApp() {
  checkLimit();

  if (renderedDay !== dayKey()) {
    renderDashboard();
  }

  renderTimer();
}

renderDashboard();
refreshApp();

// Час обчислюється за часовими мітками.
// Інтервал лише оновлює екран.
setInterval(refreshApp, 500);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;

  refreshApp();

  if (pendingAlarm) playFinishAlarm();
});

window.addEventListener('pageshow', refreshApp);
