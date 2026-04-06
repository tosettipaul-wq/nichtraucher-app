# Nichtraucher-App: Strategische Planung & Design

**Status:** Planning Phase (Pre-Code)  
**Zielgruppe:** Paul + Freunde / Accountability Partner  
**Stack:** Vercel (Frontend) + Supabase (Backend) + Real-Time Features  
**Timeline:** MVP in 4 Wochen, Full Feature in 8 Wochen  

---

## 1. VISION & STRATEGISCHER KONTEXT

### Ziel
Eine datengetriebene, minimalistisch designte Nichtraucher-App für Paul + sein Netzwerk bauen, die:
- **Für Paul funktioniert** — Integration mit Life OS System (Supabase, tägliches Tracking, Datennutzung)
- **Accountability ermöglicht** — Freunde können Pauls Progress sehen + ihn ermutigen (nicht judgy, nicht invasiv)
- **Rückfall-Prevention** — Trigger-Tracking + Smart Notifications bei Craving-Zeiten
- **Langfristig motiviert** — Ohne Burnout durch aggressive Gamification (Streaks können explodieren + zerstören)

### Positionierung
**Nicht wie:** Kwit (zu komplex, 27 Steps Onboarding, CBT-überload)  
**Nicht wie:** Smokefree (zu minimal, zu "dein Weg" = keine Struktur für jemanden mit Trigger)  
**Stattdessen:** "Life OS for Quitting" — Clean Data, Smart Accountability, Behavioral Science (nicht Psychologie-Theater)

---

## 2. DATA ARCHITECTURE: TAG-TRACKING-VERGLEICH

### 3 Optionen analysiert:

#### A) **Timestamp-basiert** (Event-Log)
**Wie:** Jedes Craving/Rückfall wird als Event mit timestamp + context registriert  
**Vorteile:**
- Maximum Granularität (wann exactly war die Schwachstelle?)
- Trigger-Muster erkennbar (Statistik: 14:30 immer kritisch?)
- Real-time Notifications möglich (Freund kann direkt reagieren)

**Nachteile:**
- Schafft Hygiene-Druck (ständiges Loggen kann triggern)
- Zu viel Daten am Anfang (overfitting auf small sample)

#### B) **Daily Logging** (Journal-Style)
**Wie:** 1x täglich: "Wie war der Tag? (1-5) Trigger? Erfolg?"  
**Vorteile:**
- Reflektiv (zwingt zu aktiver Introspektion)
- Weniger Druck (nur 1x täglich)
- Gut für Mood-Pattern (Depression → Rückfall?)

**Nachteile:**
- Zu spät reagieren (wenn Craving akut, ist nächster Morning zu spät)
- Memory-Effect (User vergisst Details von 18:00)

#### C) **Event-Batch Daily** (Hybrid)
**Wie:** User kann während Tag mehrmals loggen (Craving/Erfolg), Daily Summary wird auto-aggregiert  
**Vorteile:**
- Real-time Reactivity (Freund kann helfen JETZT)
- Aber nicht überwältigend (Summary vor Schlaf beruhigt)
- Ideal für Accountability (Freund sieht: "Paul hatte 3 Cravings, all survived")

**Nachteile:**
- Komplexeres Data Model (denormalization challenges)

### **EMPFEHLUNG: Event-Batch Daily (Hybrid)**

**Begründung:**
1. **Pauls Use Case:** Paul ist datenorientiert + hat Freund-Accountability. Events im Moment loggen > Tag später berichten.
2. **Motivation:** "Survived 3 cravings" ist stärker als "today=4/5 mood". Specificity matters.
3. **Freund-Nutzen:** Accountability Partner kann LIVE reagieren ("Du packst das!" at 14:30) statt nächsten Tag.
4. **Anti-Burnout:** Daily Aggregation = Struktur ohne Ständig-Logging-Druck.
5. **Life OS Alignment:** Paul's Daten-Mindset passt zu Event-Tracking (wie Workouts/Spending).

