# BCL Frontend Next

Frontend da Banda Carmelitana Luminarense: portal público institucional e área interna de gestão, construídos com Next.js 16 e React 19.

Sem login, o visitante vê apenas o portal. Depois de autenticar, a navegação e os dados visíveis seguem o perfil (admin, maestro, músico ou aluno).

## Visão geral

O app usa o App Router do Next.js e está organizado por **domínios**, para permitir incluir módulos novos sem espalhar regras de permissão nas páginas.

Hoje o produto cobre:

- portal público (início, agenda, blog, sobre) com menu superior e botão Entrar;
- autenticação simulada, com persistência opcional em `localStorage`;
- área `/gestao` com CRUDs por domínio, filtrados pelo perfil;
- máscara de dados sensíveis para músico e aluno;
- tema global (cores, tipografia e raios) inspirado no [drone.io](https://www.drone.io/);
- modo de estudo em `/study`, com seleção de instrumentos para partitura e MIDI.

Os módulos de usuários, pessoas, músicas, patrimônio, instrumentos, apresentações e mídias permitem visualizar, criar, editar e excluir conforme as permissões do perfil. O cadastro de pessoas aceita aluno, músico ou os dois, exige responsável para menores de idade e impede e-mail ou documento duplicado.

## Stack

- Next.js 16.2.2
- React 19.2.4
- TypeScript 5
- Sass
- Tailwind CSS 4
- ESLint 9
- `json-server` para API mock local
- `opensheetmusicdisplay` e `@music-i18n/musicxml-player` no módulo de estudo

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

## Instalação

Na pasta `front-next`:

```bash
npm install
```

## Como executar em desenvolvimento

São dois processos: API mock e frontend.

### 1. API mock

```bash
npm run api:server
```

Disponível em `http://localhost:3001`.

### 2. Frontend

```bash
npm run dev
```

Disponível em `http://localhost:3000`.

### 3. Acesso

- portal: `http://localhost:3000`
- login: `http://localhost:3000/login`
- gestão (após login): `http://localhost:3000/gestao`
- API: `http://localhost:3001/people`

## Variáveis de ambiente

O cliente HTTP lê `NEXT_PUBLIC_API_URL`.

Exemplo de `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Se a variável não existir, o fallback é `http://localhost:3001`.

## Scripts

```bash
npm run dev        # Next.js em desenvolvimento
npm run build      # build de produção
npm run start      # sobe o build gerado
npm run lint       # ESLint
npm run api:server # json-server em db.json, porta 3001
```

## Perfis e permissões

| Perfil | Acesso |
| --- | --- |
| Público | Somente o portal (início, agenda pública, blog, sobre). Sem login. |
| Aluno | Lê músicas, instrumentos, alunos (dados sensíveis mascarados) e apresentações. |
| Músico | Lê músicas, patrimônio, instrumentos, alunos e músicos (dados sensíveis mascarados) e apresentações. |
| Maestro | CRUD de todos os módulos de gestão. Pode gerenciar perfis, mas **não** pode atribuir admin. |
| Admin | Tudo, inclusive promover outro usuário a admin. |

Campos mascarados para aluno e músico: e-mail, telefone, endereço, data de nascimento, documento e dados de responsável.

A regra `can(roles, resource, action)` vive em `src/core/auth/permissions.ts`. Usuários com mais de um perfil recebem a união das permissões, e o menu interno é montado a partir disso.

### Contas de demonstração

Login simulado. Na tela também há acesso rápido por perfil.

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Admin | `admin@bcl.local` | `admin` |
| Maestro | `maestro@bcl.local` | `maestro` |
| Músico | `musico@bcl.local` | `musico` |
| Aluno | `aluno@bcl.local` | `aluno` |
| Aluno + Músico | `ambos@bcl.local` | `ambos` |

A pessoa pode ser aluno, músico ou os dois (`isStudent` / `isMusician`). A conta de login possui `roles[]`; o seed da Luísa Sax contém os perfis aluno e músico e, portanto, recebe a união das permissões.

## Domínios e entidades

| Domínio | Rota | Recurso da API | Observação |
| --- | --- | --- | --- |
| Portal | `/`, `/agenda`, `/blog`, `/sobre` | `media`, `presentations` (público) | Sem autenticação |
| Usuários | `/gestao/usuarios` | `users` | Conta, e-mail e `roles[]` |
| Alunos e músicos | `/gestao/pessoas` | `people` | Uma pessoa, dois papéis possíveis |
| Músicas | `/gestao/musicas` | `songs` | Partituras MusicXML em `scores[]` |
| Patrimônio | `/gestao/patrimonio` | `patrimony` | Bens da associação |
| Instrumentos | `/gestao/instrumentos` | `patrimony` | Mesmo registro, `category: "instrument"` + atributos musicais |
| Apresentações | `/gestao/apresentacoes` | `presentations` | `isPublic` define o que entra na agenda do portal |
| Blog e mídias | `/gestao/midias` | `media` | Conteúdo do portal (artigos, fotos, vídeos) |

Instrumento **é** patrimônio: não há coleção separada. A listagem de instrumentos filtra `category === "instrument"` e lê `instrument.family`, afinação, número de série, fabricante e modelo.

### Como adicionar um domínio novo

1. Criar tipos em `src/domains/<nome>/`.
2. Registrar o módulo em `src/domains/catalog.ts` (rótulo, ícone, rota, recurso da API).
3. Declarar ações por perfil em `src/core/auth/permissions.ts`.
4. Incluir a coleção no `db.json` (e, se fizer sentido, em `src/domains/seed/mock-api.json`).
5. Criar a rota em `src/app/gestao/<nome>/page.tsx`.

O menu e o painel passam a considerar o módulo automaticamente quando a permissão de leitura existir.

## Identidade visual

Cores, tipografia, raios e superfícies (header, sidebar, cartões) ficam em um único arquivo:

```text
src/core/theme/tokens.css
```

O restante do app deve usar essas variáveis (`--color-brand`, `--color-ink`, `--font-sans`, `--radius`, etc.). Paleta de referência: ciano `#00c2ce` e navy `#0b1c2c`, no espírito do site do Drone CI.

Logo e fotos institucionais estão em `public/assets/logo.png` e `public/imgs/`.

Tema claro/escuro: `src/contexts/ThemeContext.tsx` e a página `/settings`.

## Estrutura do projeto

```text
.
├── db.json                      # dados da API mock
├── public/                      # logo, imagens, partituras MusicXML
└── src/
    ├── app/                     # rotas do portal, login, gestão e estudo
    ├── components/              # UI compartilhada e DomainWorkspace
    ├── contexts/                # autenticação e tema
    ├── core/
    │   ├── auth/                # papéis, permissões, máscara, usuários demo
    │   ├── navigation/          # menus público e interno
    │   └── theme/               # tokens visuais globais
    ├── domains/                 # entidades e catálogo de módulos
    │   └── seed/mock-api.json   # seed dos novos recursos
    ├── hooks/                   # CRUD genérico
    ├── layouts/                 # PublicShell, AppShell, RootShell
    ├── lib/                     # cliente HTTP
    ├── study/StudyPage.tsx       # tela da sessão de estudo (client-only)
    └── study/                   # player de partituras
```

`RootShell` escolhe o layout: visitante usa o header público; usuário autenticado usa a barra lateral filtrada pelo perfil.

## Rotas

### Portal (sem login)

- `/` — início institucional
- `/agenda` — apresentações com `isPublic: true`
- `/blog` e `/blog/[slug]` — mídias publicadas
- `/sobre` — texto institucional
- `/login` — autenticação simulada

### Área interna (com login)

- `/gestao` — painel com os módulos permitidos
- `/gestao/usuarios`
- `/gestao/pessoas`
- `/gestao/musicas`
- `/gestao/patrimonio`
- `/gestao/instrumentos`
- `/gestao/apresentacoes`
- `/gestao/midias`
- `/profile` — dados da sessão
- `/settings` — tema e preferências

### Estudo e treinamento

- `/study` — músicas com partitura, preparação dos instrumentos e sessão com partitura e MIDI

## API mock

`db.json` alimenta o `json-server`. Recursos atuais:

| Recurso | Métodos | Uso |
| --- | --- | --- |
| `/users` | GET, POST, PUT, DELETE | Contas e papéis |
| `/people` | GET, POST, PUT, DELETE | Alunos e músicos |
| `/songs` | GET, POST, PUT, DELETE | Repertório e XML |
| `/patrimony` | GET, POST, PUT, DELETE | Patrimônio e instrumentos |
| `/presentations` | GET, POST, PUT, DELETE | Agenda |
| `/media` | GET, POST, PUT, DELETE | Blog |

O seed dos recursos novos está em `src/domains/seed/mock-api.json`.

Nos `POST`s, o frontend não envia `id`: a API é responsável por atribuí-lo.

## Fluxos

### Visitante

Abre o portal, navega pelo menu superior e entra em `/login` quando quiser acessar a gestão.

### Sessão

O login não chama backend real. As contas demo estão em `src/core/auth/demoUsers.ts`. Com “Manter conectado”, a sessão fica em `localStorage`.

### Gestão

`/gestao` lista apenas o que a união dos perfis pode ler. Cada página de domínio permite visualizar, criar, editar e excluir conforme as permissões, com máscara de dados quando aplicável.

### Estudo de partituras

O módulo `/study` lista as músicas que possuem MusicXML. Antes de iniciar, o usuário escolhe separadamente os instrumentos visíveis na partitura e os instrumentos reproduzidos pelo MIDI. A sessão oferece player, andamento, volume, metrônomo e loop.

## Observações

- O fluxo oficial usa o App Router. A rota `/study` carrega sua interface client-side porque o renderizador de partituras depende do navegador.

## Lint

```bash
npm run lint
```

## Próximos passos

- Substituir IDs digitados manualmente por seletores de pessoas, instrumentos e músicas.
- Persistir sessões, progresso e histórico de treinamento por aluno ou músico.
- Polir a UI em cima dos tokens globais.
- Trocar o `json-server` por API real quando o backend existir.
