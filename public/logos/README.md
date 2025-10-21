# Instruções para Adicionar as Logos

Para que as logos apareçam corretamente na aplicação, você precisa adicionar as seguintes imagens neste diretório:

## Arquivos Necessários

### 1. `logo-dark.png`
- **Descrição**: Logo para ser usada em **tema escuro**
- **Origem**: Image #1 (logo branca/clara que você forneceu)
- **Uso**:
  - Sidebar quando o tema está escuro
  - Páginas de login/signup quando o tema está escuro (fundo branco + logo escura)

### 2. `logo-light.png`
- **Descrição**: Logo para ser usada em **tema claro**
- **Origem**: Image #2 (logo preta/escura que você forneceu)
- **Uso**:
  - Sidebar quando o tema está claro
  - Páginas de login/signup quando o tema está claro (fundo preto + logo clara)

## Especificações Recomendadas

### Para Logos da Sidebar (`logo-dark.png` e `logo-light.png`)
- **Formato**: PNG com fundo transparente
- **Altura**: 32px (fixo)
- **Largura**: proporcional (auto)
- **DPI**: 72-144 (2x para telas retina)

### Para Páginas de Auth (Login/Signup)
As mesmas imagens são usadas, mas renderizadas em tamanho maior:
- **Largura máxima**: 384px (max-w-sm)
- **Altura**: proporcional (auto)

## Como Adicionar

1. Renomeie suas imagens para:
   - `logo-dark.png` (logo clara para tema escuro)
   - `logo-light.png` (logo escura para tema claro)

2. Copie os arquivos para este diretório:
   ```bash
   /public/logos/
   ```

3. Verifique se os arquivos estão acessíveis:
   - http://localhost:3000/logos/logo-dark.png
   - http://localhost:3000/logos/logo-light.png

## Comportamento Implementado

### Sidebar
- **Tema Claro**: Mostra `logo-light.png` (logo escura)
- **Tema Escuro**: Mostra `logo-dark.png` (logo clara)

### Login/Signup
- **Tema Claro**: Fundo preto + `logo-light.png` (logo clara) + slogan
- **Tema Escuro**: Fundo branco + `logo-dark.png` (logo escura) + slogan
- **Slogan**: "Inteligência B2B: Mapeie e extraia a sua vantagem."

## Otimização (Opcional)

Para melhor performance, você pode:
1. Comprimir as imagens usando TinyPNG ou similar
2. Criar versões @2x para telas retina
3. Converter para WebP para navegadores modernos

## Estrutura Final

```
public/
└── logos/
    ├── logo-dark.png      ← Logo clara (para tema escuro)
    ├── logo-light.png     ← Logo escura (para tema claro)
    └── README.md          ← Este arquivo
```

Após adicionar as imagens, recarregue a página e teste alternando entre os temas claro e escuro!
