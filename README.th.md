# Unified AI Workspace 🚀 (ภาษาไทย)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Unified AI Workspace** คือแพลตฟอร์ม Full-stack ที่ออกแบบมาเพื่อเป็นศูนย์กลางการจัดการความรู้ (Knowledge Management) และการทำงาน (Productivity) โดยใช้ขุมพลังจาก AI ขั้นสูง โปรเจกต์นี้รวมการจดบันทึก การจัดการงาน และระบบ AI Agent อัตโนมัติไว้ในที่เดียว เพื่อสร้างสภาพแวดล้อมการทำงานที่ชาญฉลาดและเชื่อมโยงถึงกัน

---

## 📖 คำอธิบายโปรเจกต์

Unified AI Workspace แก้ปัญหาการทำงานที่กระจัดกระจาย โดยการรวม "คลังความรู้" (Notes) และ "การลงมือทำ" (Todos) เข้ากับระบบ AI ที่เข้าใจบริบทของคุณ แอปพลิเคชันนี้ใช้เทคโนโลยีล่าสุดอย่าง Model Context Protocol (MCP) เพื่อให้ AI ไม่ใช่แค่แชทบอทธรรมดา แต่เป็นผู้ช่วยที่เข้าใจข้อมูลทั้งหมดใน Workspace ของคุณจริงๆ

### ฟีเจอร์หลัก
- **🤖 Autonomous AI Agents:** สร้างและรัน Agent เฉพาะทาง (เช่น นักวิเคราะห์บันทึก, ผู้จัดการงาน, ผู้ช่วยวิจัย) ในระบบ Sandbox ที่ปลอดภัยเพื่อทำงานแทนคุณอัตโนมัติ
- **🧠 ระบบจัดการความรู้ชาญฉลาด:** จดบันทึกด้วย Markdown พร้อมระบบ RAG (Retrieval-Augmented Generation) ที่ช่วยให้ AI สามารถค้นหาและดึงข้อมูลจากบันทึกเก่าๆ ของคุณมาตอบคำถามได้
- **🔗 Model Context Protocol (MCP):** ระบบแชร์บริบทอัจฉริยะที่ช่วยให้ AI เข้าใจโครงสร้างงาน บันทึก และสถานะปัจจุบันของคุณอย่างลึกซึ้ง
- **⚡ ศูนย์รวม AI (Multi-Provider):** รองรับ AI หลากหลายค่าย ทั้ง OpenAI, Google Gemini, Anthropic และอื่นๆ โดยจัดการผ่านหน้าจอเดียว
- **📊 AI Observability:** เชื่อมต่อกับ Opik เพื่อติดตาม วิเคราะห์ และตรวจสอบการทำงานของ AI แบบ Real-time
- **💼 ชุดเครื่องมือเพิ่มประสิทธิภาพ:** Dashboard สรุปภาพรวม, ระบบจัดการ Task ตามลำดับความสำคัญ และ UI ที่สวยงามรองรับ Dark Mode เต็มรูปแบบ

---

