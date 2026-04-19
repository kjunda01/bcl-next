# BCL Frontend Next

Frontend da Banda Carmelitana Luminarense construído com Next.js 16 e React 19. O projeto reúne páginas institucionais, autenticação simulada, área de perfil/configurações, módulo de estudo de partituras e CRUD de alunos consumindo uma API mock local via `json-server`.

## Visão geral

O sistema está organizado sobre o App Router do Next.js, com componentes e páginas legadas reaproveitadas durante a migração. Atualmente, os fluxos mais relevantes são:

- página inicial institucional com destaques, galeria e vídeos;
- login simulado com persistência opcional em `localStorage`;
- perfil do usuário autenticado;
- configurações de tema e preferências de interface;
- listagem, criação, edição, visualização e remoção de alunos;
- estudo de partituras MusicXML com player dedicado.

Parte das entradas de navegação ainda aponta para áreas em evolução ou placeholders, então nem todas as rotas do menu representam funcionalidades finalizadas.

## Stack

- Next.js 16.2.2
- React 19.2.4
- TypeScript 5
- Sass
- Tailwind CSS 4
- ESLint 9
- `json-server` para API mock local
- `opensheetmusicdisplay` e `@music-i18n/musicxml-player` para o módulo de estudo

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

## Instalação

Instale as dependências na raiz do projeto:

```bash
npm install
```

## Como executar em desenvolvimento

O fluxo local usa dois processos: frontend Next.js e API mock.

### 1. Suba a API mock

```bash
npm run api:server
```

A API ficará disponível em `http://localhost:3001`.

### 2. Em outro terminal, suba o frontend

```bash
npm run dev
```

O app ficará disponível em `http://localhost:3000`.

### 3. Acesse a aplicação

- frontend: `http://localhost:3000`
- API mock: `http://localhost:3001/students`

## Variáveis de ambiente

O frontend lê a base da API a partir de `NEXT_PUBLIC_API_URL`.

Exemplo de arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Se a variável não for definida, o cliente HTTP principal já usa `http://localhost:3001` como fallback.

## Scripts disponíveis

```bash
npm run dev        # inicia o Next.js em modo de desenvolvimento
npm run build      # gera o build de produção
npm run start      # sobe o build gerado
npm run lint       # executa o ESLint
npm run api:server # sobe o json-server com base no db.json
```

## Build e execução de produção

Para validar o build localmente:

```bash
npm run build
npm run start
```

Se o ambiente de produção também depender da API mock, mantenha um processo servindo os dados esperados ou substitua a URL por uma API real via `NEXT_PUBLIC_API_URL`.

## Estrutura do projeto

```text
.
├── db.json                  # base usada pelo json-server
├── public/                  # assets estáticos, partituras, mídias e scripts auxiliares
├── src/
│   ├── app/                 # rotas App Router do Next.js
│   ├── components/          # componentes reutilizáveis
│   ├── contexts/            # autenticação e tema
│   ├── hooks/               # hooks compartilhados, incluindo CRUD genérico
│   ├── layouts/             # shell principal da aplicação
│   ├── legacy-pages/        # páginas reaproveitadas da fase anterior da migração
│   ├── lib/                 # utilitários de infraestrutura, como cliente HTTP
│   └── study/               # lógica do módulo de estudo musical
└── package.json             # scripts e dependências
```

## Rotas principais

- `/` e `/home`: página inicial institucional
- `/login`: autenticação simulada
- `/profile`: perfil do usuário autenticado
- `/settings`: preferências visuais
- `/students`: CRUD de alunos
- `/study`: módulo de estudo de partituras

## API mock

O arquivo `db.json` contém a base inicial do `json-server`. Hoje o recurso principal documentado no projeto é:

- `GET /students`
- `POST /students`
- `PUT /students/:id`
- `DELETE /students/:id`

Isso é suficiente para suportar o CRUD de alunos usado pela interface.

## Fluxos importantes

### Login

O login é simulado. A autenticação não depende de backend real e usa `localStorage` para manter a sessão quando a opção de permanência estiver ativa.

### Estudo de partituras

O módulo de estudo utiliza arquivos MusicXML e assets em `public/assets/`. Os exemplos atualmente expostos incluem:

- Hino Francisco Diniz
- Nossa Senhora - Roberto Carlos
- Vento Ventania
- Rock You Like a Hurricane
- Vila do Sossego

### CRUD de alunos

O CRUD consome a API mock local e cobre:

- listagem com busca e ações por linha;
- visualização detalhada;
- criação;
- edição;
- exclusão com confirmação.

## Observações de desenvolvimento

- O projeto ainda contém páginas e componentes legados em paralelo à estrutura atual do App Router.
- Algumas opções do menu lateral apontam para áreas que ainda não estão finalizadas.
- Há arquivos `:Zone.Identifier` dentro de `public/`, trazidos do ambiente de origem; eles não fazem parte do runtime da aplicação no Linux.

## Lint

Para verificar o código:

```bash
npm run lint
```

## Próximos passos recomendados

- consolidar as páginas legadas já migradas para a estrutura final do App Router;
- expandir o `db.json` ou substituir o mock por API real;
- documentar contratos de dados adicionais à medida que novas áreas forem ativadas.
