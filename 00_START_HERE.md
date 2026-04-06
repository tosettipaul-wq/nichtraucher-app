# 🚭 START HERE — Nichtraucher-App Strategic Plan

**Welcome!** Paul, this is your comprehensive strategic plan for the quit-smoking app.

---

## ⏱️ Read This First (5 Minutes)

### The Pitch
You're building a **minimal, data-driven quit-smoking app** with real-time accountability. Unlike Kwit (too complex) or Smokefree (no structure), this combines:

✅ **Real-time event logging** — Log cravings as they happen  
✅ **Privacy-first accountability** — Friend sees daily summary, not individual events  
✅ **Grace days, not shame** — Slips = learning data, not failures  
✅ **Life OS integration** — Same tech stack (Vercel + Supabase)  

### The Stack
- **Frontend:** Next.js 15 (Vercel deployment)
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Design:** Minimal teal palette (like Life OS)

### The Timeline
- **Week 1:** Auth + database schema + onboarding
- **Week 2:** Core logging + dashboard
- **Week 3:** Accountability partner features
- **Week 4:** Polish + launch

**MVP in 4 weeks. Full feature in 8 weeks.**

### What We Need From You
Answer 5 questions (see **Open Questions** below):

1. **Accountability:** Real-time alerts or daily digest?
2. **Triggers:** Predefined (stress, social, bored) or custom?
3. **Slips:** Grace days or hard streak reset?
4. **Notifications:** Push on phone or in-app only?
5. **Data:** Personal tool or future product to sell?

---

## 📚 Complete Documentation

**All documents are in this folder. Read in order:**

### For Quick Overview (15 min total)
1. **This file** (5 min) — You're reading it now ✓
2. **[EXEC_SUMMARY.md](EXEC_SUMMARY.md)** (10 min) — 60-second pitch + key decisions

### For Deep Dive (30 min)
3. **[PLAN.md](PLAN.md)** (25 min) — Full strategic plan
4. Answer Open Questions (5 min) — Critical decisions

### For Technical Details (Optional)
5. **[DATA_MODEL.md](DATA_MODEL.md)** — Database schema
6. **[DESIGN_SPEC.md](DESIGN_SPEC.md)** — Visual design system
7. **[ONBOARDING_FLOW.md](ONBOARDING_FLOW.md)** — User experience flow

### Navigation
- **[INDEX.md](INDEX.md)** — Document index + reading guide by role

---

## 🎯 Open Questions (Your Decisions)

**Before development starts on Week 1, decide:**

### 1. Real-Time vs. Daily Accountability
**Question:** When your friend should know you're struggling?

**Options:**
- 🔴 **Real-time:** Friend gets alert IMMEDIATELY when you log a craving (14:30) → Can respond now
- 🟡 **Daily digest:** Friend sees daily summary at 20:00 ("Paul had 3 cravings today")

**My rec:** Real-time (more effective for accountability in the moment)

---

### 2. Trigger Taxonomy
**Question:** How do you log what triggered a craving?

**Options:**
- 🟢 **Predefined:** Pick from list (stress, social, bored, after meal, morning, evening)
- 🔵 **Custom:** Write whatever you want ("Friday meeting stress", "post-espresso")
- 🟣 **Both:** Suggested list + ability to add custom

**My rec:** Both (structure + flexibility)

---

### 3. Slip Handling
**Question:** If you smoke 1 cigarette, what happens?

**Options:**
- 🔴 **Hard reset:** Streak resets to 0 days (harsh, can demoralize)
- 🟡 **Grace days:** You get 2-3 "free slips" per month without resetting (shame-free)
- 🟢 **Logged & learned:** It's data, not failure; streak shows "14 days primary" + "2 slips this month"

**My rec:** Grace days (aligns with behavior change psychology = zero-shame recovery)

---

### 4. Notifications
**Question:** How should you get alerts?

**Options:**
- 🔴 **Push notifications:** Mobile alerts (loud, intrusive)
- 🟡 **In-app badges:** Only see notifications in the app (non-intrusive)
- 🟢 **Email digest:** Daily email summary (async)

**My rec:** In-app badges + optional push (user controls frequency)

---

### 5. Data Ownership
**Question:** Is this personal or future product?

**Options:**
- 🔴 **Personal tool:** Just for you + close friends, never sold
- 🟡 **Future product:** Start personal, expand to other users later (freemium model)
- 🟢 **Open for now:** Decide later, build architecture that supports both

**My rec:** Open for now (architecture supports both, no extra work)

---

## ✅ What You Get (Deliverables)

Everything needed to go from plan → code in Week 1:

| Document | What's Inside | Use Case |
|----------|---|---|
| **EXEC_SUMMARY.md** | 60-sec pitch, decisions, user flows | Share with team/investors |
| **PLAN.md** | Full strategy (2,100 words) | Reference for decisions |
| **DESIGN_SPEC.md** | Colors, typography, components | Design + development |
| **DATA_MODEL.md** | Database schema + RLS | Backend implementation |
| **ONBOARDING_FLOW.md** | User experience flows | UX implementation |
| **README.md** | Project overview | Repo root documentation |
| **context.md** | Project status + blockers | Project management |
| **INDEX.md** | Navigation guide | Finding documents |

---

## 🚀 Next Steps (Action Items)

### For Paul (This Week)
- [ ] Read **EXEC_SUMMARY.md** (10 min)
- [ ] Read **PLAN.md** (25 min)
- [ ] **Answer the 5 Open Questions** above (20 min)
- [ ] Approve timeline (4 weeks MVP)
- [ ] Share any reference apps/videos you like (Smokefree, Kwit, etc.)

