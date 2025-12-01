# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.1.0] - 2025-01-12

### Features

- **architecture:** Add Docker architecture for development and production ([91b9e64](https://github.com/WelL-O/Extrativo.ai/commit/91b9e64))
- **auth:** Add animated background blobs to auth pages ([90b76b4](https://github.com/WelL-O/Extrativo.ai/commit/90b76b4))
- **auth:** Improve authentication flow and resolve infinite loading ([fa1c55f](https://github.com/WelL-O/Extrativo.ai/commit/fa1c55f))
- **ui:** Improve theme toggle and language switcher UX ([4380353](https://github.com/WelL-O/Extrativo.ai/commit/4380353))
- **extractions:** Implement tabs-based form layout and analytics dashboard ([8dfd501](https://github.com/WelL-O/Extrativo.ai/commit/8dfd501))

### Bug Fixes

- **auth:** Resolve email redirect to localhost in production ([20be320](https://github.com/WelL-O/Extrativo.ai/commit/20be320))
- **hooks:** Prevent double loading of data and skeletons ([ad4bbe1](https://github.com/WelL-O/Extrativo.ai/commit/ad4bbe1))
- **auth:** Complete profiles migration and add fallback ([15dfb20](https://github.com/WelL-O/Extrativo.ai/commit/15dfb20))

### Performance

- **bundle:** Optimize bundle size and improve performance ([cd9460a](https://github.com/WelL-O/Extrativo.ai/commit/cd9460a))
  - Add bundle analyzer with @next/bundle-analyzer
  - Enable SWC minification and tree shaking
  - Implement advanced code splitting (chunks >160kb)
  - Add image optimization (AVIF/WebP support)
  - Remove console.log in production (except error/warn)
  - Optimize i18n imports (21 → 7 imports, -66%)
  - Add dynamic imports for BackgroundBlobs (Framer Motion)
  - Optimize package imports for lucide-react, recharts, framer-motion
  - Results: 1801 → 1624 modules (-10%), load time ~3.8s → ~1s

### Refactor

- **database:** Rename users table to profiles ([65620ce](https://github.com/WelL-O/Extrativo.ai/commit/65620ce))
- **docker:** Reorganize docker files into dedicated directory ([942a86f](https://github.com/WelL-O/Extrativo.ai/commit/942a86f))

### Documentation

- **core:** Add extrativo-core and comprehensive project documentation ([b87ba71](https://github.com/WelL-O/Extrativo.ai/commit/b87ba71))

### Chore

- Add .claude/ to .gitignore ([cbe4cf4](https://github.com/WelL-O/Extrativo.ai/commit/cbe4cf4))
- Add vscode settings for claudeCode terminal usage ([6778d70](https://github.com/WelL-O/Extrativo.ai/commit/6778d70))

### Performance Metrics

- **Core Web Vitals:**
  - LCP: 710ms (Excellent - Target: <2.5s)
  - INP: 20ms (Excellent - Target: <200ms)
  - CLS: 0.00 (Perfect - Target: <0.1)

- **Bundle Optimization:**
  - Initial modules: 1801 → 1624 (-10%)
  - Subsequent compilations: 892 → 792 modules (-11.2%)
  - Console logs: Clean (0 debug messages)
  - Load time: ~3.8s → ~1s (-73%)

### Technical Stack

- **Framework:** Next.js 14.2.33 (App Router)
- **UI:** React 18, Tailwind CSS, shadcn/ui, Framer Motion
- **Database:** Supabase (PostgreSQL)
- **i18n:** i18next, react-i18next
- **Charts:** Recharts
- **Maps:** React-Leaflet
- **Forms:** React Hook Form + Zod
- **Testing:** Playwright

---

## Release Notes Template

Para futuras releases, usar o seguinte formato:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Features
- **componente:** Descrição da feature ([#issue](link)) ([hash](link))

### Bug Fixes
- **componente:** Correção do bug ([#issue](link)) ([hash](link))

### Performance
- **componente:** Melhoria de performance ([#issue](link)) ([hash](link))

### Refactor
- **componente:** Refatoração ([#issue](link)) ([hash](link))

### Documentation
- Descrição da atualização

### Chore
- Descrição da tarefa de manutenção
```

[0.1.0]: https://github.com/WelL-O/Extrativo.ai/releases/tag/v0.1.0
