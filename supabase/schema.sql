-- Таблица состояния пользователя (монолитный JSON-документ по telegram_id).
-- Для MVP это проще и надёжнее переносить между устройствами, чем
-- нормализованные таблицы, и позволяет боту и Mini App писать в одно место.

create table if not exists finance_state (
  telegram_id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Доступ только через service_role (серверные функции).
-- Анонимный ключ из клиента НЕ используется напрямую к БД.
alter table finance_state enable row level security;

-- Никто не читает/пишет напрямую анонимом — всё идёт через /api/*.
drop policy if exists "no anon" on finance_state;
create policy "no anon" on finance_state
  for all to anon
  using (false) with check (false);

create index if not exists finance_state_updated_idx on finance_state (updated_at);
