# Nichtraucher-App: Design Specification

## Visual Identity

### Color Palette

**Primary:**
- Teal: `#0EA5E9` (primary actions, focus states)
- Light Teal: `#06B6D4` (hover states, secondary emphasis)

**Semantic:**
- Success: `#10B981` (milestones, victories)
- Warning: `#F59E0B` (hard days, high cravings)
- Danger: `#EF4444` (slips, alerts) — use sparingly
- Info: `#3B82F6` (secondary actions, hints)

**Neutrals:**
- Dark Text: `#1F2937` (headlines, primary text)
- Light Text: `#6B7280` (secondary text, hints)
- Border: `#E5E7EB` (separators, cards)
- Background: `#FFFFFF` (clean, no dark mode for this app)

**Why Teal?**
- Medical without sterile (better than pure blue)
- Calming & focused (psychology of color)
- Aligns with Life OS palette
- Accessible (WCAG AA/AAA with white + dark text)

---

## Typography

**Font Stack:**
```css
/* Headlines */
font-family: 'Inter', system-ui, -apple-system, sans-serif;
font-weight: 600 (bold);
letter-spacing: -0.5px;

/* Body */
font-family: 'Inter', system-ui, -apple-system, sans-serif;
font-weight: 400;
line-height: 1.6;

/* Data/Numbers */
font-family: 'JetBrains Mono', monospace;
font-weight: 500;
letter-spacing: 0.1px;
```

**Sizes:**
| Role | Size | Weight | Use |
|------|------|--------|-----|
| H1 (Hero) | 32px | 700 | Page titles (dashboard) |
| H2 (Section) | 24px | 600 | Section headers |
| H3 (Card Title) | 18px | 600 | Card titles, modal headers |
| Body Large | 16px | 400 | Main copy |
| Body Regular | 14px | 400 | Standard body text, UI labels |
| Body Small | 12px | 400 | Captions, hints, timestamps |
| Mono (Data) | 18px | 500 | Large numbers (days, money) |
| Mono (Small) | 14px | 400 | Times, secondary data |

---

## Components

### Buttons

**Primary Action:**
```
Background: #0EA5E9
Color: White
Padding: 12px 20px
Border-Radius: 8px
Font: Body Regular (14px) Bold
Hover: #06B6D4
Active: #0284C7
State: Disabled = 50% opacity
```

**Example:** "Log Craving" button on dashboard

**Secondary Action:**
```
Background: Transparent
Border: 1px #0EA5E9
Color: #0EA5E9
Padding: 12px 20px
Border-Radius: 8px
Hover: Background: #F0F9FF
```

**Example:** "View Week" link button

**Danger Action:**
```
Background: #FEE2E2
Color: #DC2626
Hover: Background: #FECACA
```

**Example:** "Delete Data" button (rare)

### Cards

```
Background: #FFFFFF
Border: 1px #E5E7EB
Border-Radius: 12px
Padding: 20px
Box-Shadow: 0 1px 3px rgba(0,0,0,0.1)
```

**Card Header:**
```
Font: H3 (18px, 600 weight)
Color: #1F2937
Margin-Bottom: 12px
Border-Bottom: 1px #E5E7EB (optional)
Padding-Bottom: 12px
```

### Forms

**Input Field:**
```
Border: 1px #E5E7EB
Border-Radius: 8px
Padding: 10px 12px
Font: Body Regular (14px)
Focus: Border #0EA5E9, Box-Shadow: 0 0 0 3px rgba(14, 165, 233, 0.1)
Placeholder: #9CA3AF (gray-400)
```

**Slider (Intensity 1-10):**
```
Track Height: 4px
Track Color: #E5E7EB
Thumb: 16px circle, #0EA5E9
Range Color: #0EA5E9
No labels (visual only, value shows in tooltip)
```

**Toggle/Checkbox:**
```
Off: Border #E5E7EB, white background
On: Background #0EA5E9, checkmark white
Size: 20x20px
Margin: 8px right
```

### Modals

