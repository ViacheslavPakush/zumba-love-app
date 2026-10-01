// Бібліотека тренувань Dance LOVE Rhythm
//
// start і end — секунди від початку відео.
// end: null — відтворюємо до кінця.
// Назви й розподіл складені за наданим списком.
// Доступність кожного відео у вбудованому плеєрі
// перевіряємо під час запуску.

const WORKOUTS = {
  // ------------------------------------------------
  // Зумба
  // ------------------------------------------------
  zumba: [
    {
      id: 'zumba-tana',
      title: 'Зумба 1',
      youtubeId: 'wGx-fAkVxj4',
      start: 0,
      end: 2088 // 34:48
    },
    {
      id: 'zumba-home',
      title: 'Зумба 2',
      youtubeId: 'GIXsqY62F5E',
      start: 0,
      end: 1110 // 18:30 — обраний тобою запис
    },
    {
      id: 'zumba-mote',
      title: 'Зумба 3',
      youtubeId: '1-ZWQjb_tJc',
      start: 0,
      end: 1328 // 22:08
    },
    {
      id: 'zumba-no-jumping',
      title: 'Зумба · Без стрибків',
      youtubeId: 'oOr82MWtQAg',
      start: 20, // 00:20
      end: 859 // 14:19
    },
    {
      id: 'zumba-fitness',
      title: 'Зумба 4',
      youtubeId: 'RcXteQGL9AA',
      start: 0,
      end: 910 // 15:10
    },
    {
      id: 'zumba-core',
      title: 'Зумба · Прес',
      youtubeId: 'v9oI4zLIP_w',
      start: 0,
      end: 1300 // 21:40
    }
  ],

  // ------------------------------------------------
  // Бачата
  // ------------------------------------------------
  bachata: [
    {
      id: 'bachata-basic',
      title: 'Бачата · Основні кроки',
      youtubeId: 'HbDEhZZt1jI',
      start: 0,
      end: 1136 // 18:56
    },
    {
      id: 'bachata-hips-1',
      title: 'Бачата · Стегна 1',
      youtubeId: 'VDIv3ZVlT5I',
      start: 0,
      end: 1038 // 17:18
    },
    {
      id: 'bachata-basic-moves',
      title: 'Бачата · Базові рухи',
      youtubeId: 'p5xnieQs5hE',
      start: 0,
      end: 607 // 10:07
    },
    {
      id: 'bachata-hips-2',
      title: 'Бачата · Стегна 2',
      youtubeId: 'KiseltGxpjQ',
      start: 0,
      end: 952 // 15:52
    },
    {
      id: 'bachata-two-moves',
      title: 'Бачата · Два рухи',
      youtubeId: 'X7npCAuPTmQ',
      start: 0,
      end: 818 // 13:38
    },
    {
      id: 'bachata-step',
      title: 'Бачата · Базовий крок',
      youtubeId: 'd-epVobmjRo',
      start: 0,
      end: 928 // 15:28
    },
    {
      id: 'bachata-25-moves',
      title: 'Бачата · 25 рухів',
      youtubeId: 'jdczPDv8RzQ',
      start: 0,
      end: null // Повне відео
    },
    {
      id: 'bachata-learn-steps',
      title: 'Бачата · Кроки',
      youtubeId: 'u_mSaHIoXos',
      start: 0,
      end: null // Повне відео
    }
  ],

  // ------------------------------------------------
  // Реггетон
  // ------------------------------------------------
  reggaeton: [
    {
      id: 'reggaeton-latin',
      title: 'Латина / Реггетон',
      youtubeId: 'Liy2v9SpgaA',
      start: 0,
      end: 670 // 11:10
    }
  ],

  // ------------------------------------------------
  // Латина
  // ------------------------------------------------
  latina: [
    {
      id: 'latina-hips',
      title: 'Латина 1',
      youtubeId: 'z5aO8Q1YJCU',
      start: 0,
      end: 604 // 10:04
    },
    {
      id: 'latina-short',
      title: 'Латина 2',
      youtubeId: 'm2CXrkjXst0',
      start: 0,
      end: 566 // 09:26
    },
    {
      id: 'latina-hiit-1',
      title: 'Латина · HIIT 1',
      youtubeId: '00xbPeU7F9g',
      start: 0,
      end: 1278 // 21:18
    },
    {
      id: 'latina-mix',
      title: 'Латина · Мікс',
      youtubeId: '3bUpj4FzN3E',
      start: 0,
      end: 1318 // 21:58
    },
    {
      id: 'latina-grooves',
      title: 'Латина 3',
      youtubeId: '09XTSwLZz24',
      start: 28, // 00:28
      end: 1025 // 17:05
    },
    {
      id: 'latina-hiit-2',
      title: 'Латина · HIIT 2',
      youtubeId: 'cn7O-9oAC4g',
      start: 0,
      end: null // Повне відео
    }
  ],

  // ------------------------------------------------
  // Мобільність
  // Ходьба та перенесене тобою танцювальне відео
  // ------------------------------------------------
  mobility: [
    {
      id: 'dance-popsport',
      title: 'Танцювальне тренування',
      youtubeId: '1FFwfdlAdco',
      start: 0,
      end: 865 // 14:25
    },
    {
      id: 'walking-no-jumping',
      title: 'Ходьба 1',
      youtubeId: 'qaCHvMNLUjI',
      start: 0,
      end: 608 // 10:08
    },
    {
      id: 'walking-fast',
      title: 'Швидка ходьба',
      youtubeId: 'vJS9a1mpYGw',
      start: 40, // 00:40
      end: 2793 // 46:33
    },
    {
      id: 'walking-running',
      title: 'Ходьба та біг',
      youtubeId: 'hVYdL-66KD8',
      start: 40, // 00:40
      end: 1334 // 22:14
    }
  ],

  // ------------------------------------------------
  // Розтяжка
  // Поки тут відео на рухливість тіла
  // ------------------------------------------------
  stretch: [
    {
      id: 'full-body-mobility',
      title: 'Рухливість тіла',
      youtubeId: '0tS1XnNQdhk',
      start: 0,
      end: 1170 // 19:30
    }
  ]
};
