# Nichtraucher-App: Document Index & Reading Guide

**Welcome!** This is your navigation guide. Start here, then jump to what you need.

---

## 📋 Quick Navigation

### For Paul (Decision-Maker)
**Read in this order:**

1. **[EXEC_SUMMARY.md](EXEC_SUMMARY.md)** (5 min read)
   - 60-second pitch
   - Key architecture decisions
   - Timeline & success criteria
   - Open questions that need your input

2. **[PLAN.md](PLAN.md)** (15 min read)
   - Full strategic plan
   - Feature prioritization
   - Design direction + inspiration
   - Tech stack rationale

3. **Answer these in [PLAN.md § 9 Open Questions](PLAN.md#9-open-questions-for-paul)**
   - Accountability model (real-time or daily?)
   - Trigger taxonomy (predefined or custom?)
   - Slip handling (grace days or reset?)
   - Notifications (push or in-app?)
   - Data ownership (personal or future product?)

**Then:** Approve timeline + features → Development starts Week 1

---

### For James (Orchestrator/Tech Lead)
**Read in this order:**

1. **[EXEC_SUMMARY.md](EXEC_SUMMARY.md)** (quick refresh)
2. **[PLAN.md](PLAN.md)** (full strategy)
3. **[DATA_MODEL.md](DATA_MODEL.md)** (schema + RLS)
4. **[DESIGN_SPEC.md](DESIGN_SPEC.md)** (visual system)
5. **[context.md](context.md)** (project status + open questions)

**Subagent Briefing:** Use templates from [PLAN.md § 8 Timeline](#8-mvp-timeline) to spawn development tasks

---

### For Maya (Developer Subagent)
**Read in this order:**

1. **[README.md](README.md)** (quick overview)
2. **[context.md](context.md)** (status + dependencies)
3. **[DATA_MODEL.md](DATA_MODEL.md)** (schema + RLS policies)
4. **[DESIGN_SPEC.md](DESIGN_SPEC.md)** (colors, typography, components)
5. **[ONBOARDING_FLOW.md](ONBOARDING_FLOW.md)** (UX flow for Week 1)
6. **[PLAN.md § 8 Timeline](PLAN.md#8-mvp-timeline)** (your specific weekly tasks)

**Then:** Start Week 1 (schema + auth + onboarding)

---

### For Alex (QA/Verification Subagent)
**Read in this order:**

1. **[EXEC_SUMMARY.md](EXEC_SUMMARY.md)** (understand the goal)
2. **[context.md](context.md)** (success criteria)
3. **[DESIGN_SPEC.md](DESIGN_SPEC.md)** (visual specs to verify against)
4. **[PLAN.md § 10 Success Metrics](PLAN.md#10-success-metrics)** (test cases)

**Then:** Wait for Maya's deployments → Verify each week

---

## 📚 Document Reference

| Document | Purpose | Read When | Time |
|----------|---------|-----------|------|
| **README.md** | Overview | New to project | 5 min |
| **EXEC_SUMMARY.md** | Quick pitch | Need 60-second summary | 5 min |
| **PLAN.md** | Strategic plan | Full context needed | 15 min |
| **DESIGN_SPEC.md** | Visual design | Implementing UI | 10 min |
| **DATA_MODEL.md** | Database schema | Building backend | 15 min |
| **ONBOARDING_FLOW.md** | UX flow | Coding auth/onboarding | 10 min |
| **context.md** | Project status | Check blockers | 5 min |
| **INDEX.md** | This file | Finding docs | 5 min |

---

## 🎯 By Role

### Product (Paul)
**Documents to own:**
- ✅ EXEC_SUMMARY.md (your pitch)
- ✅ PLAN.md (your strategy)
- ✅ Open Questions (your decisions)

**Documents to reference:**
- DESIGN_SPEC.md (visual review)
- DATA_MODEL.md (data privacy check)

### Engineering Lead (James)
**Documents to own:**
- ✅ context.md (project status)
- ✅ DATA_MODEL.md (schema design)
- ✅ DESIGN_SPEC.md (technical specs)

**Documents to reference:**
- PLAN.md (strategy context)
- ONBOARDING_FLOW.md (UX requirements)

### Developer (Maya)
**Documents to own:**
- ✅ DATA_MODEL.md (schema implementation)
- ✅ DESIGN_SPEC.md (component building)
- ✅ ONBOARDING_FLOW.md (UX implementation)

**Documents to reference:**
- PLAN.md § 8 (weekly timeline)
- context.md (blockers + dependencies)

### QA (Alex)
**Documents to own:**
- ✅ DESIGN_SPEC.md (visual verification)
- ✅ PLAN.md § 10 (success metrics)
- ✅ context.md (acceptance criteria)

**Documents to reference:**
- ONBOARDING_FLOW.md (UX testing)

---

## 🔑 Key Sections Quick Links

### Decision Points (Paul's Input Needed)
- [PLAN.md § 9: Open Questions](PLAN.md#9-open-questions-for-paul)
- [EXEC_SUMMARY.md: Conversation Starters](EXEC_SUMMARY.md#conversation-starters)

### Technical Deep Dives
- [DATA_MODEL.md: Core Tables](DATA_MODEL.md#core-tables)
- [DATA_MODEL.md: RLS Policies](DATA_MODEL.md#row-level-security-rls-policies)
- [DESIGN_SPEC.md: Components](DESIGN_SPEC.md#components)

### Timeline & Milestones
- [PLAN.md § 8: MVP Timeline](PLAN.md#8-mvp-timeline)
- [context.md: Timeline Table](context.md#development-timeline)

### Success Criteria
- [PLAN.md § 10: Success Metrics](PLAN.md#10-success-metrics)
- [EXEC_SUMMARY.md: Success Criteria](EXEC_SUMMARY.md#success-criteria-4-weeks)

---

## 📊 Decision Tree

**"Where do I start?"**

```
Are you Paul?
  → Yes: EXEC_SUMMARY.md → PLAN.md → Answer Open Questions
  → No: Continue...

Are you building this?
  → Yes: README.md → DATA_MODEL.md → ONBOARDING_FLOW.md
  → No: Continue...

Are you verifying this?
  → Yes: DESIGN_SPEC.md → PLAN.md § 10
  → No: Continue...

Read README.md, then ask for clarification
```

---

## 🔄 Document Lifecycle

| Stage | Owner | Documents | Status |
|-------|-------|-----------|--------|
| **Planning** (Week 0) | Paul + James | All strategic docs | ✅ Complete |
| **Development** (Week 1-4) | Maya + James | PLAN.md § 8 timeline | ⏳ Upcoming |
| **QA/Verification** (Week 1-4) | Alex + James | DESIGN_SPEC + success metrics | ⏳ Upcoming |
| **Launch** (Week 4) | All | README.md + deployment | ⏳ Upcoming |
| **Post-Launch** | Paul | context.md updates | ⏳ Upcoming |

---

## 📝 Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | Apr 6, 2026 | Initial planning complete |

---

## ❓ FAQ

**Q: Where do I find the tech stack?**  
A: [PLAN.md § 7](PLAN.md#7-tech-stack--architecture) or [EXEC_SUMMARY.md table](EXEC_SUMMARY.md#user-flows)

**Q: What's the timeline?**  
A: [PLAN.md § 8](PLAN.md#8-mvp-timeline) or [EXEC_SUMMARY.md](EXEC_SUMMARY.md#timeline) (condensed)

**Q: What are the open questions?**  
A: [PLAN.md § 9](PLAN.md#9-open-questions-for-paul) — Paul needs to answer these before dev starts

**Q: How will accountability work?**  
A: [PLAN.md § 2 & 3](PLAN.md#2-data-architecture-tag-tracking-comparison) (architecture) + [DATA_MODEL.md: accountability_partners](DATA_MODEL.md#4-accountability_partners-relationships)

**Q: What about privacy?**  
A: [PLAN.md § 3](PLAN.md#3-user-flows--accountability-models) (user flows) + [DATA_MODEL.md: RLS Policies](DATA_MODEL.md#row-level-security-rls-policies) (technical)

**Q: How long will development take?**  
A: 4 weeks for MVP (see [PLAN.md § 8](PLAN.md#8-mvp-timeline))

**Q: Where's the code?**  
A: Code folder to be created Week 1. These docs are the blueprint.

**Q: Can I see a mockup?**  
A: See [ONBOARDING_FLOW.md: Flow Diagram](ONBOARDING_FLOW.md#flow-diagram) and [DESIGN_SPEC.md: Screens](DESIGN_SPEC.md#screens--layouts)

---

## 🚀 Getting Started Checklist

**Paul (Product):**
- [ ] Read EXEC_SUMMARY.md
- [ ] Read PLAN.md
- [ ] Answer Open Questions in PLAN.md § 9
- [ ] Approve timeline + features
- [ ] Share any reference links (Smokefree demo, Kwit video, etc.)

**James (Tech Lead):**
- [ ] Read all strategic docs (PLAN, EXEC_SUMMARY, context)
- [ ] Review DATA_MODEL.md + validate schema
- [ ] Review DESIGN_SPEC.md + validate specs
- [ ] Prepare subagent briefings for Week 1
- [ ] Wait for Paul's approval → Brief Maya

**Maya (Developer):**
- [ ] Wait for James's briefing
- [ ] Set up GitHub repo + Vercel + Supabase project
- [ ] Start Week 1: Schema + Auth + Onboarding
- [ ] Daily commits, Friday demos with Paul

**Alex (QA):**
- [ ] Read success criteria
- [ ] Set up QA testing environment
- [ ] Review each deployment from Maya
- [ ] Test mobile (iPhone) + desktop
- [ ] Report findings to James

---

## 📞 Support & Questions

**Stuck?**
1. Check this INDEX.md
2. Search relevant doc (e.g., "privacy" → DATA_MODEL.md)
3. Ask in Telegram (Paul) or project chat (Team)

**Found an error?**
- Update the relevant document
- Add note in context.md § Risk Register
- Tag James for review

---

## 🎯 Next Steps

1. **Paul:** Review EXEC_SUMMARY.md (5 min)
2. **Paul:** Read PLAN.md (15 min)
3. **Paul:** Answer Open Questions (10 min)
4. **James:** Review all docs (30 min)
5. **All:** Align on timeline + features (meeting)
6. **Week 1 starts:** Maya begins development

---

**Last Updated:** April 6, 2026  
**Status:** Planning complete, awaiting Paul's approval  
**Confidence:** 9/10

**Ready to launch?** Paul, review EXEC_SUMMARY.md → Answer questions → We're off! 🚀
