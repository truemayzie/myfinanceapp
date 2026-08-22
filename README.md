# Финансы — Telegram Mini App

Личные финансы в Telegram: учёт трат по категориям, бюджет от зарплаты,
накопительные цели и аналитика. Работает как Mini App внутри Telegram:
внутри Telegram состояние синхронизируется через Supabase, вне — хранится
локально в браузере.

## Возможности (MVP)
- 4 вкладки: Главная, Статистика (со встроенной аналитикой), Цели, Настройки
- Добавление доходов/расходов, лимиты по категориям
- Планирование бюджета с расчётом «свободного остатка» (план пишется в категории)
- Накопительные цели (пополнение, основная цель на главной, отчисления вычитаются из «свободных» денег)
- История операций с удалением (по дням, помечаются пуши Т-Банка)
- Редактор категорий: изменение/удаление/добавление
- Реальный сброс месяца: траты перестают влиять на бюджет, но остаются в истории
- Графики: donut по категориям, столбцы доход/расход, тепловая карта трат
- Онбординг (имя, валюта, дата зарплаты, доход), период с датой зарплаты
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
  index.css           дизайн-токены Tailwind v4 (@theme) и базовые стили
  data/seed.ts        палитра, дефолтные категории, наборы иконок и эмодзи
  store/useStore.ts   Zustand + persist (localStorage)
  utils/finance.ts    расчёты периодов, бюджета, прогресса, сброса месяца
  utils/tbank.ts      парсер push-уведомлений Т-Банка
  lib/api.ts          клиент /api/state
  lib/sync.ts         гидрация и push состояния в Supabase (через /api)
  telegram.ts         обёртка над Telegram WebApp SDK
  components/         BottomNav, Fab, Sheet, OperationRow, icons, charts/,
                      ui/ (Button, Card, Field, Segmented, ProgressRing, AppHeader, EmptyState)
  screens/            Home, Stats, Goals, Settings, Onboarding
  modals/             QuickAdd, AddOperation, BudgetPlan, GoalEdit, GoalContribute,
                      CategoryEdit, CategoryManager, History, TbankImport, SupportSheet
api/
  state.js            GET/POST состояния (верификация initData)
  bot.js              webhook бота + приём пушей Т-Банка
  _lib/               верификация Telegram, клиент Supabase (service_role)
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
боту пуш Т-Банка дописывается в твои траты (`api/bot.js` + `src/utils/tbank.ts`).

Локально без сервера `npm run dev` работает как раньше (только localStorage).
Чтобы проверить серверные функции локально — `vercel dev` (Vercel CLI).

## ToDo (второй релиз)
- Экспорт данных, подписка/оплата, уведомления
- Фильтры в аналитике, регулярные операции, счета/источники
