# E2E Tests - Extrativo

Testes End-to-End usando Playwright para garantir a qualidade e funcionamento da aplicação.

## 📁 Estrutura

```
tests/
├── e2e/
│   ├── auth/              # Testes de autenticação
│   │   ├── login.spec.ts
│   │   └── signup.spec.ts
│   ├── dashboard/         # Testes do dashboard
│   │   └── overview.spec.ts
│   └── database/          # Testes do schema do banco
│       └── schema.spec.ts
├── fixtures/              # Dados de teste
│   ├── users.json
│   └── extractions.json
├── utils/                 # Funções auxiliares
│   ├── auth.ts           # Helpers de autenticação
│   └── db.ts             # Helpers de banco de dados
└── README.md             # Este arquivo
```

## 🚀 Como Executar

### Executar todos os testes

```bash
npm test
```

### Executar com interface gráfica

```bash
npm run test:ui
```

### Executar em modo headed (ver o browser)

```bash
npm run test:headed
```

### Executar em modo debug

```bash
npm run test:debug
```

### Ver relatório dos testes

```bash
npm run test:report
```

### Executar teste específico

```bash
npx playwright test tests/e2e/auth/login.spec.ts
```

### Executar apenas testes de autenticação

```bash
npx playwright test tests/e2e/auth/
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` com as seguintes variáveis (para testes):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Para testes admin

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Test User (opcional - para testes de login)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
TEST_EXISTING_EMAIL=existing@example.com  # Email já cadastrado
```

## 📝 Escrevendo Testes

### Exemplo de teste básico

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/my-page');
    await expect(page.getByText('Hello')).toBeVisible();
  });
});
```

### Usando helpers de autenticação

```typescript
import { test, expect } from '@playwright/test';
import { loginAsUser, logout } from '../utils/auth';

test.describe('Authenticated Feature', () => {
  test('should work when logged in', async ({ page }) => {
    await loginAsUser(page);

    // Seu teste aqui
    await expect(page).toHaveURL('/dashboard');

    await logout(page);
  });
});
```

### Usando helpers de banco de dados

```typescript
import { test, expect } from '@playwright/test';
import { supabaseAdmin, createTestProject } from '../utils/db';

test.describe('Database Operations', () => {
  test('should create project', async ({ page }) => {
    const project = await createTestProject('user-id', 'Test Project');
    expect(project.name).toBe('Test Project');
  });
});
```

## 🎯 Boas Práticas

1. **Sempre limpe os dados de teste** após os testes
2. **Use fixtures** para dados de teste consistentes
3. **Evite hardcoding** - use variáveis de ambiente
4. **Organize os testes** por feature/módulo
5. **Use helpers** para evitar duplicação de código
6. **Adicione comentários** explicando testes complexos
7. **Use data-testid** para seletores estáveis

## 🐛 Debugging

### Ver trace de um teste que falhou

1. Execute o teste
2. Abra o relatório: `npm run test:report`
3. Clique no teste que falhou
4. Visualize o trace completo

### Pausar execução e inspecionar

```typescript
test('my test', async ({ page }) => {
  await page.goto('/');
  await page.pause();  // Pausa aqui
});
```

## 📊 Coverage

Para verificar a cobertura dos testes:

```bash
npx playwright test --reporter=html
npm run test:report
```

## 🔗 Links Úteis

- [Documentação Playwright](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Seletores](https://playwright.dev/docs/selectors)
- [Asserções](https://playwright.dev/docs/test-assertions)
