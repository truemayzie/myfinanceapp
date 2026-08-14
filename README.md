# Финансы — Telegram Mini App

Личные финансы в Telegram: учёт трат по категориям, бюджет от зарплаты,
накопительные цели, аналитика и смена тем. Работает как Mini App внутри
Telegram, данные хранятся локально в браузере (без сервера).

## Возможности (MVP)
- 5 вкладок: Главная, Статистика, Цели, Аналитика, Настройки
- Добавление доходов/расходов, лимиты по категориям
- Планирование бюджета с расчётом «свободного остатка»
- Накопительные цели (пополнение, основная цель)
- Графики: donut по категориям, столбцы доход/расход, тепловая карта трат
- 5 тем, онбординг, период с датой зарплаты
- **Импорт трат из Т-Банка**: вставь текст push-уведомления → трата добавляется
  автоматически (сумма парсится, категория подбирается по магазину)

## Запуск локально
```bash
npm install
npm run dev
```
Открой http://localhost:5173

## Запуск внутри Telegram (тест)
1. Создай бота через @BotFather, получи токен.
2. Запусти туннель к localhost: `ngrok http 5173` (или cloudflared).
3. В BotFather → /setmenubutton укажи URL туннеля (https).
4. Открой бота в Telegram и нажми кнопку меню — откроется Mini App.

## Структура
```
src/
  types.ts            модель данных
  data/seed.ts        дефолтные категории и темы
  store/useStore.ts   Zustand + persist (localStorage)
  utils/finance.ts    расчёты периодов, бюджета, прогресса
  utils/tbank.ts      парсер push-уведомлений Т-Банка
  telegram.ts         обёртка над Telegram WebApp SDK
  components/         BottomNav, Fab, Sheet, ProgressBar, charts/
  screens/            Home, Stats, Goals, Analytics, Settings, Onboarding
  modals/             AddOperation, BudgetPlan, GoalEdit, GoalContribute,
                      CategoryEdit, TbankImport
```

## Переход на сервер (когда появится хостинг)
Сейчас слой данных — `useStore` на localStorage. Чтобы сделать мультиустройство
и привязку к Telegram-id, замените persist на вызовы API:
- Хостинг: Vercel/Netlify (фронт) + функция webhook для бота.
- БД: Supabase (postgres + auth по `telegramId`).
- В `utils/tbank.ts` готов парсер — для автоподтягивания трат достаточно
  пересылать пуши боту (бот сохраняет операцию в БД по `telegramId`).
  Официального API личных счетов Т-Банка нет, поэтому это основной путь.

## Деплой с сервером (Vercel + Supabase + бот)

1. **Supabase**: создай проект, выполни `supabase/schema.sql` в SQL-редакторе.
   Возьми `URL` и `service_role` ключ (Project Settings → API).
2. **Бот**: создай бота в @BotFather, получи токен.
3. **Vercel**: импортируй репозиторий. В настройках добавь переменные
   (см. `.env.example`):
   - `VITE_API_BASE=/api` (включает синхронизацию на клиенте)
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_WEBAPP_URL`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
4. **Webhook бота**: после деплоя вызови
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<app>.vercel.app/api/bot&secret_token=<SECRET>
   ```
5. **Mini App**: в BotFather → /setmenubutton укажи `TELEGRAM_WEBAPP_URL`.

Теперь данные синхронизируются между устройствами через Supabase, а пересланный
боту пуш Т-Банка дописывается в твои траты (`api/bot.ts` + `src/utils/tbank.ts`).

Локально без сервера `npm run dev` работает как раньше (только localStorage).
Чтобы проверить серверные функции локально — `vercel dev` (Vercel CLI).

## ToDo (второй релиз)
- Экспорт данных, подписка/оплата, уведомления
- История операций со свайпом, фильтры в аналитике
- Реальный бэкенд + бот-обработчик пушей Т-Банка
