# Plan 01: Implementação de Background Blobs com Framer Motion

## Objetivo
Adicionar blobs animados sutis no background das páginas de autenticação (login, signup, verify-otp, check-email) usando Framer Motion, seguindo o padrão da imagem de referência.

## Paleta de Cores
Baseado na referência `image.png` e no tema atual do projeto:
- **Light mode**: Gradientes de cinza claro (#f5f5f5) para branco (#ffffff) com opacidade baixa
- **Dark mode**: Gradientes de cinza escuro (#171717) para preto (#000000) com opacidade moderada
- **Blur**: backdrop-blur-3xl para efeito suave e difuso

## Stack Técnica
- **Biblioteca**: Framer Motion (a ser instalada)
- **Comando**: `npm install framer-motion`
- **Versão esperada**: ^11.x (latest)

## Estrutura de Implementação

### 1. Criar componente `BackgroundBlobs`
**Arquivo**: `/src/components/background-blobs.tsx`

**Features**:
- 3 blobs posicionados estrategicamente (cantos superior direito, inferior esquerdo, centro-direita)
- Animação independente para cada blob (offset de timing para parecer orgânico)
- Suporte a dark/light mode usando `useTheme` do next-themes
- Animação loop infinito com spring physics
- Props para customização (opcional): `variant`, `intensity`, `blur`

**Animações**:
- **Scale**: 1 → 1.2 → 1 (10s duration)
- **Rotate**: 0deg → 10deg → 0deg (12s duration, offset)
- **Opacity**: 0.2 → 0.4 → 0.2 (8s duration)
- **Easing**: Spring physics (stiffness: 50, damping: 20)

### 2. Integrar nas páginas de autenticação
**Arquivos a modificar**:
- `/src/app/login/page.tsx`
- `/src/app/signup/page.tsx`
- `/src/app/verify-otp/page.tsx`
- `/src/app/check-email/page.tsx`

**Abordagem**: Adicionar `<BackgroundBlobs />` como primeiro filho dentro do container principal, com `position: fixed` e `z-index: -1`

### 3. Otimizações
- Lazy loading do Framer Motion (dynamic import)
- Desabilitar animação em `prefers-reduced-motion`
- Usar `will-change: transform` para GPU acceleration
- Desabilitar no mobile (opcional, para performance)

### 4. Ajustes de tema
Criar variáveis CSS customizadas em `/src/app/globals.css`:
```css
--blob-color-start: light/dark values
--blob-color-end: light/dark values
--blob-opacity: light/dark values
```

## Estrutura do Componente (Preview)
```
BackgroundBlobs
├── Blob 1 (top-right) - Scale animation (10s)
├── Blob 2 (bottom-left) - Rotate animation (12s, +2s delay)
└── Blob 3 (center-right) - Opacity animation (8s, +4s delay)
```

## Checklist de Implementação
- [ ] Instalar `framer-motion`
- [ ] Criar componente `/src/components/background-blobs.tsx`
- [ ] Adicionar variáveis CSS no `globals.css`
- [ ] Integrar no `/src/app/login/page.tsx`
- [ ] Integrar no `/src/app/signup/page.tsx`
- [ ] Integrar no `/src/app/verify-otp/page.tsx`
- [ ] Integrar no `/src/app/check-email/page.tsx`
- [ ] Testar light/dark mode
- [ ] Testar responsividade (mobile/tablet/desktop)
- [ ] Validar acessibilidade (prefers-reduced-motion)

## Tempo Estimado
30-45 minutos

## Riscos/Considerações
- Bundle size aumenta ~60KB (aceitável para qualidade profissional)
- Performance em dispositivos antigos (mitigado com GPU acceleration)
- Pode precisar ajuste fino de cores após primeira implementação

---

**Status**: 🟡 Aguardando aprovação
**Data de criação**: 2025-10-27
**Desenvolvedor**: Claude Code
