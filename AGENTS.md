Project: NaamVriddhi admin panel (Next.js App Router, TypeScript, Tailwind, shadcn/ui).

Rules:
- Admin panel only. Do not build the mobile app, website, or Laravel backend.
- Laravel API already exists, but use DUMMY DATA for now.
- Browser never calls Laravel directly. Flow: UI -> /app/api/admin/* route handlers -> repository -> (mock now, Laravel later).
- Data source is set by env DATA_SOURCE=mock|laravel. Mock data lives in src/mocks/*.json.
- Theme: maroon #7A1F1F primary, saffron accent, cream background. Hindi font: Noto Sans Devanagari.
- Keep code short. Reuse components. No explanations, no README, no extra files unless I ask.
- Only edit files related to the current task.