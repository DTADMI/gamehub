# Intima - Pure Sexual Health Tracker (Original Vision)

> **⚠️ HIGH-RISK PROJECT** | Success Probability: 10-15% | TAM: 15-25M users | Funding Need: $600K-1M | Timeline: 18-24 months to break-even

## Executive Summary

**Intima** is a focused sexual health tracking platform for STI testing, symptom tracking, and anonymous partner notifications. Unlike competitors (Hims, Nurx) that focus on prescriptions/telehealth, Intima is the **only comprehensive tracking + partner communication tool**.

**Why This is Hard**: HIPAA compliance ($150K-300K), stigma, limited TAM, payment processor friction, strong competition (Hims $2B valuation).

**Recommendation**: Only build if you have healthcare connections, $600K+ funding, 18+ months runway, AND personal passion for sexual health. Otherwise, pivot to **Cyclix Wellness** (10x TAM) or **HealthHub Clinical** (B2B-first, faster revenue).

---

## Market Analysis

### Target Audience

- **Primary**: Ages 18-35, sexually active (3+ partners/year)
- **Secondary**: LGBTQ+ communities, college students
- **TAM**: 15-25M in North America
- **Serviceable Market**: 5-8M (urban, tech-savvy, privacy-conscious)

### Competitors

| Competitor  | Focus               | Weakness             | Intima Advantage                        |
| ----------- | ------------------- | -------------------- | --------------------------------------- |
| Hims & Hers | Prescriptions       | No tracking          | Comprehensive tracking + partner alerts |
| Nurx        | PrEP, birth control | No symptom tracking  | Full health journal                     |
| PP Direct   | Services only       | No personal tracking | Personal data ownership                 |

### Market Opportunity

- **STI rates rising**: 2.5M cases in 2023 (CDC), 20% YoY growth
- **Testing gaps**: Only 30% of sexually active adults test annually (CDC recommends 3-6 months for high-risk)
- **Partner notification**: 60% don't notify partners after positive result (stigma, awkwardness)

---

## Core Features (MVP)

### 1. STI Test Tracking

- **Appointment scheduling** (integrate Google Calendar, Apple Calendar)
- **Result storage** (encrypted, exportable PDF)
- **Lab integration** (Quest Diagnostics, LabCorp APIs for auto-import)
- **Testing reminders** (based on CDC guidelines: 3-6 months)

### 2. Symptom Journal

- **Body map** (tap to mark symptom location)
- **Severity scoring** (1-10 scale)
- **Timeline correlation** (link symptoms to sexual activity dates)
- **Doctor reports** (export comprehensive PDF)

### 3. Anonymous Partner Notifications ⭐

- **One-time codes** (send via SMS, email, or link)
- **Zero personal info** (receiver sees "You may have been exposed to [STI]")
- **Testing resources** (local clinics, at-home kits)
- **Expiring links** (24-hour default, customizable)

### 4. Privacy & Security

- **Zero-knowledge encryption** (server cannot decrypt)
- **Biometric lock** (Face ID, Touch ID, PIN)
- **Self-destruct** (wipe all data with panic password)
- **Incognito mode** (hide app icon, show as "Calendar")

---

## Technology Stack

**Frontend**: Flutter (iOS/Android single codebase)
**Backend**: Node.js + TypeScript, GraphQL
**Database**: PostgreSQL (Supabase with row-level security)
**Auth**: Supabase Auth (simpler than Ory Kratos)
**Encryption**: AES-256 client-side, TLS 1.3 in transit
**Infrastructure**: Supabase + Railway/Vercel + Cloudflare CDN
**Compliance**: Vanta (automated HIPAA), annual pen testing

**Why These Choices**:

- Supabase: Built-in auth, database, storage, BAA available
- Flutter: Single codebase, strong security, offline-first
- Vanta: Automates compliance vs $50K-100K manual consulting

---

## Monetization Strategy

### Pricing Tiers

| Tier             | Price                   | Features                                                    | Target Conversion  |
| ---------------- | ----------------------- | ----------------------------------------------------------- | ------------------ |
| **Free**         | $0                      | 10 entries/month, 1 partner, ads                            | 100% (acquisition) |
| **Premium**      | $9.99/mo or $99.99/yr   | Unlimited tracking, lab import, partner alerts, PDF export  | 8-10% of free      |
| **Premium Plus** | $19.99/mo or $199.99/yr | + 2 telehealth visits/mo, discounted test kits, AI insights | 15-20% of Premium  |
| **Lifetime**     | $499 (limit 5,000)      | All Premium Plus features forever                           | Early adopters     |

