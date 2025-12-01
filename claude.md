# Claude Code - Extrativo.ai

## Regras de Desenvolvimento e Deploy

### Release Management (Obrigatório)

**IMPORTANTE**: Sempre que for feito um deploy para produção, DEVE ser criado um release seguindo as práticas do repositório oficial do n8n.

#### Versionamento Semântico

Utilizar **Semantic Versioning** (MAJOR.MINOR.PATCH):

- **MAJOR**: Mudanças incompatíveis com versões anteriores (breaking changes)
- **MINOR**: Novas funcionalidades mantendo compatibilidade
- **PATCH**: Correções de bugs e pequenas melhorias

Exemplo: `1.0.0`, `1.1.0`, `1.1.1`

#### Processo de Release

1. **Atualizar versão no package.json**
   ```bash
   # Para major release (breaking changes)
   npm version major

   # Para minor release (novas features)
   npm version minor

   # Para patch release (bug fixes)
   npm version patch
   ```

2. **Atualizar CHANGELOG.md**
   - Categorizar mudanças por tipo:
     - **Features**: Novas funcionalidades
     - **Bug Fixes**: Correções de bugs
     - **Performance**: Melhorias de performance
     - **Refactor**: Refatorações de código
     - **Documentation**: Atualizações de documentação
     - **Chore**: Tarefas de manutenção
   - Incluir links para commits e issues quando aplicável
   - Formato: `**componente:** Descrição da mudança ([#issue](link)) ([hash](link))`

3. **Criar Git Tag**
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

4. **Criar GitHub Release**
   ```bash
   gh release create v1.0.0 \
     --title "v1.0.0" \
     --notes-file RELEASE_NOTES.md \
     --latest
   ```

#### Estrutura de Release Notes

```markdown
## v1.0.0 - YYYY-MM-DD

### Features
- **componente:** Descrição da feature ([#123](link))
- **componente:** Outra feature ([#124](link))

### Bug Fixes
- **componente:** Correção de bug ([#125](link))

### Performance
- **componente:** Melhoria de performance ([#126](link))

### Documentation
- Atualização de documentação

### Chore
- Atualizações de dependências
```

#### Categorias de Release

- **Stable/Production**: Versões estáveis para produção (marcadas como "Latest")
- **Pre-release**: Versões beta/RC (marcadas como "Pre-release")
- **Experimental**: Versões para testes (sufixo `-exp.0`)

#### Exemplo de Release Completo

```bash
# 1. Atualizar versão
npm version minor

# 2. Atualizar CHANGELOG.md
# (editar manualmente)

# 3. Commit das mudanças
git add .
git commit -m "chore: prepare release v1.1.0"

# 4. Push para main
git push origin main

# 5. Criar tag
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0

# 6. Criar release no GitHub
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes "Release notes aqui" \
  --latest
```

### Boas Práticas

#### Commits

- Usar Conventional Commits: `type(scope): message`
- Tipos: `feat`, `fix`, `perf`, `refactor`, `docs`, `chore`, `test`
- Exemplos:
  - `feat(auth): add OAuth2 integration`
  - `fix(dashboard): resolve data loading issue`
  - `perf(api): optimize database queries`

#### Code Review

- Todo PR deve ter revisão antes de merge
- Executar testes antes de aprovar
- Verificar performance e segurança

#### Deploy

- Sempre fazer deploy de main para produção
- Usar GitHub Actions para automação
- Verificar build antes de release

#### Qualidade

- Manter Core Web Vitals excelentes (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- Otimizar bundle size (code splitting, tree shaking, lazy loading)
- Seguir padrões de acessibilidade (WCAG 2.1)
- Implementar testes automatizados

### Estrutura do Projeto

```
Extrativo v3/
├── .claude/              # Configurações do Claude Code
├── .github/              # GitHub Actions workflows
├── docker/               # Docker configurations
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/      # React components
│   ├── lib/             # Utilities e helpers
│   └── styles/          # Estilos globais
├── CHANGELOG.md         # Histórico de mudanças
├── claude.md            # Este arquivo
└── package.json         # Dependências e scripts
```

### Tecnologias Principais

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **i18n**: i18next, react-i18next
- **Charts**: Recharts
- **Maps**: React-Leaflet
- **Animation**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Testing**: Playwright

### Performance Targets

- **Bundle Size**: < 200KB (initial load, gzipped)
- **LCP**: < 1.0s
- **INP**: < 100ms
- **CLS**: 0
- **Module Count**: < 1700
- **Load Time**: < 1.5s (localhost)

### Segurança

- Nunca commitar secrets (.env files)
- Usar variáveis de ambiente para configurações sensíveis
- Implementar RLS (Row Level Security) no Supabase
- Validar inputs com Zod
- Sanitizar dados antes de renderizar

---

**Última atualização**: 2025-01-12
**Versão do documento**: 1.0.0
