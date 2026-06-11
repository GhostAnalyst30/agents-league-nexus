# Nexus AI — Human Evolution Operating System

> Don't ask AI for answers. Build your future with an AI that grows with you.

**Nexus AI** is not a chatbot. It is a **Human Evolution Operating System** — a network of specialized reasoning agents that continuously learn who you are, what you want, and how to help you grow.

Unlike traditional AI assistants that answer questions and forget context, Nexus continuously builds and updates a **Living Human Model** — your **Digital Self** — that evolves with every action you take.

---

## The Vision

Nexus transforms how people interact with AI. Instead of asking a chatbot for answers, you engage with a system that:

1. **Understands** you through persistent memory and goal detection
2. **Analyzes** your skills, gaps, and opportunities
3. **Plans** personalized roadmaps for your goals
4. **Matches** you with relevant events, hackathons, and scholarships
5. **Simulates** future scenarios to compare different paths
6. **Evolves** your Digital Self in real time

---

## Architecture

### Agent Ecosystem

Six specialized reasoning agents work in orchestration:

| Agent | Purpose |
|---|---|
| **Goal Analysis Agent** | Detects goals, intentions, motivations, and ambitions |
| **Skill Gap Agent** | Analyzes current skills vs. desired goals |
| **Learning Path Agent** | Creates personalized roadmaps with milestones |
| **Opportunity Matching Agent** | Matches users with events, hackathons, scholarships |
| **Profile Evolution Agent** | Tracks growth and updates the Digital Self |
| **Future Simulation Agent** | Simulates scenarios and estimates success probability |

### Digital Self System

Three evolving avatars represent your growth:

- **Knowledge Self** — Learning, skills, education
- **Career Self** — Projects, professional growth, experience
- **Opportunity Self** — Networking, events, community participation

Every action inside Nexus updates these avatars in real time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| **Database** | SQLite via Prisma ORM (swap to Supabase Postgres anytime) |
| **Auth** | NextAuth.js v5 (credentials, GitHub, Google ready) |
| **AI** | OpenRouter API with free models (Mistral, Llama, Gemma, Phi) |
| **Agent System** | Custom orchestrator with 6 specialized reasoning agents |
| **Styling** | Dark mode, responsive, animations, nexus-gradient design system |

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url> nexus-ai
cd nexus-ai
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
OPENROUTER_API_KEY="sk-or-v1-your-key-here"
```

### 3. Set up the database

```bash
npx prisma migrate dev --name init
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and begin your evolution.

---

## Project Structure

```
nexus-ai/
├── prisma/                    # Database schema & migrations
│   └── schema.prisma
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── auth/              # Login & Register
│   │   ├── dashboard/         # All dashboard modules
│   │   │   ├── page.tsx       # Home with overview
│   │   │   ├── nexus-ai/      # Multi-agent chat
│   │   │   ├── roadmap/       # Learning roadmaps
│   │   │   ├── connections/   # Opportunity matching
│   │   │   └── my-nexus/      # Digital Self dashboard
│   │   └── api/               # API routes
│   ├── lib/
│   │   ├── agents/            # Reasoning agent system
│   │   │   ├── orchestrator.ts
│   │   │   ├── goal-analysis.ts
│   │   │   ├── skill-gap.ts
│   │   │   ├── learning-path.ts
│   │   │   ├── opportunity-matching.ts
│   │   │   ├── profile-evolution.ts
│   │   │   └── future-simulation.ts
│   │   ├── openrouter.ts      # OpenRouter client
│   │   ├── auth.ts            # NextAuth configuration
│   │   └── prisma.ts          # Database client
│   ├── types/
│   └── components/
```

---

# Futures Features

Implement Agents with Microsoft Foundry