### Revenue Streams

1. **B2C Subscriptions**: $228K Y1 → $5.4M Y3 (primary)
2. **B2B** (universities, clinics): $44K Y1 → $1.9M Y3 (35% by Y3)
3. **Affiliates** (testing kits, products): $5-15/user/year
4. **Research data** (opt-in, anonymized): $100K-500K at scale

### Conversion Strategy

- **Trigger paywalls strategically**:
  - Attempt 2nd partner connection (60% convert)
  - Export report for doctor (50% convert)
  - After 5 tracking sessions (15% convert)
- **7-day free trial**: 60% trial-to-paid target
- **Win-back**: 50% off for 3 months if cancel

---

## Financial Projections

### 3-Year Plan

| Metric     | Year 1     | Year 2       | Year 3       |
| ---------- | ---------- | ------------ | ------------ |
| MAU        | 25,000     | 100,000      | 300,000      |
| Paid Users | 2,000 (8%) | 10,000 (10%) | 36,000 (12%) |
| ARPU       | $9.50      | $11          | $12.50       |
| MRR        | $19K       | $110K        | $450K        |
| **ARR**    | **$228K**  | **$1.32M**   | **$5.4M**    |
| Costs      | $600K      | $900K        | $1.5M        |
| **Profit** | **-$372K** | **+$420K**   | **+$3.9M**   |

### Cost Breakdown (Year 1)

| Category           | Amount         | Details                                        |
| ------------------ | -------------- | ---------------------------------------------- |
| **Team**           | $280K-390K     | 2 devs, 1 security (contract), 1 designer (PT) |
| **Infrastructure** | $3K-6K         | Supabase, Railway, Cloudflare, monitoring      |
| **Compliance**     | $40K-70K       | HIPAA audit, legal, pen testing, BAAs          |
| **Marketing**      | $100K-210K     | Content, ads, influencers, partnerships        |
| **Operations**     | $40K-100K      | Support, payment processing, insurance         |
| **TOTAL**          | **$463K-776K** | **Recommended: $600K**                         |

### Break-Even

- **Fixed costs**: $43K/month (lean team)
- **ARPU**: $9.99, Net revenue: $7.99 (after $2 support costs)
- **Break-even**: 5,382 paid users = $54K MRR
- **With 10% conversion**: 53,820 MAU needed
- **Timeline**: Month 18-24 with $600K funding

---

## Marketing Strategy (CAC $25-35 Blended)

### Channels & Budget (Year 1: $210K)

| Channel           | CAC    | Budget | Strategy                             |
| ----------------- | ------ | ------ | ------------------------------------ |
| Content Marketing | $5-15  | $27K   | SEO blogs, YouTube, TikTok education |
| Social Ads        | $20-50 | $96K   | Instagram, TikTok, Reddit (targeted) |
| Influencers       | $15-30 | $39K   | Micro-influencers, sex educators     |
| Partnerships      | $10-20 | $18K   | Clinics, universities, LGBTQ+ orgs   |
| Paid Search       | $30-80 | $30K   | Google Ads (supplementary)           |

### Content Strategy (Organic Growth)

- **SEO Keywords**: "STI testing schedule" (2,400/mo), "anonymous STI notification" (800/mo)
- **Production**: 8 blog posts/month ($200 each), 4 YouTube videos, 15 TikToks
- **Expected Traffic**: 500/mo → 2,000/mo → 10,000/mo by Month 12

### LTV:CAC Analysis

- **LTV**: $120-180 (12-18 months × $10 ARPU)
- **CAC**: $20-40 (blended)
- **Ratio**: 3:1 to 4.5:1 ✅ (Healthy)
- **Payback**: 2-4 months

---

## B2B Opportunities (35% of Revenue by Y3)

### 1. Universities ($20K Y1 → $412K Y3)

- **Pricing**: $2K-12K/year (based on student population)
- **Features**: Unlimited student accounts, campus-wide alerts, admin dashboard
- **Sales Cycle**: 6-12 months (outreach → pilot → paid)
- **Target**: 5 unis Y1, 25 Y2, 75 Y3

### 2. Sexual Health Clinics ($24K Y1 → $750K Y3)

- **Pricing**: $500-1,500/month OR $300/month + $3/patient
- **Features**: Patient portal integration, auto-import results, telehealth
- **Sales Cycle**: 9-15 months
- **Target**: 3 clinics Y1, 15 Y2, 50 Y3

### 3. Public Health Departments ($0 Y1 → $500K Y3)

