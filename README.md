
# Extrativo.AI - Frontend

Deploy automático configurado com GitHub Actions + Vercel! 🚀

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Autenticação**: Supabase Auth
- **Internacionalização**: i18next (pt-BR, en-US, es-ES)
- **Styling**: Tailwind CSS + shadcn/ui
- **Tema**: next-themes (claro/escuro)
- **Deploy**: GitHub Actions → Vercel
- **Containerização**: Docker + Docker Compose

## 🚀 Quick Start

### Usando Docker (Recomendado)

**Desenvolvimento:**
```bash
docker-compose -f docker/docker-compose.dev.yml up
```

**Produção:**
```bash
docker-compose -f docker/docker-compose.yml up -d
```

**Com scripts helper:**
```bash
# Linux/Mac
./scripts/docker-run.sh

# Windows
./scripts/docker-run.ps1
```

### Desenvolvimento Local

```bash
npm install
npm run dev
```

## 📁 Estrutura do Projeto

```
/
├── docker/              # Configurações Docker
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
├── scripts/             # Scripts de automação
│   ├── docker-run.sh
│   └── docker-run.ps1
├── docs/                # Documentação
│   ├── README.md
│   ├── DOCKER.md
│   └── DEPLOYMENT.md
├── src/                 # Código fonte
│   ├── app/            # Next.js App Router
│   ├── components/     # Componentes React
│   ├── hooks/          # Custom hooks
│   └── lib/            # Utilitários
├── public/              # Assets estáticos
└── ...                  # Configs na raiz
```

## 📚 Documentação

Para documentação detalhada, veja a pasta [docs/](./docs/):
- **[Guia Docker](./docs/DOCKER.md)** - Como rodar com Docker
- **[Guia de Deploy](./docs/DEPLOYMENT.md)** - Deploy para produção

## 📦 Status

- ✅ GitHub Actions configurado
- ✅ Deploy automático ativo
- ✅ Secrets configurados
- ✅ Docker configurado

## 🌐 URLs

- **Produção**: [extrativo-front.vercel.app](https://extrativo-front.vercel.app)
- **Repositório**: [github.com/WelL-O/Extrativo.ai](https://github.com/WelL-O/Extrativo.ai)

---

**Desenvolvido com ❤️ usando Claude Code**