**Technical Spec:**
```sql
-- Quitting Events (real-time)
craving_events (
  id UUID,
  user_id UUID,
  type: 'craving' | 'slip' | 'victory',
  intensity: 1-10,
  trigger: string (location, emotion, person, time),
  timestamp,
  created_at,
  response: 'breathed' | 'walked' | 'called_friend' | null
)

-- Daily Summary (auto-computed nightly)
daily_summary (
  user_id UUID,
  date,
  craving_count: int,
  slip_count: int,
  victory_count: int,
  avg_intensity: float,
  mood_morning: 1-5,
  mood_evening: 1-5,
  notes: text,
  created_at
)

-- Accountability Log (what friend sees)
visibility_log (
  user_id UUID,
  viewer_id UUID (friend),
  date,
  shared_metrics: ['cravings', 'mood', 'triggers'],
  seen_at
)
```

---

## 3. USER FLOWS & ACCOUNTABILITY-MODELLE

### Primary User: Paul
**Flow:**
1. **Day 0 - Quit Start:** "I'm quitting now" → Baseline health data (cigs/day, start date, goal)
2. **Daily - Tracking:** Events logged as they happen (Craving? → Log it. Survived? → Log victory)
3. **Evening - Summary:** Daily summary auto-generated (Kwit-style dashboard)
4. **Weekly - Reflection:** Trigger patterns emerge (Tuesday stressful? Friday social?)
5. **Friend Invite:** "Invite [Friend Name] as Accountability Partner"

### Secondary User: Accountability Partner (Friend)
**Flow:**
1. **Invite Accept:** Gets link from Paul → "I'm supporting Paul" → Choose involvement level
2. **Live Dashboard:** Can see Paul's daily summary (not hourly events = privacy respected)
3. **Alert/Support:** Notifications when Paul logs a slip or hard day
4. **Messages:** Can send pre-written support messages ("You got this") or custom notes
5. **Privacy Control:** Paul decides what friend sees (cravings? mood? triggers? all of it?)

### Multi-User Scenario: Group Challenge
**Future (Phase 2):**
- Friends quitting together → Shared challenge (not competitive, collaborative)
- Community Goals ("200 Days Collective Non-Smoking in this group")
- Support Thread (async chat, not real-time)

### Share/Privacy Model
**Paul's Control:**
- Public: None (this is personal, not Instagram)
- Friend View: Highly customizable
  - "Only show my summary, not individual cravings"
  - "Show triggers so friend knows when to check on me"
  - "No mood data, only daily yes/no"
- Self View: Full data (all events, all analysis)

---

## 4. MVP FEATURE PRIORITIZATION

### **MUST HAVE (Week 1-2, MVP Release)**
1. ✅ **Onboarding**
   - "When did you quit?" (or "When will you quit?")
   - "How many cigs/day before?"
   - "Why are you quitting?" (motivation anchor)
   - Simple (< 2 min, not 27 steps like Kwit)

2. ✅ **Craving Logging**
   - 1-tap "I'm having a craving right now" → Intensity slider (1-10) → Done
   - Optional: Trigger tag (stress, social, bored, after meal, etc.)
   - Show support message ("You can handle this. Breathe.")

3. ✅ **Daily Summary**
   - Auto-calculate: Days sober, cravings survived, money saved
   - Visual: Simple progress bar (not density like Kwit)
   - 1 metric for motivation: Days + Money (hit dopamine centers)

4. ✅ **Accountability Invite**
   - Paul gets unique link → Shares with Friend
   - Friend accepts → Can see Paul's daily summary

5. ✅ **Basic Analytics**
   - Streak (Days Sober)
   - Cravings This Week
   - Time Since Last Craving
   - Money Saved (calculate: cigs/day × price × days)

### **NICE-TO-HAVE (Week 3-4, Post-MVP)**
1. 🎁 **Victory Logging**
   - "I resisted!" → Unlock achievement badge
   - Anti-Burnout: No forced daily logins, only when you do something worth noting

