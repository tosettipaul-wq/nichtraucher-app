# Nichtraucher-App: Executive Summary

## The Pitch (60 Seconds)

**What:** A minimal, data-driven quit-smoking app for you + accountability partner.  
**Why:** Existing apps are either too complex (Kwit: 27-step onboarding) or too loose (Smokefree: no structure).  
**How:** Vercel + Supabase (like hundehelfer + Life OS). Event-logging + daily summaries. Real-time friend alerts.  
**Timeline:** 4 weeks MVP, fully functional.

---

## Key Architecture Decisions

### Data Model: "Event-Batch Daily" ✅
- You log cravings as they happen (intensity + trigger)
- System auto-aggregates nightly (daily summary)
- Friend sees summary, not individual events (privacy)
- Real-time alerts for friend accountability

**Why not just daily journal?** You'll have cravings at 2 PM. Waiting until evening = too late. Real-time tracking + friend support is the differentiator.

### Gamification: Minimal + Celebratory ✅
- ✅ Streaks (days sober) but with grace days = no shame on slips
- ✅ Badges for milestones (Day 7, 30, 100)
- ✅ Money saved + health metrics (dopamine hits)
- ❌ No aggressive notifications, no leaderboards, no pushy UI

**Why?** Streaks burn out. You need motivation without pressure. Celebrate concrete wins ("Day 14! 168 cigs NOT smoked") not forced engagement.

### Design: Life OS Vibes ✅
- Clean, teal/blue palette (calm, focused)
- Minimal dashboard (3-4 metrics only)
- No dark patterns, no manipulation
- Mobile-first (Paul uses phone, not desktop)

---

## MVP Features (Week 1-4)

**Must Have:**
- Sign up + set quit date
- 1-tap craving logger (intensity + trigger)
- Daily dashboard (days sober, cravings, money saved)
- Accountability invite link (friend joins)
- Basic analytics (weekly trends)

**Nice-to-Have (Post-MVP):**
- Breathing exercise (2-min guided)
- Trigger pattern analysis ("Friday 14:00 is hard")
- Friend support messages ("You got this!")
- Milestone badges
- Mood tracking

---

## User Flows

**You (Paul):**
1. Sign up → "I'm quitting now" → Dashboard
2. Feel craving → Tap "Craving" → Intensity (1-10) → Trigger tag → Done
3. Evening → See daily summary (cravings survived, mood, patterns)
4. Invite friend → Share link → Friend accepts → Friend can see YOUR daily summary

**Friend (Accountability Partner):**
1. Click Paul's link → Accept invite → See Paul's daily summary
2. Get alert when Paul logs a hard day
3. Send pre-written support messages ("You got this!")
4. Celebrate milestones with him

---

## Tech Stack

| Component | Choice | Why |
|-----------|--------|-----|
| **Frontend** | Next.js 15 + Vercel | Fast, minimal, proven (hundehelfer) |
| **Backend** | Supabase + PostgreSQL | Real-time, auth, RLS, no DevOps |
| **Real-Time** | Supabase Realtime | Friend alerts <1 sec |
| **State** | Zustand | Simple, not Redux |
| **Styling** | TailwindCSS | Utility-first, minimal |
| **Auth** | Supabase OAuth/Magic Link | Seamless, secure |

**No:** Complicated backends, Docker, AWS. This is simple: code → Vercel → done.

---

## Privacy Model (Critical)

**You control what friend sees:**
- Option 1: Only daily summary (days sober, total cravings count)
- Option 2: + Trigger data ("Paul struggling with Friday meetings")
- Option 3: + Mood data ("Paul stressed today")

**Friend CANNOT:**
- See individual cravings (only aggregate count)
- See what you ate/drank/did (only smoking-related data)
- Initiate contact (messages are one-way from them to you, opt-in)

**Data is yours:**
- Export to CSV anytime
- Delete all data anytime
- Only shared if you explicitly allow

---

## Open Questions (Need Your Call)

1. **Real-time or Daily?**
   - Friend gets alert when you log craving (real-time) or daily digest at 20:00?
   - My rec: Real-time (more effective for accountability)

2. **Trigger List:**
   - Predefined triggers (stress, social, bored, after meal) or custom?
   - My rec: 5-6 predefined + option to add custom

3. **Slip Handling:**
   - If you smoke 1 cig: Reset streak or "grace day"?
   - My rec: Grace days (2-3 allowed per month) = shame-free recovery

4. **For yourself or to sell?**
   - Personal tool or future product for others?
   - Affects pricing/privacy model later

5. **Notifications:**
   - Push notifications on phone or in-app only?
   - Friend alert frequency (real-time or digest)?

---

## Success Criteria (4 Weeks)

✅ You can log a craving in <30 seconds  
✅ Dashboard shows accurate days + money saved  
✅ Friend can see your daily summary + send support  
✅ Mobile responsive (works on iPhone)  
✅ <2 second load time  

**Real-world:** You use it daily + friend finds it helpful → MVP succeeded

---

## Why This Works (vs Competitors)

| App | Good At | Weak At | Your App |
|-----|---------|---------|----------|
| **Kwit** | CBT structure, mood tracking | Overcomplex, 27-step onboarding | Simple, direct, data-focused |
| **Smokefree** | Minimal, clean | No accountability, no structure | + Real-time friend support |
| **Yours** | — | — | Minimal + Accountability + Paul's Life OS integration |

---

## Timeline

- **Week 1:** Database schema + auth + onboarding
- **Week 2:** Core logging + dashboard
- **Week 3:** Accountability invite + friend features
- **Week 4:** Polish + launch (paul-quits.vercel.app)

**Total dev time:** ~80-100 hours (1 subagent, full-time)

---

## Conversation Starters

1. "Real-time friend alerts or daily digest?"
2. "Should slips reset streaks or get grace days?"
3. "Predefined triggers or fully custom?"
4. "Personal tool or future product?"
5. "What triggers are most important for you?"

---

**Next:** Paul reviews → answers open questions → Week 1 starts → Sprint every Friday

**Confidence:** 9/10 (Architecture solid, tech proven, feature scope right-sized)
