# 🚀 Guia de Deploy - Extrativo.AI

Guia completo para fazer deploy do Extrativo.AI na Vercel com domínio customizado via Cloudflare.

## 📋 Pré-requisitos

- [ ] Conta no GitHub
- [ ] Conta na Vercel (https://vercel.com)
- [ ] Domínio registrado na Hostinger
- [ ] Conta na Cloudflare (https://cloudflare.com)
- [ ] Repositório Git configurado

---

## 🔧 Parte 1: Preparar Repositório GitHub

### 1.1 Criar Repositório no GitHub (se ainda não tiver)

1. Acesse: https://github.com/new
2. Nome do repositório: `extrativo-front` (ou outro nome)
3. Deixe como **Private** (recomendado)
4. **NÃO** inicialize com README (já temos o projeto)
5. Clique em **Create repository**

### 1.2 Conectar Projeto Local ao GitHub

```bash
cd /Users/well/Desktop/WORK/DEV/EXTRATIVO/Exatrativo.v1/extrativo-front

# Se ainda não tiver remote configurado:
git remote add origin https://github.com/SEU-USUARIO/extrativo-front.git

# Ou se já tiver, atualize:
git remote set-url origin https://github.com/SEU-USUARIO/extrativo-front.git

# Adicione todos os arquivos
git add .

# Faça o commit
git commit -m "🚀 Initial commit: Extrativo.AI - Setup completo com i18n, auth e logos"

# Push para o GitHub
git push -u origin main
```

⚠️ **IMPORTANTE**: Certifique-se de que o `.env.local` está no `.gitignore` para NÃO enviar credenciais!

---

## ☁️ Parte 2: Configurar Vercel

### 2.1 Criar Projeto na Vercel

1. Acesse: https://vercel.com/new
2. Clique em **Import Git Repository**
3. Conecte sua conta GitHub se ainda não conectou
4. Selecione o repositório `extrativo-front`
5. Configure o projeto:
   - **Framework Preset**: Next.js (já detecta automaticamente)
   - **Root Directory**: `./` (raiz do projeto)
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)
   - **Install Command**: `npm install` (padrão)

### 2.2 Configurar Variáveis de Ambiente

Na página de configuração do projeto (ou depois em Settings > Environment Variables), adicione:

#### Production Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://igcgirkbtehuljsbnphk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnY2dpcmtidGVodWxqc2JucGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5OTA3MTksImV4cCI6MjA3NjU2NjcxOX0.xI4PB0SdzqWxM64jqXrkh5Hr0yKDHdnFqdFEhd-4iO0
```

⚠️ **Nunca** adicione o `SUPABASE_SERVICE_ROLE_KEY` nas variáveis públicas do frontend!

6. Clique em **Deploy**

### 2.3 Obter Tokens para GitHub Actions

#### Passo 1: Obter VERCEL_TOKEN
1. Acesse: https://vercel.com/account/tokens
2. Clique em **Create Token**
3. Nome: `GitHub Actions Deploy`
4. Scope: **Full Account**
5. Copie o token (só aparece uma vez!)

#### Passo 2: Obter VERCEL_ORG_ID e VERCEL_PROJECT_ID
```bash
# Instale o Vercel CLI globalmente
npm install -g vercel

# Faça login
vercel login

# Entre no diretório do projeto
cd /Users/well/Desktop/WORK/DEV/EXTRATIVO/Exatrativo.v1/extrativo-front

# Link o projeto
vercel link

# Pegue os IDs
cat .vercel/project.json
```

Você verá algo como:
```json
{
  "orgId": "team_xxxxxxxxx",
  "projectId": "prj_xxxxxxxxx"
}
```

---

## 🔐 Parte 3: Configurar GitHub Secrets

1. Vá para o repositório no GitHub
2. Acesse: **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret** e adicione:

| Nome | Valor |
|------|-------|
| `VERCEL_TOKEN` | Token gerado no passo 2.3 |
| `VERCEL_ORG_ID` | orgId do .vercel/project.json |
| `VERCEL_PROJECT_ID` | projectId do .vercel/project.json |
| `NEXT_PUBLIC_SUPABASE_URL` | https://igcgirkbtehuljsbnphk.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (sua anon key) |

---

## 🌐 Parte 4: Configurar Domínio com Cloudflare

### 4.1 Transferir DNS para Cloudflare

1. Acesse: https://dash.cloudflare.com
2. Clique em **Add a Site**
3. Digite seu domínio (ex: `extrativo.ai`)
4. Escolha o plano **Free**
5. A Cloudflare vai escanear seus DNS records atuais
6. Revise e confirme os records encontrados
7. A Cloudflare vai te dar **2 nameservers**, algo como:
   ```
   ava.ns.cloudflare.com
   tim.ns.cloudflare.com
   ```

### 4.2 Atualizar Nameservers na Hostinger

1. Faça login na **Hostinger**
2. Vá para **Domínios** > Selecione seu domínio
3. Clique em **DNS / Nameservers**
4. Escolha **Custom Nameservers**
5. Substitua pelos nameservers da Cloudflare
6. Salve as alterações

⏰ **Aguarde**: A propagação pode levar de 2 a 48 horas (geralmente 2-4 horas)

### 4.3 Verificar Ativação na Cloudflare

Quando os nameservers forem atualizados:
1. A Cloudflare vai enviar um email confirmando
2. No painel você verá o status como **Active**

---

## 🔗 Parte 5: Conectar Domínio à Vercel

### 5.1 Adicionar Domínio na Vercel

1. No projeto da Vercel, vá para **Settings** > **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio principal: `extrativo.ai`
4. Clique em **Add**
5. A Vercel vai pedir para você configurar DNS

### 5.2 Configurar DNS Records na Cloudflare

Volte para o painel da Cloudflare e adicione os seguintes records:

#### Para domínio principal (`extrativo.ai`):

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | @ | `76.76.21.21` | Proxied (☁️) |
| CNAME | www | `cname.vercel-dns.com` | Proxied (☁️) |

#### IPs da Vercel (se pedir A records):
```
76.76.21.21
76.76.21.22
```

### 5.3 Configurar SSL na Cloudflare

1. Na Cloudflare, vá para **SSL/TLS**
2. Escolha o modo: **Full (strict)**
3. Em **Edge Certificates**, ative:
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - ✅ Minimum TLS Version: 1.2

---

## ✅ Parte 6: Verificar Deploy

### 6.1 Testar Deploy Automático

1. Faça uma pequena alteração no código
2. Commit e push:
   ```bash
   git add .
   git commit -m "test: Deploy automático"
   git push
   ```
3. Vá para **GitHub** > **Actions** e veja o workflow rodando
4. Quando terminar, verifique na Vercel se o deploy foi bem-sucedido

### 6.2 Testar Domínio

Após a propagação DNS (2-4 horas):

```bash
# Teste o domínio
curl -I https://extrativo.ai

# Deve retornar 200 OK
```

Acesse no navegador:
- https://extrativo.ai
- https://www.extrativo.ai

Ambos devem funcionar e redirecionar para HTTPS automaticamente.

---

## 🐛 Troubleshooting

### Problema: Deploy falha no GitHub Actions
**Solução**: Verifique se todos os secrets estão configurados corretamente

### Problema: Domínio não resolve
**Solução**:
1. Verifique se os nameservers foram atualizados na Hostinger
2. Aguarde propagação DNS (até 48h)
3. Use https://dnschecker.org para verificar propagação

### Problema: SSL/HTTPS não funciona
**Solução**:
1. Certifique-se que o modo SSL na Cloudflare está em **Full (strict)**
2. Aguarde alguns minutos para o certificado ser provisionado
3. Limpe cache do navegador

### Problema: "Invalid Host header"
**Solução**: Adicione o domínio nas configurações da Vercel em Settings > Domains

---

## 📊 Monitoramento

### Analytics da Vercel
- Acesse: Project > Analytics
- Veja métricas de performance, uso, etc.

### Cloudflare Analytics
- Acesse: Cloudflare Dashboard > Analytics
- Veja tráfego, ameaças bloqueadas, etc.

---

## 🔄 Workflow de Deploy

Após tudo configurado, o fluxo será:

1. Você faz alterações no código localmente
2. Commit e push para o GitHub
3. GitHub Actions detecta o push
4. Roda testes e build
5. Faz deploy automático na Vercel
6. Vercel atualiza o site em produção
7. Cloudflare serve o conteúdo com cache e proteção

**Deploy time**: ~2-5 minutos ⚡

---

## 📝 Checklist Final

- [ ] Repositório no GitHub configurado
- [ ] Projeto conectado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] GitHub Secrets adicionados
- [ ] Domínio transferido para Cloudflare
- [ ] Nameservers atualizados na Hostinger
- [ ] DNS records configurados na Cloudflare
- [ ] SSL configurado (Full strict)
- [ ] Deploy automático funcionando
- [ ] Domínio resolvendo corretamente
- [ ] HTTPS funcionando

---

## 🎉 Pronto!

Seu Extrativo.AI está no ar! 🚀

**URLs:**
- Produção: https://extrativo.ai
- Vercel: https://seu-projeto.vercel.app

Para qualquer alteração, basta fazer push para `main` e o deploy acontece automaticamente!
