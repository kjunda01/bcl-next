<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agentes — Banda Carmelitana (`front-next`)

Frontend Next.js 16 / React 19 da Banda Carmelitana Luminarense: portal público, gestão interna e modo de estudo. Idioma da interface: **pt-BR**.

Leia este arquivo antes de alterar código. Complementos: `README.md` e `docs/arquitetura-backend.md`.

## Produto

- Visitante: Início, Agenda, Blog, Sobre. Sem login.
- Após login: `/gestao` e módulos permitidos pelo perfil.
- `/study`: treino com partitura (OSMD) e MIDI. Só músicas com MusicXML. Modal escolhe instrumentos **visíveis** e instrumentos **do áudio**, de forma independente.

Perfis autenticados: `aluno`, `musico`, `maestro`, `admin`. Conta tem `roles[]`. **Permissões = união** dos perfis (o mais permissivo vence). Maestro não atribui `admin`. Aluno/músico veem dados pessoais mascarados; maestro/admin não.

## Onde o código vive

Fluxo oficial: **App Router** (`src/app/**`).

| Pasta | Uso |
| --- | --- |
| `src/app/` | Rotas |
| `src/domains/` | Entidades, catálogo, CRUD config, seed |
| `src/core/auth/` | Papéis, permissões, máscara |
| `src/core/theme/tokens.css` | Cores, tipo, raios — não espalhar hex solto |
| `src/components/domain/` | Workspace genérico de gestão |
| `src/study/` (incl. `StudyPage.tsx`) | Sessão de estudo (client-only; OSMD/player usam `window`) |
| `src/lib/api.ts` | HTTP da API (`NEXT_PUBLIC_API_URL`, fallback `http://localhost:3001`) |

Não recriar `/students`, `src/legacy-pages` nem CRUD paralelo. IDs de registro: **só a API** (não `crypto.randomUUID()` no POST).

Novo domínio: tipos em `src/domains/<nome>/` → `catalog.ts` → `permissions.ts` → `crudConfig.ts` → rota em `src/app/gestao/` → seed em `db.json`.

## Boas práticas (obrigatório)

- TypeScript estrito: sem `any` novo; tipos de domínio explícitos.
- Client vs server: `'use client'` só quando houver estado, eventos ou APIs de browser. Não hidratar sessão do `localStorage` no SSR (usar o padrão já em `AuthContext`).
- Permissões no **cliente e, no futuro, no servidor**. UI que esconde botão não é segurança.
- Formulários: validar no cliente; telefone com máscara; menor de idade exige responsável; e-mail/documento únicos onde já existir regra.
- Acessibilidade: `label`, `aria-*` em diálogos, foco e teclado. Ícones Material com `aria-label` quando não houver texto.
- Performance: listas virtuais só se necessário; imagens com `next/image`; MusicXML/MIDI grandes não devem ser convertidos de novo no React quando o backend existir (ver arquitetura).
- Não commitar segredos. Não versionar XML/MIDI de produção em `public/` como fonte da verdade.
- Não expandir escopo: sem microserviços, BFF extra ou segundo CRUD “só para estudo”.
- Lint/tipos nos arquivos tocados. O ESLint global ainda pode falhar em código antigo do player — não “consertar o mundo” sem pedido.
- Na dúvida de produto: perguntar.

## Celular e uso real (obrigatório)

Alunos e músicos treinam **no telefone**, muitas vezes em 4G, tela estreita e uma mão.

Toda UI nova ou alterada deve funcionar em viewport ~360px **e** desktop (~960px+, breakpoint do `AppShell`). Estudo usa ~600px para tela cheia móvel.

Checklist:

1. **Toque:** alvos ≥ 44px; não depender de hover. Botões de play/pausa/estudo usáveis com o polegar.
2. **Layout:** tabela de gestão/estudo com scroll horizontal se preciso; em mobile, preferir cartão ou ações no final da linha, não oito colunas apertadas.
3. **Modais:** caber na viewport (`max-h` + scroll interno); teclado virtual não esconder Salvar/Continuar.
4. **Rede:** não baixar partitura completa de 16 naipes duas vezes sem necessidade; estados de loading/erro visíveis; falha de API mock não quebrar a página.
5. **Estudo:** partitura rolável; player fixo ou acessível sem cobrir o XML inteiro; fullscreen no móvel já existente deve continuar usável; pause ao trocar de aba.
6. **Gestos:** evitar `position: fixed` que brigue com a barra de endereço do iOS sem `dvh` / safe-area.
7. **Verificar** o fluxo no browser em desktop **e** largura mobile antes de encerrar tarefa de UI (não só screenshot).

Não assumir mouse, tela larga ou Wi-Fi estável.

## API e backend (ainda mock)

Hoje: `json-server` + `db.json`. Contrato a preservar: `roles[]`, IDs no servidor, `songs.scores[].url`.

Alvo (não implementar sozinho): um monólito (Python ou Java) + PostgreSQL + bucket S3/MinIO; MIDI gerado em worker/job, não no request de CRUD e não no celular. Detalhe em `docs/arquitetura-backend.md`.

## Como rodar

Dois processos: `npm run api:server` (3001) e `npm run dev` (3000). Contas demo no README.

## O que não fazer

- Gerar `id` no POST do front.
- Um único `role` por usuário.
- Restaurar legado de alunos.
- OSMD/player em Server Component.
- MIDI síncrono pesado no clique “Iniciar estudo” quando existir worker.
- Ignorar mobile porque “a gestão é de desktop”.
