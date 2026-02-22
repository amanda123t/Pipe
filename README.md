# Pipe - Plataforma de Gestão de Workflows

Uma plataforma completa de automação de processos e gestão de workflows, similar ao Pipefy.

## Funcionalidades

- **Pipes (Processos)** - Crie pipelines de trabalho customizados
- **Kanban Board** - Visualize e gerencie cards com drag-and-drop
- **Campos Personalizados** - Adicione campos de diversos tipos a cada pipe
- **Cards Detalhados** - Gerencie tarefas com descrição, prioridade, prazo e comentários
- **Autenticação** - Login e registro de usuários
- **Organizações** - Gerencie múltiplas organizações
- **Automações** - Configure regras automáticas para seus processos

## Tecnologias

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **UI Components**: Radix UI + lucide-react
- **Drag and Drop**: @dnd-kit
- **Backend**: Next.js API Routes
- **Banco de dados**: Prisma + SQLite (dev) / PostgreSQL (prod)
- **Autenticação**: NextAuth.js

## Como rodar

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Criar banco de dados
npx prisma db push

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## Estrutura

```
src/
├── app/
│   ├── (auth)/          # Páginas de login/registro
│   ├── (app)/           # Páginas autenticadas
│   │   ├── dashboard/   # Dashboard principal
│   │   └── pipes/       # Kanban e configurações
│   └── api/             # API Routes
├── components/
│   ├── ui/              # Componentes base
│   ├── layout/          # Sidebar, header
│   ├── pipes/           # Kanban board, colunas, cards
│   ├── cards/           # Modal de detalhes
│   └── dashboard/       # Componentes do dashboard
├── lib/                 # Utilitários (prisma, auth, utils)
└── types/               # TypeScript types
```
