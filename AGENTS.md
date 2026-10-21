# Frontend page conventions

Follow this structure for every new page and when reorganizing an existing page:

```text
src/page/<page-name>/
  index.tsx
  actions.ts
  style.scss
  components/
  config.ts
```

- `index.tsx` is the page entry and composes its layout/components.
- Keep a page's outer layout and feed composition directly in `index.tsx`; do not split them into wrapper components such as `MainLayout` or `HomeFeed` when only that page uses them.
- `actions.ts` contains page actions, state hooks, event handlers and orchestration.
- Put page-specific components in `components/` and static data/settings/asset maps in the single file `config.ts`. Do not create a `config/` directory or a `type/` directory inside a page.
- Put HTTP clients and API request functions in `src/axios/`, using the shared Axios instance. Keep all TypeScript definitions in `src/component/type/`, organized by page/domain (for example `home.ts` and `auth.ts`).
- Keep reusable UI components in `src/component/`; do not put page-specific components there.
- Put page styles in `style.scss`, scoped to the page. Prefer SCSS classes over inline styles; reserve inline values for runtime data that cannot reasonably be expressed through classes.
- Update imports and routes when moving files. Preserve existing behavior and visuals unless a change is requested.
- Do not create duplicate page entry points or leave compatibility shims for paths used only inside this repository; update their consumers.
- Do not install packages or change backend/configuration as part of a page reorganization unless required by the requested task.
