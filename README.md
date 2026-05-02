# Unified AI Workspace 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Unified AI Workspace** is a high-performance, full-stack application designed to be the ultimate hub for knowledge management and AI-driven productivity. It seamlessly integrates advanced note-taking, task management, and autonomous AI agents into a single, cohesive ecosystem.

---

## 📖 Description

Unified AI Workspace solves the problem of fragmented workflows by combining knowledge management (Notes) and action management (Todos) with a powerful AI engine. It leverages the latest in Large Language Models (LLMs) and the Model Context Protocol (MCP) to provide an "alive" workspace that understands and assists you in real-time.

### Key Features
- **🤖 Autonomous AI Agents:** Deploy specialized agents (Note Analyzer, Task Manager, Research Assistant, Code Helper) in a secure sandbox to automate your workflows.
- **🧠 Intelligent Knowledge Management:** Advanced Markdown note-taking with RAG (Retrieval-Augmented Generation) capabilities to retrieve and synthesize information from your own data.
- **🔗 Model Context Protocol (MCP):** Dynamic context sharing that allows AI agents to deeply understand your workspace, notes, and tasks.
- **⚡ Unified AI Hub:** A central chat interface supporting multiple providers including OpenAI, Google Gemini, Anthropic, and more.
- **📊 AI Observability:** Integrated with Opik for real-time tracking, tracing, and performance analysis of your AI interactions.
- **💼 Comprehensive Productivity Suite:** A unified dashboard, task manager with priority levels, and a beautiful, responsive UI with full Dark Mode support.

---

## 📚 Table of Contents
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Tech Stack](#-tech-stack)
- [Configuration](#-configuration)
- [AI Agents & MCP](#-ai-agents--mcp)
- [Development](#-development)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🛠 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [pnpm](https://pnpm.io/) (v8.0.0 or higher) - Recommended
- [Git](https://git-scm.com/)
- A database (SQLite is used by default for development)

---

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/billlzzz10/unified-ai-workspace.git
   cd unified-ai-workspace
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Environment Setup:**
   Copy the example environment file and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

4. **Initialize Database:**
   Generate the Prisma client and push the schema to your local database:
   ```bash
   pnpm run setup
   ```

---

## ⚡ Quick Start

Start the development server:
```bash
pnpm run dev
```
Open your browser and navigate to `http://localhost:5173`. You are now ready to start managing your knowledge with AI!

---

## 💻 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS
- **UI Components:** Radix UI (shadcn/ui), Lucide React
- **Database:** Prisma ORM (SQLite for dev, PostgreSQL compatible)
- **AI Integration:** Vercel AI SDK, Google Generative AI, OpenAI SDK
- **Observability:** Opik SDK
- **Authentication:** NextAuth.js (Internal integration)

---

## ⚙️ Configuration

The project is configured via environment variables in the `.env` file. Key sections include:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Prisma database connection string |
| `NEXTAUTH_SECRET` | Secret key for session encryption |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `GOOGLE_AI_API_KEY` | Your Gemini API key |
| `OPIK_API_KEY` | For AI observability tracing |
| `AGENT_SANDBOX_URL` | URL for the autonomous agent sandbox |

Refer to `.env.example` for a complete list of all supported providers and options.

---

## 🤖 AI Agents & MCP

Unified AI Workspace isn't just a chat tool—it's an agentic ecosystem.

### AI Agents
You can create and manage autonomous agents from the **Agent Control Panel**. These agents can:
- Analyze your existing notes for insights.
- Automatically organize and prioritize your tasks.
- Perform research and code reviews in a secure, isolated sandbox.

### Model Context Protocol (MCP)
The integrated MCP Client (`src/lib/ai/mcp/mcpClient.js`) ensures that your AI assistants have the context they need. It automatically shares relevant workspace state, notes, and task data with the AI, leading to more accurate and personalized assistance.

---

## 🛠 Development

### Available Scripts
- `pnpm run dev`: Start development server.
- `pnpm run build`: Build for production.
- `pnpm run preview`: Preview production build.
- `pnpm run lint`: Run ESLint checks.
- `pnpm run db:studio`: Open Prisma Studio GUI.
- `pnpm run setup`: Re-initialize database and generate client.

### Testing
While unit tests are being implemented, you can verify your changes by running:
```bash
pnpm run lint
```
Always ensure your code adheres to the project's styling guidelines before submitting a pull request.

---

## 🗺 Roadmap
- [ ] **Knowledge Graph:** Visual representation of node connections.
- [ ] **Advanced Semantic Search:** Vector-based search across all documents.
- [ ] **Multi-Agent Collaboration:** Enabling agents to communicate with each other.
- [ ] **Mobile App:** Dedicated React Native / Flutter client.
- [ ] **Offline Mode:** Local-first synchronization.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👥 Authors & Acknowledgments

- **billlzzz10** - *Initial Work & Architecture*
- Special thanks to the creators of `UnicornXOSW2.1.0`, `NoteWeave`, and `Obsidian_Synapse_Core` for the inspiration and foundational concepts.

---

## 📞 Support & Contact

- **Issue Tracker:** [GitHub Issues](https://github.com/billlzzz10/unified-ai-workspace/issues)
- **Email:** support@example.com (Placeholder)
- **Discord:** [Join our Community](https://discord.gg/your-link) (Placeholder)

---
<p align="center">Made with ❤️ for the AI Community</p>