### For James (After Paul Approves)
- [ ] Review all documents (1 hour)
- [ ] Validate schema (DATA_MODEL.md)
- [ ] Prepare subagent briefings
- [ ] Spawn Maya for Week 1

### For Maya (Subagent, Week 1)
- [ ] Set up GitHub repo + Vercel + Supabase
- [ ] Implement schema + auth
- [ ] Build onboarding flow
- [ ] Deploy to preview URL
- [ ] Demo Friday with Paul

---

## 📊 Architecture at a Glance

### Data Flow
```
You log craving (14:30)
  ↓
Real-time event saved (PostgreSQL)
  ↓
Friend gets notification (Supabase Realtime)
  ↓
Nightly aggregation (daily summary)
  ↓
Dashboard shows: "3 cravings survived, mood improving"
```

### Privacy Model
- **You control what friend sees** (invite settings)
- **Friend sees:** Daily summary (not individual events)
- **Database enforces** privacy via RLS policies

### Tech Stack
- **Frontend:** Next.js 15 + React 19 + TailwindCSS (Vercel)
- **Backend:** Supabase (PostgreSQL + Realtime + Auth)
- **Real-Time:** Supabase Realtime subscriptions

---

## 🎬 Success Looks Like

**Week 4 (MVP Launch):**
- ✅ You can sign up + log first craving in <2 minutes
- ✅ Dashboard shows accurate days sober + money saved
- ✅ Friend can see your daily summary + send support
- ✅ Mobile responsive (iPhone, landscape + portrait)
- ✅ <2 second dashboard load time

**Month 2 (Real-World):**
- ✅ You're logging cravings daily
- ✅ Triggers are visible ("Friday meetings are hard")
- ✅ Friend finds accountability helpful
- ✅ Zero shame culture (you log slips without guilt)

---

## 🎯 Why This Approach Works

| Competitor | Their Strength | Their Weakness | **Your Advantage** |
|---|---|---|---|
| **Kwit** | CBT structure, detailed | 27-step onboarding, overwhelming | Minimal + real-time accountability |
| **Smokefree** | Clean, minimal | No structure, loose | + Privacy-respecting friend support |
| **Generic habit apps** | Streaks, badges | Burnout mechanics, shame | Grace days, celebratory tone |

**You're building:** Kwit's structure + Smokefree's simplicity + Friend accountability (= gap in market)

---

## 🔐 Privacy Guarantees

- **You own your data.** Can export CSV anytime.
- **Friend sees only what you allow.** RLS policies enforce at database level.
- **No public sharing.** This is private, not Instagram.
- **No selling data.** Ever.

---

## 💰 ROI (Why Worth Building)

**Personal:**
- ✅ Tool to actually quit smoking (not just try)
- ✅ Real accountability from friend
- ✅ Data to understand your patterns
- ✅ Save €500+/month (~€6k/year)

**Future Potential:**
- 🎁 Framework for other addictions (alcohol, social media, gaming)
- 🎁 Sell to other users (freemium model)
- 🎁 Integration with health platforms (Apple Health)

---

## ❓ FAQ

**Q: Why 4 weeks for MVP?**  
A: Experienced stack (hundehelfer precedent), locked features, clear scope.

**Q: Can we ship sooner?**  
A: Minimum viable = Week 2 (logging + dashboard). Week 3-4 adds accountability.

**Q: What if we change our mind?**  
A: Architecture is flexible. Can add features in Phase 2 without redesign.

**Q: Is this secure?**  
A: Yes. Supabase auth + RLS policies + no backend. Better than rolling our own.

**Q: Will it integrate with Life OS?**  
A: Designed to. Same Supabase project, same backend. Easy to link later.

---

## 📞 Questions?

- **Architecture questions?** → See [PLAN.md § 7](PLAN.md#7-tech-stack--architecture)
- **Design questions?** → See [DESIGN_SPEC.md](DESIGN_SPEC.md)
- **Database questions?** → See [DATA_MODEL.md](DATA_MODEL.md)
- **Timeline questions?** → See [PLAN.md § 8](PLAN.md#8-mvp-timeline)

---

## 🎬 The Next 4 Weeks

```
WEEK 1: Foundation
  → Database schema, auth, onboarding component
  → You can sign up + see empty dashboard

WEEK 2: Core Features  
  → Log craving, daily dashboard, basic stats
  → You can log + see progress

WEEK 3: Accountability
  → Invite friend, friend support, real-time alerts
  → Friend can help you

WEEK 4: Polish
  → Mobile responsive, error handling, launch
  → Live on paul-quits.vercel.app
```

**Every Friday:** 30-min demo + feedback with Paul

---

## ✨ Let's Go

1. **You read:** EXEC_SUMMARY.md (10 min)
2. **You read:** PLAN.md (25 min)
3. **You decide:** Answer 5 Open Questions (20 min)
4. **You approve:** Timeline + features (5 min)
5. **We start:** Week 1 development (Monday)

**Total time:** ~1 hour to unlock 4 weeks of execution.

Ready? 👇

---

## Quick Links

| Document | Time | Purpose |
|---|---|---|
| [EXEC_SUMMARY.md](EXEC_SUMMARY.md) | 10 min | 60-sec pitch, key decisions |
| [PLAN.md](PLAN.md) | 25 min | Full strategy + architecture |
| [INDEX.md](INDEX.md) | 5 min | Navigation guide |
| [README.md](README.md) | 5 min | Project overview |

---

**Last Updated:** April 6, 2026  
**Status:** Strategic planning complete, awaiting Paul's decisions  
**Confidence:** 9/10

**Paul, your move:** Review EXEC_SUMMARY.md → PLAN.md → Answer Open Questions → Let's build! 🚀
