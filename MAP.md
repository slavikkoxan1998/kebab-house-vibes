# MAP — Kebab House Vibes

Ментальна карта. Читай першим.

## Що це

Другий, редизайнений сайт того ж закладу **Kebab House Kunštát** (той самий,
що [[project_kebab_house_wordpress]]). Прийшов від Власника як
`Kebab House Vibes.zip` (експорт з Lovable) через Джоні (Telegram-міст),
2026-09-06. Технічно повністю інший стек — TanStack Start (React 19 + Nitro
SSR) замість плоского `index.html`. Неонова/dark тема, флип-картки меню.

**AI-чат-асистент є ТІЛЬКИ на першому сайті** (kebab-house, GitHub Pages).
Тут його немає і додавати не треба (явна вказівка Власника 2026-09-06).

## Стек і деплой

- `npm install && NITRO_PRESET=node-server npm run build` → `.output/`
  (самодостатній бандл, `node_modules` в рантаймі не потрібен).
- **Node 20 достатньо для білду**, хоча кілька `@tanstack/*` пакетів
  просять `>=22.12.0` в `engines` (лише EBADENGINE warning, не помилка).
- Docker: `Dockerfile` (multi-stage, `node:22-alpine`) + `docker-compose.yml`,
  контейнер `kebab_house_vibes`, порт **8792**.
- Caddy: `kebab-vibes.n8n-accaisona.site` → `172.17.0.1:8792`
  (додано в `/root/caddy/Caddyfile` 2026-09-06).
  **⚠️ DNS A-запис на цей піддомен ще НЕ доданий** — Власник має додати
  його в реєстратора (та сама ціль-IP, що й інші `*.n8n-accaisona.site`),
  інакше домен лишається NXDOMAIN і TLS не видасться.
- Шлях `/kebab-vibes/` під існуючим доменом **не спрацював** — nitro
  (v3, ще pre-RC) не тягне свій `app.baseURL` за vite `base`, статика
  (`/assets/*`) 404-ить, коли сервер змонтований під префіксом. Не
  копати далі без потреби — простіше довести до пуття DNS на піддомен.

## Що змінено проти оригінального Lovable-експорту

- Фото (`src/assets/*.jpg` → `.webp`, стиснуто + downscale до 800px/1600px
  для hero) — конвертовано Pillow, ~475KB → ~230KB разом.
- `lang="en"` → `"cs"` в `__root.tsx` (сайт увесь чеською, це був
  недогляд Lovable-шаблону).
- Живий бейдж «Nyní otevřeno/zavřeno» (зелена крапка, блимає коли
  відчинено) — рахується в `Europe/Prague` незалежно від таймзони
  сервера. У `Nav` і в картці «Otevírací doba» в `Contact`.
- Конфігуратор кебабу (розмір Standard/XL/XXL, тип пečiva, гострота,
  6 добавок з цінами, нотатка кухарю, лічильник) — на всіх döner/dürüm
  позиціях (`customizable: true` в `MENU`). Структура взята зі скріншотів
  референс-додатку "Kebab Spot", які Власник надіслав 2026-09-06 —
  **це чужий UI-приклад, не фото страв цього закладу**. "Додати до
  замовлення" лише показує toast (sonner) — нікуди не пишеться, як і
  оригінальний AI-асистент на першому сайті (демо, не продакшн).
- Номер телефону (`PHONE_NUMBER` в `index.tsx`) лишається плейсхолдером
  `+420 000 000 000` — **навмисно**, Власник підтвердив 2026-09-06.

## Файли

| Файл | Що |
|---|---|
| `src/routes/index.tsx` | Весь контент одної сторінки (Nav/Hero/About/Menu/Gallery/Contact/Footer) |
| `src/routes/__root.tsx` | HTML shell, `<head>` мета, Toaster |
| `vite.config.ts` | `@lovable.dev/vite-tanstack-config`, `base` через `VITE_BASE` (не використовується зараз, лишено про запас) |
| `Dockerfile` / `docker-compose.yml` | Деплой, порт 8792 |