## 📚 สารบัญ
- [สิ่งที่ต้องมีก่อนติดตั้ง](#-สิ่งที่ต้องมีก่อนติดตั้ง)
- [การติดตั้ง](#-การติดตั้ง)
- [การเริ่มต้นใช้งานด่วน](#-การเริ่มต้นใช้งานด่วน)
- [เทคโนโลยีที่ใช้](#-เทคโนโลยีที่ใช้)
- [การตั้งค่าคอนฟิก](#-การตั้งค่าคอนฟิก)
- [AI Agents & MCP](#-ai-agents--mcp)
- [การพัฒนาต่อยอด](#-การพัฒนาต่อยอด)
- [แผนการพัฒนาในอนาคต](#-แผนการพัฒนาในอนาคต)
- [การมีส่วนร่วม](#-การมีส่วนร่วม)
- [สัญญาอนุญาต](#-สัญญาอนุญาต)

---

## 🛠 สิ่งที่ต้องมีก่อนติดตั้ง

ตรวจสอบให้แน่ใจว่าเครื่องของคุณมีสิ่งต่อไปนี้:
- [Node.js](https://nodejs.org/) (เวอร์ชัน 18.0.0 ขึ้นไป)
- [pnpm](https://pnpm.io/) (เวอร์ชัน 8.0.0 ขึ้นไป) - แนะนำ
- [Git](https://git-scm.com/)
- ฐานข้อมูล (เริ่มต้นใช้ SQLite ที่มากับตัวโปรเจกต์ได้ทันที)

---

## 🚀 การติดตั้ง

1. **Clone repository นี้:**
   ```bash
   git clone https://github.com/billlzzz10/unified-ai-workspace.git
   cd unified-ai-workspace
   ```

2. **ติดตั้ง Dependencies:**
   ```bash
   pnpm install
   ```

3. **ตั้งค่า Environment:**
   คัดลอกไฟล์ตัวอย่างและกรอก API Keys ของคุณ:
   ```bash
   cp .env.example .env
   ```

4. **เตรียมฐานข้อมูล:**
   สร้าง Prisma client และตั้งค่าโครงสร้างฐานข้อมูลเริ่มต้น:
   ```bash
   pnpm run setup
   ```

---

## ⚡ การเริ่มต้นใช้งานด่วน

รันแอปพลิเคชันในโหมดพัฒนา:
```bash
pnpm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:5173` คุณก็พร้อมเริ่มจัดการความรู้ด้วยพลัง AI แล้ว!

---

## 💻 เทคโนโลยีที่ใช้

- **Frontend:** React 19, Vite, Tailwind CSS
- **UI Components:** Radix UI (shadcn/ui), Lucide React
- **Database:** Prisma ORM (SQLite สำหรับพัฒา, รองรับ PostgreSQL สำหรับใช้งานจริง)
- **AI Integration:** Vercel AI SDK, Google Generative AI, OpenAI SDK
- **Observability:** Opik SDK
- **Authentication:** NextAuth.js (ผสานรวมในตัว)

---

## ⚙️ การตั้งค่าคอนฟิก

โปรเจกต์จัดการผ่านไฟล์ `.env` โดยมีส่วนสำคัญดังนี้:

| ตัวแปร | คำอธิบาย |
|----------|-------------|
| `DATABASE_URL` | ลิงก์เชื่อมต่อฐานข้อมูล Prisma |
| `NEXTAUTH_SECRET` | คีย์สำหรับเข้ารหัส Session ของผู้ใช้ |
| `OPENAI_API_KEY` | API key ของ OpenAI |
| `GOOGLE_AI_API_KEY` | API key ของ Gemini |
| `OPIK_API_KEY` | สำหรับการติดตามการทำงานของ AI (Tracing) |
| `AGENT_SANDBOX_URL` | URL สำหรับรัน Agent Sandbox |

---

## 🤖 AI Agents & MCP

Unified AI Workspace ไม่ใช่แค่เครื่องมือแชท แต่เป็นระบบนิเวศของ Agent

### AI Agents
คุณสามารถสร้างและจัดการ Agent อัตโนมัติได้จากหน้า **Agent Control Panel** โดย Agent สามารถ:
- วิเคราะห์บันทึกทั้งหมดเพื่อหาความเชื่อมโยง
- จัดลำดับความสำคัญของงาน (Task) โดยอัตโนมัติ
- ช่วยเขียนโค้ดหรือวิจัยข้อมูลในสภาพแวดล้อม Sandbox ที่ปลอดภัย

### Model Context Protocol (MCP)
ระบบ MCP Client (`src/lib/ai/mcp/mcpClient.js`) ทำหน้าที่ส่งข้อมูลบริบทที่จำเป็น (Context) ให้กับ AI โดยอัตโนมัติ ทำให้ AI เข้าใจความต้องการของคุณโดยที่คุณไม่ต้องอธิบายซ้ำซ้อน

---

## 🛠 การพัฒนาต่อยอด

### คำสั่งที่สำคัญ
- `pnpm run dev`: เริ่มเซิร์ฟเวอร์สำหรับพัฒนา
- `pnpm run build`: สร้างไฟล์สำหรับ Production
- `pnpm run lint`: ตรวจสอบความถูกต้องของโค้ด
- `pnpm run db:studio`: เปิดหน้าต่างจัดการฐานข้อมูลแบบ GUI
- `pnpm run setup`: รีเซ็ตฐานข้อมูลและ Generate client ใหม่

---

## 🗺 แผนการพัฒนาในอนาคต
- [ ] **Knowledge Graph:** แผนภาพแสดงความเชื่อมโยงของข้อมูลแบบใยแมงมุม
- [ ] **Advanced Semantic Search:** ระบบค้นหาด้วยความหมาย (Vector Search)
- [ ] **Multi-Agent Collaboration:** ระบบที่ Agent สามารถคุยและทำงานร่วมกันเองได้
- [ ] **Mobile App:** แอปพลิเคชันบนมือถือ (React Native / Flutter)
- [ ] **Offline Mode:** ทำงานได้แม้ไม่มีอินเทอร์เน็ต

---

## 🤝 การมีส่วนร่วม

เรายินดีรับการสนับสนุนจากทุกคน!
1. Fork โปรเจกต์นี้
2. สร้าง Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง Branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

---

## 📄 สัญญาอนุญาต

เผยแพร่ภายใต้ MIT License ดูข้อมูลเพิ่มเติมได้ที่ไฟล์ `LICENSE`

---

## 👥 ผู้จัดทำและกิตติกรรมประกาศ

- **billlzzz10** - *ผู้พัฒนาหลักและผู้ออกแบบโครงสร้าง*
- ขอขอบคุณแนวคิดหลักจากโปรเจกต์ `UnicornXOSW2.1.0`, `NoteWeave`, และ `Obsidian_Synapse_Core`

---

## 📞 ช่องทางการติดต่อ

- **แจ้งปัญหา (Issues):** [GitHub Issues](https://github.com/billlzzz10/unified-ai-workspace/issues)
- **Email:** support@example.com
- **Discord:** [เข้าร่วมชุมชนของเรา](https://discord.gg/your-link)

---
<p align="center">สร้างด้วย ❤️ เพื่อชุมชน AI</p>
