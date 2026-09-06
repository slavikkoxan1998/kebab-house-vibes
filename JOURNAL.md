# JOURNAL — kebab-house-vibes

## 2026-09-06 09:35 CEST — Перший деплой, оптимізація, конфігуратор меню

Файл `Kebab House Vibes.zip` (Lovable-експорт, TanStack Start) прийшов від
Власника через Джоні, розпаковано в цей репо. Деталі — `MAP.md`.

- `npm install` (Node 20, EBADENGINE warnings на кількох `@tanstack/*`
  пакетах — не завадило білду), `NITRO_PRESET=node-server npm run build`
  (дефолтний preset — `cloudflare-module`, нам треба самостійний Node).
- Фото → WebP + downscale (Pillow): 475KB → ~230KB разом.
- `lang="en"` → `"cs"`, змонтовано `Toaster` (sonner) в root.
- Живий бейдж «Nyní otevřeno/zavřeno» (Europe/Prague, незалежно від TZ
  контейнера) — в Nav і в картці Otevírací doba.
- Конфігуратор döner/dürüm-позицій (розмір/pečivo/pálivost/6 добавок/
  нотатка/лічильник) — структура зі скріншотів чужого референс-додатку
  "Kebab Spot", які Власник надіслав тим же повідомленням; уточнено
  прямим питанням, що це не фото страв, а приклад UI меню-конфігуратора.
  Номер телефону лишається плейсхолдером — підтверджено Власником.
- Docker: `Dockerfile` (multi-stage, `node:22-alpine`, самодостатній
  `.output` без `node_modules` в рантаймі) + `docker-compose.yml`,
  контейнер `kebab_house_vibes`, порт 8792. Піднято, `curl` 200 на
  `127.0.0.1:8792/`.
- Пробував шлях `/kebab-vibes/` під вже робочим доменом (щоб уникнути
  DNS) — nitro (v3 pre-RC) не тягне `app.baseURL` за vite `base`,
  статика (`/assets/*`) 404-ить під префіксом. Відкотив спробу
  (`vite.config.ts` лишив опційний `VITE_BASE`, не використовується).
- Замість цього — новий піддомен `kebab-vibes.n8n-accaisona.site` в
  `/root/caddy/Caddyfile` → `172.17.0.1:8792`, `docker compose restart
  caddy` (rebind-mount, reload сам не підхопив би), `caddy validate`
  чисто. **DNS A-запис на цей піддомен Власник ще не додав** — домен
  зараз NXDOMAIN навіть на публічному 1.1.1.1, TLS не видасться поки
  запис не з'явиться. Виявлено заразом, що й старіший
  `kebab-assistant.n8n-accaisona.site` (з RUNBOOK-таблиці) в такому ж
  стані — DNS для нього теж ніколи не додавали.
- GitHub-репо `slavikkoxan1998/kebab-house-vibes` (приватне) заведено,
  перший коміт запушено.

## 2026-09-06 ~09:40 CEST — Живий лінк через GitHub Pages, поки DNS не додано

Власник запитав, чи піде через GitHub Pages, поки чекаємо DNS. Пішло.

- `vite.config.ts`: `STATIC_BUILD=1` перемикає на `nitro: false` +
  TanStack Start `spa: { enabled: true }` — пререндерить один shell
  (`dist/client/_shell.html`) замість серверного SSR-бандла. `base`
  = `/kebab-house-vibes/` під цим прапорцем (docker-збірка й далі без
  нього, `base: "/"`).
- Фавікон (`__root.tsx`) був захардкожений `/favicon.ico` — під base-
  префіксом 404-ив; замінено на `${import.meta.env.BASE_URL}favicon.ico`.
- `_shell.html` → перейменовано на `index.html`, запушено в окрему
  гілку `gh-pages` (через `git worktree`, orphan-гілка, той самий
  патерн, що класичний ручний gh-pages-деплой).
- Репо довелось зробити **публічним** — GitHub Pages на приватному
  репо вимагає платного плану (`422 Your current plan does not support
  GitHub Pages`). Перевірено: жодних секретів у репо нема.
- `gh api .../pages` з `source.branch=gh-pages` — увімкнено, білд
  зайняв <30с. Перевірено вживу (curl + реальний Chrome): HTTP 200,
  сторінка рендериться, індикатор «Nyní zavřeno · otevíráme 11:00»
  показує правильний стан.
- Живий лінк: **https://slavikkoxan1998.github.io/kebab-house-vibes/**
- Не вдалось перевірити flip-картки меню й конфігуратор через
  автоматизований браузер (CDP-хавер/клік не тригерить React
  `onMouseEnter`/`onClick` так само, як живий курсор — інструментне
  обмеження, не баг сайту). Код перевірено логічно (typecheck чистий,
  `stopPropagation` на кнопці/панелі конфігуратора) — для живого
  користувача (мишка або тач) флоу коректний.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014guF3wWsxfhdx1oLJPrhRj

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014guF3wWsxfhdx1oLJPrhRj
