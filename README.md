# CineVault

Aplicacao web para descoberta e organizacao de filmes e series com autenticacao, listas pessoais e perfil de usuario.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- NextAuth.js
- Prisma
- TanStack Query
- Zustand
- Embla Carousel

## Funcionalidades

- Login com Google e com credenciais (email/usuario + senha)
- Cadastro de usuario
- Perfil com edicao de username, senha e foto
- Home com carrosseis e listas de categorias
- Pagina de detalhes com trailer
- Busca e filtros
- Listas pessoais: favoritos, assistir depois e assistidos
- Header responsivo com menu lateral em mobile

## Setup Local

1. Instale dependencias:

   npm install

2. Copie as variaveis de ambiente:

   cp .env.example .env

3. Configure no `.env`:

   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `TMDB_API_KEY`

4. Execute migrations e gere o client Prisma:

   npm run prisma:migrate -- --name init

5. Rode em desenvolvimento:

   npm run dev

## Controle de Versao (Git)

### Inicializacao

```bash
git init
git add .
git commit -m "chore: initialize Next.js project with TypeScript"
```

### Padrao de Commits

Este projeto utiliza Conventional Commits:

- `feat:` nova funcionalidade
- `fix:` correcao de bug
- `chore:` tarefa tecnica/infra
- `refactor:` melhoria estrutural sem alterar comportamento
- `docs:` documentacao

Exemplos:

- `feat: create movie card component`
- `feat: integrate TMDB movie API service`
- `feat: implement Google authentication using NextAuth`
- `feat: add favorites feature with persistent storage`
- `fix: correct mobile drawer overflow behavior`
- `ci: add GitHub Actions lint and build workflow`

## GitHub Remote

Configure o remoto com seu repositorio:

```bash
git remote add origin https://github.com/USER/movie-app.git
git branch -M main
git push -u origin main
```

## CI/CD (GitHub Actions)

Workflow em `.github/workflows/ci.yml` executa em `push` e `pull_request` para `main`.

Etapas:

1. Install dependencies
2. Generate Prisma Client
3. Run lint
4. Run build

## Deploy com Vercel

A Vercel possui integracao nativa com Next.js.

### Fluxo esperado

- Deploy automatico a cada push na branch `main`
- Preview deployment em Pull Requests

### Como configurar

1. Conecte o repositorio no painel da Vercel.
2. Selecione a branch `main` como producao.
3. Configure as variaveis de ambiente no projeto Vercel:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `TMDB_API_KEY`
   - `DATABASE_URL`
4. Salve e execute o primeiro deploy.

## Fluxo de Desenvolvimento

1. Criar/ajustar funcionalidade
2. Rodar lint e build localmente
3. Criar commit semantico pequeno e claro
4. Abrir Pull Request
5. Validar CI verde
6. Merge em `main` para deploy automatico
