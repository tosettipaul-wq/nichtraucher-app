# Nichtraucher-App: Onboarding Flow

**Goal:** Get Paul from "not signed up" to "logged first craving" in <2 minutes

**Principle:** Minimal questions, maximum clarity. No Kwit-style 27 steps. Just: auth → quit date → motivation → done.

---

## Flow Diagram

```
┌─────────────────┐
│  Start Screen   │ "Paul's Quit Journey"
│  (public)       │ Button: "Get Started" / "I Already Have Account"
└────────┬────────┘
         │
    ┌────▼─────────────────┐
    │  Authentication      │
    │  Email + Password    │
    │  (or Magic Link)     │
    └────┬─────────────────┘
         │
    ┌────▼─────────────────┐
    │  Step 1: Quit Date   │ "When are you quitting?" (or "When did you quit?")
    │                      │ Date picker: [Select Date]
    │                      │ Button: "Next"
    └────┬─────────────────┘
         │
    ┌────▼─────────────────────────┐
    │  Step 2: Baseline             │ "How many cigs/day before?"
    │                               │ Slider: [10 cigs/day]
    │                               │ Button: "Next"
    └────┬─────────────────────────┘
         │
    ┌────▼──────────────────────┐
    │  Step 3: Motivation        │ "Why are you quitting?" (optional, but recommended)
    │                            │ Text area: [Free-form]
    │                            │ Presets: "Health", "Save money", "For Bo", "Other"
    │                            │ Button: "Finish"
    └────┬──────────────────────┘
         │
    ┌────▼──────────────────────┐
    │  Dashboard                 │ "Welcome! You're in."
    │  Empty state              │ Days sober: 1 (calculated from quit_date)
    │  (first time)             │ Money saved: €12 (calculated)
    │                            │
    │  Call-to-action:          │ Button: "Log Your First Craving"
    │  "Ready to get started?"   │ Or: "Set Accountability Partner"
    └────────────────────────────┘
```

---

## Step-by-Step UX

### Start Screen (Landing)

**URL:** `/`

```
┌─────────────────────────────────┐
│          🚭                      │
│  Paul's Quit Journey            │
│                                 │
│  You got this. We're with you. │
│                                 │
│  [Sign Up]      [I Have Account]│
│                                 │
│  ─────────────────────────────  │
│  Why Nichtraucher?              │
│  • Real-time craving tracking   │
│  • Friend accountability         │
│  • Zero shame (slips = data)    │
│  • See your patterns            │
│                                 │
└─────────────────────────────────┘
```

**Copy:**
- Headline: "Paul's Quit Journey"
- Subheading: "You got this. We're with you."
- CTA: "Sign Up" (primary) / "I Have Account" (secondary)

**Accessibility:**
- Alt text on 🚭 emoji: "Quit smoking icon"
- Focus state on buttons (blue ring)

---

### Sign Up / Log In

**URL:** `/auth`

**Sign Up:**
```
┌─────────────────────────────────┐
│ Create Your Account             │
├─────────────────────────────────┤
│                                 │
│ Email:                          │
│ [_____________@_____._____]    │
│                                 │
│ Password:                       │
│ [_____________________]         │
│ (8+ characters, secure)         │
│                                 │
│ Confirm:                        │
│ [_____________________]         │
│                                 │
│ ☐ I agree to terms             │
│                                 │
│ [Sign Up]   [Already have one?] │
│                                 │
│ ─────────────────────────────── │
│ or Sign In with Google          │
│                                 │
└─────────────────────────────────┘
```

**Log In:**
```
┌─────────────────────────────────┐
│ Welcome Back                    │
├─────────────────────────────────┤
│                                 │
│ Email:                          │
│ [_____________@_____._____]    │
│                                 │
│ Password:                       │
│ [_____________________]         │
│                                 │
│ [Log In]   [Forgot password?]   │
│                                 │
│ ─────────────────────────────── │
│ or Sign In with Google          │
│                                 │
└─────────────────────────────────┘
```