- **Pricing**: $50K-300K/year (custom contracts)
- **Features**: Epidemiological data, outbreak detection, partner services
- **Sales Cycle**: 12-24 months (build credibility first)
- **Target**: 0 Y1, 2 Y2, 5 Y3

### 4. Corporate Wellness ($0 Y1 → $250K Y3)

- **Pricing**: $2-5/employee/year (minimum $5K)
- **Sales Cycle**: 9-12 months (focus Year 2-3)
- **Target**: 0 Y1, 5 Y2, 25 Y3

---

## Implementation Roadmap (18-24 Months to Break-Even)

### Phase 1: Pre-Launch (Months 1-4) | Budget: $120K

**Month 1**: Setup

- Legal entity (Delaware C-Corp)
- Team hiring (2 devs, 1 designer contract)
- Development environment

**Month 2-3**: MVP Development

- Backend: Auth, database, API, encryption
- Frontend: Onboarding, tracking, partner sharing
- 4 × 2-week sprints

**Month 4**: Compliance & Beta

- HIPAA audit ($15K-25K)
- BAAs with vendors
- Beta test (50 users)
- App store submissions

**Deliverable**: HIPAA-compliant MVP, beta-tested, ready for launch

### Phase 2: Launch & Validation (Months 5-12) | Budget: $340K

**Month 5-6**: Public Launch

- App store approval (1-2 weeks iOS, 3-7 days Android)
- Product Hunt launch
- Initial marketing ($2K/month)
- **Target**: 1,000 downloads

**Month 7-9**: Monetization

- Premium tier launch ($9.99/month)
- Lab integrations (Quest, LabCorp)
- Scale marketing ($5K/month)
- **Target**: 5,000 users, 300 paid

**Month 10-12**: Growth

- Premium Plus launch ($19.99/month)
- Referral program
- B2B pilots (1-2 universities, 1 clinic)
- Scale marketing ($10K-15K/month)
- **Target**: 25,000 users, 2,000 paid, $19K MRR

**Go/No-Go Decision**: Month 12 - If <2,000 paid or <$19K MRR → Pivot to B2B only or shut down

### Phase 3: Scale to Break-Even (Year 2) | Budget: $900K

**Q1**: Platform maturity

- Lifetime tier ($499), telehealth, web app
- **Target**: 50K users, 5,000 paid, $50K MRR

**Q2-Q4**: Break-even

- AI insights, national campaigns
- B2B expansion (25 universities, 15 clinics)
- **Target**: 100K users, 10,000 paid, $110K MRR, **break-even achieved**

### Phase 4: Profitability (Year 3) | Budget: $1.5M

- White-label for clinics, API integrations
- Geographic expansion (Canada, UK)
- B2B dominance (75 unis, 50 clinics, 5 public health, 25 corporate)
- **Target**: 300K users, 36,000 paid, $450K MRR, $5.4M ARR, 70-75% profit margin

---

## Critical Milestones (Go/No-Go Decision Points)

| Milestone           | Timeline | Success Criteria                                 | GO                                   | NO-GO                                       |
| ------------------- | -------- | ------------------------------------------------ | ------------------------------------ | ------------------------------------------- |
| **PMF Validation**  | Month 6  | 1,000 users, 60% activation, 40% 7-day retention | Continue to premium launch           | Pivot to Cyclix Wellness                    |
| **Monetization**    | Month 12 | 2,000 paid, 8% conversion, $19K MRR              | Raise Seed ($1M-2M), scale marketing | Focus B2B only or shut down                 |
| **Break-Even Path** | Month 18 | 5,000 paid, $50K MRR                             | Hire aggressively, expand markets    | Pursue acquisition ($2-5M)                  |
| **Break-Even**      | Month 24 | 10,000 paid, $110K MRR                           | Raise Series A ($3M-5M)              | Optimize for profit, prepare exit ($15-25M) |

---

## Security & Compliance

### Data Protection

- **Zero-knowledge encryption**: AES-256 client-side (server cannot decrypt)
- **Biometric security**: Face ID, Touch ID, PIN lock
- **Self-destruct**: Panic password wipes all data
- **Incognito mode**: Hide app icon, show as "Calendar"

### HIPAA Compliance

- **Audit**: Initial audit ($15K-30K), annual recertification
- **Automation**: Vanta ($12K-24K/year) vs manual ($50K-100K)
- **BAAs**: Supabase, Twilio, SendGrid (all offer BAAs)
- **Pen Testing**: Annual security audits ($10K-25K)

### User Controls

- Granular sharing (share specific tests only)
- Expiring links (24h, 7d, custom)
- Activity logs (who accessed what)
- Data export/delete (GDPR/CCPA compliance)

