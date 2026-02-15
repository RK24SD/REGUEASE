# Design Specification – ReguEase


## 1. High-Level System Architecture
[Users: Founders / Startups]
│
▼ (HTTPS / Web + Mobile PWA)
[Edge / CDN] ───────────────┐
│
[API Gateway + Auth] ───────┤
│
[Backend Services] ─────────┤
│  - Onboarding & Personalization
│  - Document Automation
│  - Compliance Rules Engine
│  - Notification & Calendar
│  - Fraud Detection
│  - Expert Marketplace
└────────────────────────────┘
│
├──────────────► [AI Layer]
│                   │
│                   ├─ LLM Service (OpenAI / Grok / Claude)
│                   ├─ Retrieval-Augmented Generation (RAG)
│                   ├─ Vector Store (policy & law embeddings)
│                   └─ ML Models (fraud / risk scoring)
│
▼
[Integrations] ─────────────┐
│  - MCA21 API
│  - GSTN
│  - Startup India / DPIIT
│  - DigiLocker / Aadhaar eKYC
│  - Razorpay
│  - Twilio / SendGrid
└────────────────────────────┘
│
[Data Layer] ───────────────┐
│  - PostgreSQL (core + compliance state)
│  - S3 / GCS (documents – encrypted)
│  - Redis (cache + queues)
│  - Elasticsearch / OpenSearch (search)
│  - Vector DB (Pinecone / pgvector)
└────────────────────────────┘
text**Deployment Target**: AWS Mumbai or GCP Mumbai region (data residency compliance)

## 2. Technology Stack (Finalized for MVP)

- **Frontend**: Next.js 15 (App Router) + React Server Components + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + NestJS (TypeScript) OR Python + FastAPI (strong preference for Python if heavy AI usage)
- **Database**: PostgreSQL 16 (Supabase / Neon / AWS RDS)
- **AI**: OpenAI API (GPT-4o / o1-preview) + LangChain.js / LangChain Python + pgvector / Pinecone
- **Auth**: NextAuth.js / Lucia Auth + JWT + OAuth2 (DigiLocker support)
- **Payments**: Razorpay
- **Queue / Background**: BullMQ (Redis) or Celery (if Python)
- **Search**: Elasticsearch or Typesense
- **Hosting**:
  - Frontend: Vercel
  - Backend: Railway / Render / Fly.io / AWS ECS
- **Monitoring**: Sentry + Logtail / Datadog lite

## 3. Core Data Model (Simplified ERD Description)
User
├── id (PK)
├── email
├── phone
├── name
├── aadhaar_hash (optional, masked)
├── company_id (FK)
├── subscription_tier (free/basic/pro)
└── created_at
Company
├── id (PK)
├── user_id (FK)
├── legal_name
├── cin (after registration)
├── gstin (after registration)
├── incorporation_date
├── status (draft / submitted / approved / rejected)
└── compliance_score (0–100)
ComplianceTask
├── id (PK)
├── company_id (FK)
├── type (gst_return / roc_annual / pf_contribution / etc.)
├── due_date
├── status (pending / completed / overdue)
├── reminder_sent (boolean[])
Document
├── id (PK)
├── company_id (FK)
├── type (pan / aadhaar / moa / invoice / etc.)
├── s3_key
├── hash (sha256)
├── verified (boolean)
├── uploaded_at
PolicyDocument
├── id (PK)
├── title
├── source_url
├── category (labor / tax / corporate / environment)
├── embedding_vector
└── last_updated
text## 4. Key User Flows (MVP)

1. **Sign Up & Onboarding** (2–3 min)
   - Email/Phone → OTP → Basic profile
   - Quiz: sector, location, expected team size, business model
   - AI → Generate personalized roadmap (JSON + visual timeline)

2. **Company Registration Path**
   - Select entity type → Auto-check name availability (MCA mock)
   - Upload PAN/Aadhaar → eKYC via DigiLocker
   - AI auto-fills SPICe+ → Preview → eSign → Submit to MCA
   - Track status via webhook/polling

3. **DPIIT Recognition**
   - Auto-check eligibility → Fill form → Submit → Track

4. **Ask Policy Question**
   - Chat interface → RAG → LLM response + sources

5. **Compliance Dashboard**
   - Calendar view + list of upcoming tasks
   - One-click form pre-fill & reminder setup

## 5. UI/UX Design Principles

- **Mobile-first** (80%+ users likely on mobile)
- **Minimalist & Trustworthy**: Clean whites/blues, government-inspired accents (saffron/green)
- **Progressive disclosure**: Hide complexity until needed
- **Plain language everywhere**: No legalese in UI copy
- **Visual feedback**: Progress bars, success animations, red flags for risks
- **Accessibility**: WCAG 2.1 AA (contrast, keyboard nav, screen reader)
- **Dark mode** support (optional but nice)
- **Hindi toggle** (next-intl ready)

## 6. Security & Compliance Design

- **Data classification**:
  - Level 1: Public (roadmaps, guides)
  - Level 2: Personal (email, phone)
  - Level 3: Sensitive PII (Aadhaar/PAN – masked, never stored in plain)
  - Level 4: Legal docs (encrypted at rest + transit)
- **Authentication flows**: Passwordless OTP preferred
- **Authorization**: Role-based (user, admin); Row-level security in DB
- **Audit logging**: All form submissions, AI queries, document uploads
- **Rate limiting**: Per user & IP
- **Secret management**: Environment variables + AWS Secrets Manager

## 7. Non-Functional Design Goals (MVP)

- Latency: AI answers < 6s, page loads < 2s
- Availability: 99.5%
- Cost: < ₹15,000/month at 1,000 active users
- Data residency: All data in India region
- Error handling: Graceful degradation (offline queue for reminders)

## 8. Future Considerations (Post-MVP)

- Voice input/output for tier-2/3 users
- Multi-company support per user
- White-label for incubators
- Advanced analytics (industry benchmarks)
- Integration with accounting tools (ClearTax, Tally)