```
Background: White
Border-Radius: 16px
Padding: 24px
Box-Shadow: 0 20px 25px rgba(0,0,0,0.15)
Max-Width: 450px
Overlay: Transparent black (20% opacity)
```

**Mobile (Full-Screen):**
```
Position: Fixed bottom-0
Border-Top-Left-Radius: 16px
Border-Top-Right-Radius: 16px
Slide-Up animation (150ms)
```

### Badges & Indicators

**Achievement Badge:**
```
Display: Inline-flex
Background: Linear-gradient(135deg, #0EA5E9, #06B6D4)
Color: White
Padding: 8px 12px
Border-Radius: 20px
Font: Body Small (12px) Bold
Icon: 12x12px emoji (🏆, 🎉, etc.)
```

**Status Indicator:**
```
Success (sober): Green circle + "Day 14"
Warning (struggling): Amber circle + "3 cravings today"
Neutral (tracking): Gray circle + "Normal day"
Size: 8px dot + text
```

---

## Screens & Layouts

### 1. Dashboard (Main View)

```
┌─────────────────────────────────┐
│  🚭 Paul's Quit Journey         │
│  Quit date: Jan 14, 2026        │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  14 DAYS SOBER                  │
│  ███████████░░░░░ (70% of goal) │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 💰 Money Saved          €84      │
│ 🚬 Cigs Not Smoked      168      │
│ 🕐 Time Since Craving   2h ago  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ [Log Craving]       [Statistics] │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ This Week                       │
│ Mon: 1 craving                  │
│ Tue: 0 cravings ✓              │
│ Wed: 2 cravings                 │
│ Thu: 1 craving                  │
│ Fri: 3 cravings (stressed?)     │
│ Sat: 0 cravings ✓              │
│ Sun: 0 cravings ✓              │
└─────────────────────────────────┘
```

**Color Coding:**
- Green checkmark = 0 cravings (victory)
- Amber = 2-3 cravings (normal)
- Red = 4+ cravings (hard day)

### 2. Log Craving (Modal/Full-Screen Mobile)

```
┌─────────────────────────────────┐
│ I'm Having a Craving            │
├─────────────────────────────────┤
│                                 │
│ How strong? (1-10)              │
│                                 │
│ 1 [====●═══════════] 10         │
│ Mild              Intense       │
│                                 │
├─────────────────────────────────┤
│ What triggered it?              │
│                                 │
│ ☐ Stress                        │
│ ☐ Social (friends smoking)      │
│ ☐ Bored                         │
│ ☐ After meal                    │
│ ☐ Morning coffee                │
│ ☐ Other:                        │
│   [________]                    │
│                                 │
├─────────────────────────────────┤
│ [Try Breathing] [Save & Close]  │
└─────────────────────────────────┘
```

**Flow:**
1. Open modal (1 tap from dashboard)
2. Slide intensity (default: 5)
3. Select triggers (multi-select)
4. Save → Modal closes → Dashboard updates in real-time

### 3. Accountability View (Friend)

```
┌─────────────────────────────────┐
│ 🤝 Supporting Paul              │
├─────────────────────────────────┤
│ Paul's Status Today:            │
│ • Days Sober: 14                │
│ • Cravings: 3                   │
│ • Mood: Good (morning), Okay    │
│   (evening)                     │
│ • Hardest Time: Friday 14:00    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Send Support Message?           │
│                                 │
│ Quick Options:                  │
│ [You got this!]                 │
│ [Proud of you!]                 │
│ [Thinking of you 💚]            │
│ [Custom message...]             │
│                                 │
│ (Paul gets notification + badge)│
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Paul's Week                     │
│ Mon-Sun: Craving count graph    │
│ Trend: Improving 📈             │
└─────────────────────────────────┘
```

---

## Animations & Micro-Interactions

**Button Click:**
- Duration: 100ms
- Effect: Subtle scale (1 → 0.98) + color shift
- Feedback: Instant visual confirmation

**Modal Open:**
- Duration: 150ms
- Effect: Fade-in + slide-up (mobile) or center expand (desktop)

