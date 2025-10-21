# i18n BEST PRACTICES - EXTRATIVO.AI

## 🚨 REGRA DE OURO (GOLDEN RULE)

**NUNCA escreva texto diretamente no código. SEMPRE use i18n primeiro.**

Esta é a regra mais importante do projeto. Violá-la significa criar débito técnico que será difícil de corrigir depois.

## ❌ ERRADO vs ✅ CORRETO

### Exemplo 1: Texto em componente

❌ **ERRADO:**
```tsx
<h1>Bem-vindo ao Extrativo.AI</h1>
<p>Faça login para continuar</p>
```

✅ **CORRETO:**
```tsx
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation('common')
  return (
    <>
      <h1>{t('welcome_message')}</h1>
      <p>{t('login_to_continue')}</p>
    </>
  )
}
```

### Exemplo 2: Botões

❌ **ERRADO:**
```tsx
<Button>Salvar</Button>
<Button>Cancelar</Button>
```

✅ **CORRETO:**
```tsx
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation('common')
  return (
    <>
      <Button>{t('save')}</Button>
      <Button>{t('cancel')}</Button>
    </>
  )
}
```

### Exemplo 3: Mensagens de erro

❌ **ERRADO:**
```tsx
toast.error('Erro ao salvar dados')
```

✅ **CORRETO:**
```tsx
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation('common')

  const handleSave = () => {
    toast.error(t('error_saving_data'))
  }
}
```

### Exemplo 4: Placeholder e labels

❌ **ERRADO:**
```tsx
<Input placeholder="Digite seu email" />
<Label>Senha</Label>
```

✅ **CORRETO:**
```tsx
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation('auth')
  return (
    <>
      <Input placeholder={t('enter_email')} />
      <Label>{t('password')}</Label>
    </>
  )
}
```

### Exemplo 5: Interpolação de variáveis

❌ **ERRADO:**
```tsx
<p>Olá, {userName}! Você tem {count} mensagens</p>
```

✅ **CORRETO:**
```tsx
// Em pt-BR/common.json:
{
  "greeting_with_count": "Olá, {{name}}! Você tem {{count}} mensagens"
}

// No componente:
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation('common')
  return <p>{t('greeting_with_count', { name: userName, count })}</p>
}
```

## 📋 WORKFLOW CORRETO

### Passo 1: JSON PRIMEIRO
Antes de escrever qualquer texto no código, adicione-o aos arquivos JSON:

```json
// src/lib/i18n/locales/pt-BR/auth.json
{
  "new_key": "Novo texto em português"
}

// src/lib/i18n/locales/en/auth.json
{
  "new_key": "New text in English"
}

// src/lib/i18n/locales/es/auth.json
{
  "new_key": "Nuevo texto en español"
}
```

### Passo 2: CÓDIGO DEPOIS
Só então use a chave no código:

```tsx
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation('auth')
  return <div>{t('new_key')}</div>
}
```

## 🗂️ ORGANIZAÇÃO DE NAMESPACES

Escolha o namespace correto para cada texto:

- **common**: Textos genéricos usados em vários lugares (botões, ações, erros comuns)
- **auth**: Tudo relacionado a autenticação (login, signup, verificação)
- **extractions**: Funcionalidades de extração de dados
- **profile**: Perfil do usuário, configurações, API keys

## 🔍 CHECKLIST DE CODE REVIEW

Antes de commitar código, verifique:

- [ ] Nenhum texto hardcoded em JSX/TSX
- [ ] Todos os textos estão nos 3 idiomas (pt-BR, en, es)
- [ ] useTranslation foi importado corretamente
- [ ] Namespace correto foi escolhido
- [ ] Interpolações usam sintaxe {{variavel}}
- [ ] Pluralização usa sintaxe correta do i18next (se necessário)

## 🚀 COMANDOS ÚTEIS

### Adicionar nova tradução
1. Edite os 3 arquivos JSON (pt-BR, en, es)
2. Use a chave com `t('namespace:key')`

### Usar namespace diferente do padrão
```tsx
const { t } = useTranslation('extractions')
// ou
const { t } = useTranslation(['common', 'extractions'])
```

### Acessar múltiplos namespaces
```tsx
const { t: tCommon } = useTranslation('common')
const { t: tAuth } = useTranslation('auth')
```

## 💡 DICAS

1. **Seja descritivo nas chaves**: Use `login_button` ao invés de `btn1`
2. **Agrupe textos relacionados**: Use prefixos como `error_`, `success_`, `label_`
3. **Reutilize textos comuns**: Botões "Salvar", "Cancelar" devem estar em `common`
4. **Pense no contexto**: "Delete" em um botão vs em uma confirmação podem precisar de chaves diferentes
5. **Mantenha consistência**: Se usou `snake_case` nas chaves, continue usando

## 🎯 EXEMPLOS REAIS DO PROJETO

### Login Form
```tsx
import { useTranslation } from 'react-i18next'

export function LoginForm() {
  const { t } = useTranslation('auth')

  return (
    <form>
      <h1>{t('login')}</h1>
      <Input placeholder={t('enter_email')} />
      <Input type="password" placeholder={t('enter_password')} />
      <Button>{t('login')}</Button>
      <p>{t('dont_have_account')} <a>{t('sign_up_here')}</a></p>
    </form>
  )
}
```

### Extractions List
```tsx
import { useTranslation } from 'react-i18next'

export function ExtractionsList() {
  const { t } = useTranslation('extractions')

  return (
    <div>
      <h1>{t('extractions')}</h1>
      <Button>{t('new_extraction')}</Button>
      {extractions.map(e => (
        <div key={e.id}>
          <span>{t(`status_${e.status}`)}</span>
          <Button>{t('download_csv')}</Button>
        </div>
      ))}
    </div>
  )
}
```

## ⚠️ AVISOS FINAIS

1. **Nunca misture idiomas**: Não coloque português no código e deixe inglês para "depois"
2. **Traduza 100%**: Todas as 3 línguas devem ter todas as chaves
3. **Teste em todos os idiomas**: Troque o idioma e navegue pela aplicação
4. **Não use Google Translate cegamente**: Contexto importa, revise as traduções

---

**Lembre-se: ZERO TEXTO HARDCODED. Sempre i18n primeiro, código depois.**