**Validation:**
- Email: Valid format, not already signed up
- Password: 8+ characters, not too common

**Error Handling:**
```
❌ "Email already registered. Try logging in?"
❌ "Password too weak (must include number + letter)"
❌ "Invalid credentials"
```

---

### Step 1: Quit Date

**URL:** `/onboarding/step-1`

**Copy:** "When are you quitting?"

```
┌─────────────────────────────────┐
│ When are you quitting?  1/3    │
├─────────────────────────────────┤
│                                 │
│ I'm quitting:                   │
│ ☉ Today                         │
│ ○ A different date              │
│ ○ I've already quit (pick date) │
│                                 │
│ [Pick Date: __/__/____]        │
│                                 │
│ [Next]                          │
│                                 │
└─────────────────────────────────┘
```

**Options:**
1. **Today** — Today's date (default, common)
2. **Different date** — Future date (planning mode)
3. **Already quit** — Past date (retroactive tracking)

**Date Picker:** Calendar modal or input field `YYYY-MM-DD`

**Copy Variations:**
- "Today": Auto-fills to today's date
- "Tomorrow": Shows date selector starting at tomorrow
- "Already quit": Shows past date selector with note "You've got this! Here's your progress since [date]"

---

### Step 2: Baseline (Cigs/Day)

**URL:** `/onboarding/step-2`

**Copy:** "How many cigarettes were you smoking per day?"

```
┌─────────────────────────────────┐
│ Your Smoking Baseline  2/3      │
├─────────────────────────────────┤
│                                 │
│ Cigarettes per day:            │
│ 1 [═════●════════════════] 50   │
│        ↑                        │
│        10 cigs/day             │
│                                 │
│ At €6 per pack, that's ~€45/wk │
│ (calculation updates live)      │
│                                 │
│ [Back]            [Next]        │
│                                 │
└─────────────────────────────────┘
```

**Interaction:**
- Slider: 1-50 cigs/day (default: 10)
- Shows money saved calculation (live update as you slide)
- Currency based on user location (€ for Germany)

**Copy Updates:**
- 10 cigs/day: "~€45/week saved"
- 20 cigs/day: "~€90/week saved"
- 40 cigs/day: "~€180/week saved"

**Accessibility:**
- Slider: Arrow keys + Page Up/Down to adjust
- Current value announced by screen reader

---

### Step 3: Motivation (Optional)

**URL:** `/onboarding/step-3`

**Copy:** "Why are you quitting?"

```
┌─────────────────────────────────┐
│ Your Motivation        3/3      │
├─────────────────────────────────┤
│ (Optional, but helps!)          │
│                                 │
│ Quick pick:                     │
│ ☐ Health (lungs, heart)        │
│ ☐ Save money                    │
│ ☐ For someone I love (Bo?)     │
│ ☐ Energy & fitness              │
│ ☐ Mental clarity               │
│ ☐ Other                         │
│                                 │
│ Or tell us:                     │
│ [_____________________________] │
│ [_____________________________] │
│ [_____________________________] │
│                                 │
│ [Back]        [Finish]          │
│                                 │
└─────────────────────────────────┘
```

**Interaction:**
- Multi-select checkboxes (can pick multiple)
- Optional text area for custom motivation
- No validation (can leave blank)

**Copy Notes:**
- "For someone I love" assumes Paul has people/pets important to him (Bo)
- Pre-written options help users articulate their "why"
- Motivation is stored + shown on dashboard (for dark moments)

---

### Dashboard (First Time)

**URL:** `/dashboard`

```
┌─────────────────────────────────┐
│ 🎉 Welcome, Paul!               │
│ Onboarding Complete             │
├─────────────────────────────────┤
│                                 │
│ Days Sober:     [1 day]         │
│ Progress:       ░░░░░░░░░░░░░  │
│                                 │
│ Money Saved:    [€12]           │
│ Cigs Not Smoked: [10]           │
│                                 │
│ Your Motivation:                │
│ "Health + Save money"          │
│                                 │
├─────────────────────────────────┤
│ [Log Your First Craving]        │
│ [Invite Accountability Partner] │
│                                 │
│ or explore:                     │
│ [This Week]  [Analytics]        │
│                                 │
└─────────────────────────────────┘
```