**Craving Logged:**
- Duration: 300ms
- Effect: Toast notification (bottom-right) with checkmark + slide-out after 3s
- Text: "Craving logged ✓. You're handling this!"

**Day Milestone:**
- Duration: 500ms
- Effect: Confetti animation (subtle, only on dashboard)
- Sound: Optional celebratory ping (if notifications enabled)

**Streak Break (Slip):**
- Duration: 200ms
- Effect: Card shake (10px left-right, 3x)
- Tone: Neutral ("Learning data") not punitive

---

## Responsive Design

### Mobile (320px - 639px)
- Full-screen modals (not centered)
- Stacked cards (single column)
- Large touch targets (48px minimum)
- Buttons: Full width or 2-per-row

### Tablet (640px - 1023px)
- 2-column layouts
- Centered modals (max 450px)
- Buttons: Inline where space allows

### Desktop (1024px+)
- 3-column layouts
- Sidebar navigation (future)
- Larger typography
- Whitespace emphasis

---

## Accessibility

**WCAG AA Minimum:**
- Color contrast: 4.5:1 for text, 3:1 for UI components
- Focus states: Visible outline (2px, 0.5px offset)
- Keyboard navigation: Tab through all interactive elements
- Alt text: All icons + avatars described
- Font size: Minimum 14px body text
- Line height: 1.5x minimum (readability)

**Screen Reader:**
- Buttons labeled with aria-label (not icon-only)
- Form inputs linked with labels
- Modal: role="dialog" + focus trap
- Loading states: aria-busy="true"

---

## Dark Mode: Intentionally Omitted

**Why?**
- Quit-smoking apps need calm, focused environment
- Dark mode = "intense" psychologically
- Health/wellness UIs benefit from light backgrounds
- Life OS doesn't use dark mode
- Precedent: Smokefree, Kwit, most health apps use light UI

**If requested later:** Use CSS custom properties (--color-primary, --color-bg) for easy toggle. For now: light only.

---

## Design System Tokens

```css
/* Spacing */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;

/* Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;

/* Shadow */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);

/* Transitions */
--transition-fast: 100ms ease-out;
--transition-base: 150ms ease-out;
--transition-slow: 300ms ease-out;
```

---

## Anti-Patterns (What NOT to Do)

❌ **Aggressive red warnings** ("You're failing!")  
❌ **All-caps encouragement** ("YOU'RE AMAZING!")  
❌ **Dark mode intensity** (looks like a health scare)  
❌ **Too many metrics** (paralyzes users with data)  
❌ **Emojis overload** (unprofessional)  
❌ **Notifications spam** (every craving = 10 messages)  
❌ **Leaderboards** (competitive = bad for mental health)  
❌ **Mascots/characters** (feels patronizing)  

---

## Implementation Notes

**For Developer:**
- Use TailwindCSS for rapid iteration
- shadcn/ui for base components (button, modal, input)
- Customize colors via `tailwind.config.js`
- Test with: macOS Safari, iPhone 14, iPad Air
- Performance: All transitions < 300ms, no jank

**For Designer (Future Refinement):**
- Figma community: Use as living design system
- Components library: Build reusable in Figma + code
- Design tokens: Sync to Storybook (optional)

---

## References (Inspiration)

**Visual Style:**
- [Smokefree App](https://smokefreeapp.com) — Minimal, clean
- [Kwit App](https://kwit.app) — Rich dashboard, data-focused
- [Life OS](https://gtdpopeye.netlify.app) — Teal palette, minimal design

**Color Psychology:**
- Teal = calm, focused, trustworthy
- Green = growth, health, positive
- White = cleanliness, clarity, simplicity

**UX Patterns:**
- [Habit tracking](https://www.streaks.com/) (but without streak anxiety)
- [Mood journaling](https://moodpath.de) (simple daily check-in)
- [Accountability partners](https://www.joinclarity.com) (support without judgment)

---

**This spec is:** Production-ready for Figma design + handoff to dev  
**Next step:** Designer creates Figma file → Dev implements components  
**Timeline:** Design review → Day 1 of Week 1 dev