2. 🎁 **Breathing Exercise** (guided 2-min)
   - When Paul logs craving, suggest: "Try a breathing exercise"
   - Simple: 4-7-8 breathing + timer

3. 🎁 **Trigger Pattern Analysis**
   - "Your cravings spike on Friday at 14:00" (weekly insight)
   - "Most common trigger: stress meetings"
   - Actionable: "Plan a walk Friday 13:30?"

4. 🎁 **Friend Messages**
   - Friend can send pre-written: "Proud of you!" / "You got this" / "Let's talk?"
   - Paul sees: Badge + message in timeline
   - Psychological: Social support = better outcomes

5. 🎁 **Milestone Rewards**
   - Day 7: "One week!"
   - Day 30: "One month! 👏"
   - Day 100: Unlock "Century" badge
   - **Not aggressive streaks** (can break without shame reset)

### **PHASE 2 (Later)**
- Community challenges (group quitting)
- Expert chat (medical advice)
- Integration with health apps (Apple Health / Strava)
- Advanced stats (mood correlation, CBT worksheets)

---

## 5. GAMIFICATION vs. CLINICAL TONE

### The Challenge
Kwit is **clinical overdrive** (CBT language, heavy onboarding).  
Smokefree is **too chill** (no structure for someone with triggers).  
Duolingo-style **gamification burns out** (streaks = pressure, breaking streaks = shame).

### Paul's Sweet Spot
**Data-driven + Minimal + Celebratory** (not pushy)

**Design Tone:**
- ✅ Celebrate concrete wins ("Day 14! 168 cigs NOT smoked")
- ✅ Matter-of-fact on cravings ("Craving logged. You got this. Breathe.")
- ✅ Zero shame culture (slip = learning data, not failure)
- ✅ No "You broke your streak!" anxiety
- ❌ No character mascots
- ❌ No intrusive notifications
- ❌ No leaderboards (competitive = bad for mental health)

**Gamification Elements (selective):**
- **Badges** (visual, not required): "Week 1", "Day 30", "100 Cravings Survived"
- **Streaks** (flexible): Show current days sober, but allow 1-2 "grace day" breaks without reset
- **Progress Bar** (visual feedback): Simple %-to-goal visual
- **Social Proof** (not comparison): Friend can send emoji-reactions to milestones

**Behavioral Psychology:**
- **Variable Reward Schedule** (not daily): Surprises when you least expect (e.g., random "You're crushing it!" message)
- **Intrinsic Motivation Focus** (not extrinsic): Why are you quitting? (health, money, freedom) = built into onboarding
- **Trigger Awareness** (behavior change): "Your Monday morning meetings = spike. Plan something."

---

## 6. DESIGN DIRECTION

### Inspiration Analysis

**Kwit:**
- ✅ Excellent dashboard density (many metrics, readable)
- ✅ Daily check-ins (mood + confidence tracking)
- ❌ Onboarding overload (27 steps = friction)
- ❌ Too many features (confusing for MVP)

**Smokefree:**
- ✅ Minimal, clean, unintimidating
- ✅ "Your way" philosophy = empowering
- ❌ No structure for accountability
- ❌ Trigger tracking is secondary

**Pauls Life OS:**
- ✅ Clean white space
- ✅ Data-focused (minimalist but informative)
- ✅ Blue/teal color palette (calm, focused)
- ✅ No dark patterns or manipulation

