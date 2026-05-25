# SeedCare / Домашняя ферма

SeedCare помогает вести домашние растения от посева до урожая: задачи ухода, календарь, дневник, погода, AI-помощник и админка каталога.

## Environments

Проект рассчитан на три окружения:

- `local` - разработка на машине разработчика.
- `staging` - тестовый стенд перед релизом.
- `production` - боевое окружение.

Git flow:

- feature ветка -> staging
- релиз -> staging -> master

## Env Variables

Обязательные:

```env
NODE_ENV="development"
APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/seedcare"
JWT_SECRET="change-me-in-production"
```

Опциональные:

```env
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
WEATHER_API_KEY=""
ADMIN_EMAIL=""
ADMIN_PASSWORD=""
ADMIN_NAME="Администратор"
```

Секции в `.env.example`:

- runtime: `NODE_ENV`, `APP_URL`, `NEXT_PUBLIC_APP_URL`
- database: `DATABASE_URL`
- auth: `JWT_SECRET`
- AI: `OPENAI_API_KEY`, `OPENAI_MODEL`
- weather: `WEATHER_API_KEY`
- admin seed: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`

Для production:

- `NODE_ENV=production`
- `APP_URL=https://your-domain.example`
- `NEXT_PUBLIC_APP_URL=https://your-domain.example`
- `JWT_SECRET` должен быть длинным случайным секретом, не `change-me-in-production`

## Local Development

```bash
npm install
docker compose up -d
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Откройте `http://localhost:3000`.

## Staging

На staging используйте отдельную базу и отдельные env:

```bash
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run build
npm run start
```

Seed на staging запускайте только осознанно:

```bash
npm run prisma:seed
```

Если нужно создать администратора на staging, временно задайте:

```env
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="strong-password"
ADMIN_NAME="Администратор"
```

Затем выполните `npm run prisma:seed`.

## Production

Production workflow:

```bash
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run build
npm run start
```

Миграции в production выполняйте только через:

```bash
npm run prisma:deploy
```

Не используйте `prisma migrate dev` в production.

Seed в production запускайте только для управляемых операций, например для создания первого admin-пользователя. После создания admin лучше очистить `ADMIN_PASSWORD` из окружения.

## Docker

Production-like запуск:

```bash
docker compose -f docker-compose.prod.yml up --build
```

В реальном production не храните секреты в `docker-compose.prod.yml`. Передавайте их через secret manager, CI/CD или переменные окружения платформы.

Перед запуском контейнера приложения примените миграции:

```bash
docker compose -f docker-compose.prod.yml run --rm app npm run prisma:deploy
```

## Healthcheck

Endpoint:

```txt
GET /api/health
```

Успешный ответ:

```json
{
  "status": "ok",
  "database": "ok"
}
```

Если база недоступна, endpoint возвращает `503`.

## Security Notes

- Session cookie: `httpOnly=true`, `sameSite=lax`.
- В production cookie получает `secure=true`.
- Пароли хранятся только как `passwordHash`.
- Admin API защищены ролью `ADMIN`.
- Пользовательские растения, задачи и дневник фильтруются по текущему пользователю.
- Rate limit сейчас in-memory. Для нескольких production-инстансов нужен Redis.

## Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --audit-level=moderate
```

`npm audit` может предлагать major upgrade Next.js. Не применяйте `npm audit fix --force` без отдельной проверки миграции.