---

## Exit Strategy

### Potential Acquirers

1. **Healthcare Tech** ($50-200M): Hims & Hers, Ro, Nurx, PlushCare
2. **Digital Health Platforms** ($100-300M): Apple Health, Google Health, Amazon Care
3. **Pharmaceutical** ($50-150M): Gilead Sciences, Roche, Abbott

### Valuation Timeline

| Year | ARR    | Valuation (8x ARR) | Likely Exit                       |
| ---- | ------ | ------------------ | --------------------------------- |
| 2026 | $228K  | $1.8M              | Too early                         |
| 2027 | $1.32M | $10.6M             | Health tech startups (acqui-hire) |
| 2028 | $5.4M  | $43M               | **Hims, Ro, Nurx (strategic)**    |
| 2029 | $10M+  | $80M+              | Digital health platforms          |

### Exit Paths

1. **Strategic Acquisition** (Most Likely): $50-200M at $5-10M ARR, Year 4-5
2. **Acqui-Hire** (If Growth Stalls): $5-15M at $1-2M ARR, Year 3
3. **IPO** (Unlikely): Would need to pivot to broader wellness, $50M+ ARR

---

## Risk Assessment

### High Risks

1. **Regulatory**: HIPAA compliance costs $150K-300K initial
2. **Stigma**: Users hesitant to track/share sexual health data
3. **Payment processors**: May flag "sexual health" as high-risk
4. **Competition**: Hims $2B valuation, well-funded
5. **Limited TAM**: 15-25M users (vs 300M+ general wellness)

### Mitigation Strategies

1. **Compliance**: Use Vanta automation ($30K-60K savings/year)
2. **Stigma**: Position as "health tracking" not "sex app"
3. **Payments**: Use Stripe (sexual health-friendly) or crypto
4. **Competition**: Focus on partner notifications (unique differentiator)
5. **TAM**: Plan pivot to Cyclix Wellness (10x TAM) if needed

---

## Final Recommendation

### Build Intima If You Have:

✅ Healthcare industry connections (clinics, public health, insurance)
✅ $600K+ funding secured or committable
✅ 18+ months to dedicate full-time
✅ Personal passion for sexual health (will face stigma/criticism)
✅ Comfort with regulatory complexity (HIPAA, FDA, state laws)
✅ Tolerance for slow B2B sales cycles (6-12 months per deal)

**If 3+ are ❌ → DON'T BUILD THIS**

### Alternative Paths

#### Option 1: Cyclix Wellness (RECOMMENDED)

- **Why**: 10x larger market (150M women vs 15M sexual health)
- **Advantage**: Less stigma, easier monetization, proven competitors
- **Timeline**: 6 months to launch vs 9 months for Intima
- **Funding**: Easier to raise ($500K seed realistic)

#### Option 2: HealthHub Clinical (B2B-First)

- **Why**: More defensible, faster to revenue
- **Advantage**: B2B revenue more predictable, less marketing spend
- **Timeline**: 12 months to first $100K ARR
- **Target**: Land 5-10 clinics before building B2C

#### Option 3: Don't Build (Honest Assessment)

- **Why**: Market too small, compliance too expensive, competition too strong
- **Opportunity Cost**: 18 months on Intima = could build 3 other MVPs
- **Alternative**: Focus on GameHub B2C, LibraKeeper B2B, QuestHunt tourism

---

## Success Probability: 10-15% (Realistic)

**Optimistic** (20-30%): With perfect execution, strong partnerships, adequate funding
**Realistic** (10-15%): Most health apps fail due to retention/compliance issues
**Pessimistic** (5%): If can't secure partnerships or funding in first 6 months

**Why So Low?**

- Limited TAM (15-25M vs 300M+ wellness)
- High compliance costs ($150K-300K initial)
- Stigma reduces adoption/sharing
- Well-funded competition (Hims $2B valuation)
- Long B2B sales cycles (6-24 months)

**What Would Increase Odds?**

- Secure 2-3 clinic/university partnerships BEFORE building
- Raise $750K-1M (not just $600K minimum)
- Have healthcare advisory board from day one
- Plan pivot to Cyclix Wellness at Month 6 if metrics miss

---

**Conclusion**: Intima addresses a real, underserved problem (partner notifications, comprehensive tracking). But the path is hard, the market is small, and the competition is fierce. Only build if you're all-in with resources and connections. Otherwise, start with Cyclix Wellness (broader market) and add sexual health features later, or go B2B-first with HealthHub Clinical. The problem matters, but timing and market size make this a challenging bet.