### Visual Direction: "Minimal Data"
**Palette:**
- Primary: Teal / Blue (#0EA5E9 or #06B6D4) — calm, focused, medical without being sterile
- Accent: Green (#10B981) — health, growth
- Danger: Amber (#F59E0B) — warnings (only for important alerts)
- Neutral: Gray (#6B7280) — secondary text, disabled states

**Typography:**
- Headlines: Inter Bold (sans-serif, modern)
- Body: Inter Regular (clean, readable on small screens)
- Data: Monospace for numbers (consistency with Life OS)

**Components:**
- Cards: Minimal shadow, 8px border radius, white bg with subtle gray border
- Buttons: Filled (teal) for primary actions, Ghost (text only) for secondary
- Modals: Full-screen or centered, no shadows (clean)
- Charts: Line/bar charts (not pie), clean grid, teal lines

**Example Dashboard Layout:**
```
┌─────────────────────────────────┐
│ 🚭 Paul's Quit Journey          │
├─────────────────────────────────┤
│ Days Sober:    [14 days]        │
│ Cravings:      [3 this week]    │
│ Money Saved:   [€84]            │
├─────────────────────────────────┤
│ Last Craving:  2h ago (you handled it!)
│ Hardest Day:   Friday 14:00     │
├─────────────────────────────────┤
│ [Log Craving Button]            │
│ [View Week Analysis]            │
└─────────────────────────────────┘
```

**Anti-Patterns:**
- ❌ Aggressive red warning messages
- ❌ "YOU'RE DOING GREAT!" all-caps
- ❌ Notifications more than once/day
- ❌ Dark mode (too "intense" for this use case)

---

## 7. TECH STACK & ARCHITECTURE

### Frontend: **Next.js 15 + Vercel** (wie hundehelfer)
**Why:**
- Fast, minimal, SSR-ready
- API Routes (simple backend for Paul's user)
- Edge Functions (notification triggers)
- Auto-deploy on git push

**Stack:**
```
├── Next.js 15 (React 19)
├── TailwindCSS (utility-first styling, minimal)
├── shadcn/ui (accessible components)
├── Zustand (simple state, no Redux overhead)
├── SWR / TanStack Query (real-time data fetching)
├── TypeScript (type safety)
└── Vercel Analytics (performance tracking)
```

**Key Pages:**
- `/dashboard` — Main view (days sober, cravings, money)
- `/log` — Quick craving logger (1 tap flow)
- `/analysis` — Weekly/monthly insights
- `/invite` — Share accountability link
- `/settings` — Privacy, notifications, data export

### Backend: **Supabase** (wie Life OS)
**Why:**
- PostgreSQL + Realtime = accountability live updates
- Row-level security (friend sees only what Paul allows)
- No additional backend to manage
- Auth already built-in (OAuth, magic links)

**Schema:**
```sql
-- Users
users (id, email, created_at, quit_date, cigs_per_day_before, motivation)

-- Events
craving_events (id, user_id, type, intensity, trigger, timestamp, response)

-- Summaries
daily_summaries (id, user_id, date, craving_count, slip_count, mood)

-- Accountability
accountability_partners (id, user_id, friend_id, status, privacy_level)

-- Analytics
trigger_patterns (id, user_id, trigger, frequency, day_of_week, hour)
```

**Real-Time Features:**
- Paul logs craving → Friend gets notification within 1 second (via Realtime subscriptions)
- Friend sends support message → Paul sees live notification + in-app badge
- Daily summary auto-aggregates at midnight (cron job via Vercel Function)

### Real-Time Accountability: **Supabase Realtime + Vercel Functions**
**Flow:**
```
Paul logs craving (client) 
  → INSERT into craving_events 
  → Realtime broadcast to friend (via subscription)
  → Friend gets push notification (if enabled)
  → Friend can reply ("Breathe, you got this")
  → Paul sees response in-app (badges + messages)
```

**Privacy-First:**
- RLS policy: Friend can only see craving_count + mood, not individual events
- Paul controls granularity (invite settings: "Show triggers?" "Show mood?")

### APIs & Integrations

**Internal APIs (Vercel Edge Functions):**
- `POST /api/cravings` — Log craving event
- `POST /api/invite/create` — Generate accountability link
- `GET /api/dashboard` — Get daily summary
- `POST /api/notifications/send` — Friend sends support message
- `GET /api/analytics` — Trigger pattern analysis

**External (Future Phase 2):**
- Apple Health API (sync health data, step count)
- Strava API (exercise tracking = craving prevention)
- Twilio (SMS alerts on critical days)

---

## 8. MVP TIMELINE

### **Week 1: Foundation**
- [ ] Data schema (Supabase setup)
- [ ] Auth flow (sign up, magic link)
- [ ] Onboarding component (quit date, motivation, cigs/day)
- [ ] Database RLS policies
- **Deliverable:** Signed-up users can see empty dashboard

### **Week 2: Core Features**
- [ ] Craving logger (real-time form → database)
- [ ] Daily summary aggregation (cron job)
- [ ] Dashboard display (days sober, cravings, money)
- [ ] Basic analytics (weekly cravings chart)
- **Deliverable:** Paul can log cravings, see progress

### **Week 3: Accountability**
- [ ] Accountability invite system (generate link)
- [ ] Friend signup + RLS (friend can see summary only)
- [ ] Friend notifications (Supabase Realtime)
- [ ] Support messages (friend → Paul)
- **Deliverable:** Paul + 1 friend can see each other's progress

### **Week 4: Polish + Launch**
- [ ] Responsive design (mobile-first, tablet, desktop)
- [ ] Error handling + edge cases (network failures, grace days)
- [ ] Performance optimization (lazy load, image optimization)
- [ ] Analytics (Vercel Analytics)
- **Deliverable:** Public MVP launch (paul-quits.vercel.app or similar)

---

## 9. OPEN QUESTIONS FOR PAUL

Before coding, clarify:

1. **Accountability Model:**
   - Should Friend see individual cravings or only daily summary?
   - Can Friend message Paul directly, or only pre-written support templates?
   - Real-time notifications or daily digest?

2. **Trigger Taxonomy:**
   - What triggers are most relevant to you? (stress, social, boredom, after meal, morning, evening, etc.)
   - Should the app learn triggers from your logging or should you select predefined ones?

3. **Grace Days / Slip Policy:**
   - If you slip (smoke 1 cig), is that a hard reset of streaks or do you get 1-2 grace days?
   - How should slips be visualized (shame-free or acknowledged)?

4. **Monetization:**
   - Is this personal tool or future product to sell to others?
   - If sell: Freemium model (like Kwit) or one-time purchase?
   - If personal: Just for you or open to any friend group?

5. **Data Export:**
   - Do you want CSV export of all craving data for personal analysis?
   - Integration with Life OS (can this feed into your health dashboard)?

6. **Notifications:**
   - Push notifications on phone or just in-app badges?
   - Frequency: 1x daily digest or real-time on each craving?

---

## 10. SUCCESS METRICS

**MVP Success (Week 4):**
- ✅ Paul can sign up + log first craving in < 2 minutes
- ✅ Dashboard shows accurate days sober + money saved
- ✅ 1 accountability partner can see daily summary + send support messages
- ✅ Mobile responsive (works on phone in portrait)
- ✅ <2 second dashboard load time (Core Web Vitals green)

**Post-MVP (Month 2):**
- ✅ Trigger patterns visible (Paul sees "Friday 14:00 is hard")
- ✅ Friend notification delivery <1 second
- ✅ Zero shame culture (Paul logs slips without guilt, learns from them)
- ✅ Real-world validation (Paul actually uses it daily, friend finds it helpful)

---

## CONCLUSION: WHY THIS APPROACH

**This architecture is:**
- **Paul-centered:** Built for his specific needs (datengetrieben, Life OS compatible, minimal design)
- **Accountability-first:** Real-time, privacy-respecting friend support (not intrusive)
- **Burnout-resistant:** No aggressive gamification, no forced streaks, no shame mechanics
- **Scalable:** If successful, can grow to group challenges without fundamental redesign
- **Technical sweet spot:** Vercel + Supabase = no backend DevOps, just code + deploy

**Next Steps:**
1. Paul reviews PLAN.md + answers Open Questions
2. We lock Feature List + Privacy Model
3. Week 1 begins (auth + schema setup)
4. Sprint every Friday with Paul (check progress + adjust)

---

**Word Count:** ~2,100 words  
**Ready for:** Paul's feedback + Subagent briefing for development  
**Confidence:** High (architecture proven in hundehelfer + Life OS precedent)