**Key Elements:**
1. **Celebration:** "Welcome, Paul! You did it!" (motivational tone)
2. **Key Metrics:** Days sober, money saved (what they care about)
3. **Motivation Display:** Remind them *why* they're doing this
4. **Call-to-Action:** "Log first craving" or "Invite friend"

**Empty State Copy:**
- "No cravings logged yet. That's a win!"
- "Friend support coming soon? [Invite someone]"

---

## Variations & Branches

### Branch: Retroactive Quit (Already Quit)

If user picks past date in Step 1:

```
┌─────────────────────────────────┐
│ You're Already on Your Way! 🎉 │
├─────────────────────────────────┤
│                                 │
│ Days Sober: [47 days]           │
│ Money Saved: [€564]             │
│ Cigs Not Smoked: [470]          │
│                                 │
│ That's amazing! Let's track     │
│ cravings from here forward.     │
│                                 │
│ [Next]                          │
│                                 │
└─────────────────────────────────┘
```

**Copy:** Celebration of existing progress + forward-looking

### Branch: Planning Mode (Future Quit)

If user picks future date:

```
┌─────────────────────────────────┐
│ Quit Date: April 15, 2026  9d   │
├─────────────────────────────────┤
│                                 │
│ You're in Planning Mode.        │
│                                 │
│ Get ready:                      │
│ ☐ Tell your friend             │
│ ☐ Identify your triggers       │
│ ☐ Stock up on water            │
│                                 │
│ Countdown: 9 days until freedom │
│                                 │
│ [Start Planning] or [Change date]
│                                 │
└─────────────────────────────────┘
```

**Copy:** Preparation focus + excitement building

---

## Micro-Copy & Tone

**Successful Moments:**
- "You got this!"
- "Day 1 down. Proud of you."
- "€12 already saved. That's a coffee!"

**When They Struggle:**
- "Craving? Let's log it. You're learning."
- "That's data, not failure."
- "Call your friend? You got support."

**Encouragement:**
- Never say: "You're doing great!" (too generic)
- Instead: "14 days sober. That's 168 cigs not smoked." (specific)

---

## Success Metrics

**Onboarding Success:**
- ✅ >80% of users complete all 3 steps
- ✅ Average time: <2 minutes
- ✅ >70% reach "log first craving" CTA
- ✅ Zero form abandonment (clear error messages)

---

## Accessibility Checklist

- [ ] All inputs labeled (not just placeholder)
- [ ] Focus states visible (blue ring)
- [ ] Error messages clear + actionable
- [ ] Date picker keyboard-accessible
- [ ] Slider keyboard-accessible (arrow keys)
- [ ] Color contrast 4.5:1 minimum
- [ ] Mobile-responsive (full-screen modals on mobile)
- [ ] Screen reader tested (aria-labels, roles)

---

## Implementation Notes

**For Developer:**
- Form state in Zustand (not inline React state)
- Validation on blur + submit
- Date picker: Use native input[type=date] + custom fallback for older browsers
- Slider: HTML range input + custom styling
- API: POST /api/onboarding → Update users table

**For Designer:**
- Figma: Create component library for step screens
- Prototype transitions (Step 1 → 2 → 3 → Dashboard)
- Test on iPhone 14 (main mobile target)

---

## Deployment Notes

**Testing Before Launch:**
1. Sign up → fill all 3 steps → verify dashboard loaded
2. Try slips in Step 1 (wrong date, skip fields) → error handling
3. Mobile: Check full-screen layout, touch targets (48px min)
4. Screen reader: Test with VoiceOver (Mac) + TalkBack (Android)

---

**Status:** Ready for handoff to design + development  
**Next:** Create Figma screens + implement components
