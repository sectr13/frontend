# Amraa Nets — User Portal Design System

**Version:** 1.0  
**Scope:** `apps/user` only — user-facing portal  
**Framework:** Tailwind CSS v4 + shadcn/ui + `oklch()` tokens  
**Rule:** All tokens map to existing CSS variable names in `packages/ui/src/styles/globals.css`. No new token layer needed.

---

## 1. Design Intent

The portal should feel like a product the user chose — not a panel they were given access to.

Every visual decision serves three user needs:

1. **Status at a glance** — is my service working right now?
2. **Action without hunting** — renew, copy, connect without reading
3. **Confidence** — this feels like a real company made this

---

## 2. Color Tokens

### Mapping: Design Spec → CSS Variables

The existing `globals.css` uses `oklch()` colors. The values below are the nearest hex equivalents for design reference. Implementation uses the existing CSS variable names unchanged.

| Design role | CSS variable | Approx hex | Usage |
|---|---|---|---|
| Page background | `--background` | `#F8FAFC` (light) | Page canvas |
| Card surface | `--card` | `#FFFFFF` | All cards |
| Card text | `--card-foreground` | `#0F172A` | Card content |
| Primary action | `--primary` | `#38BDF8` | CTA buttons, links, active states |
| Primary text | `--primary-foreground` | `#F0F9FF` | Text on primary buttons |
| Muted surface | `--muted` | `#F1F5F9` | Code backgrounds, inset surfaces |
| Muted text | `--muted-foreground` | `#64748B` | Labels, helper text, metadata |
| Border | `--border` | `#E2E8F0` | Card edges, dividers |
| Destructive | `--destructive` | `#EF4444` | Delete, cancel, error |
| Success (add custom) | `--color-success` | `#10B981` | Active badge, online dot, copy confirm |
| Success bg (add custom) | `--color-success-bg` | `#F0FDF4` | Active badge background |
| Warning (add custom) | `--color-warning` | `#F59E0B` | Expiring soon, low traffic |

**Two new tokens to add** (do not conflict with existing shadcn tokens):

```css
:root {
  --color-success: oklch(0.696 0.17 162.48);      /* #10B981 */
  --color-success-bg: oklch(0.971 0.048 154.14);  /* #F0FDF4 */
  --color-warning: oklch(0.769 0.184 70.08);       /* #F59E0B */
  --color-warning-bg: oklch(0.987 0.026 85.87);    /* #FFFBEB */
}
```

### Color Discipline

- **Blue** (`--primary`): Only for primary CTA buttons, active nav states, active tab pills, copy confirmation feedback
- **Success green**: Active service status badge, online device dot, copy confirmation button state
- **Warning amber**: Expiry < 7 days, traffic > 90% used
- **Destructive red**: Delete actions, error states only
- **Neutral only** for all structural elements — borders, backgrounds, labels

**Forbidden:**
- Gradient fills on any interactive element
- Blue tinting card backgrounds
- Multiple accent colors on the same card

---

## 3. Typography

Use the system font stack already in place. No custom font loading.

### Scale

| Name | Tailwind class | Size | Weight | Line-height | Usage |
|---|---|---|---|---|---|
| Display | `text-2xl font-semibold` | 24px | 600 | 1.25 | Page section hero headings |
| Title | `text-lg font-semibold` | 18px | 600 | 1.3 | Card titles |
| Subtitle | `text-base font-medium` | 16px | 500 | 1.4 | Sub-section labels |
| Body | `text-sm` | 14px | 400 | 1.55 | Standard body, card content |
| Label | `text-xs font-medium` | 12px | 500 | 1.4 | Field labels, uppercase section headers |
| Caption | `text-xs` | 12px | 400 | 1.4 | Timestamps, metadata, helper text |
| Code | `font-mono text-sm` | 13px | 400 | 1.6 | Credential values, URLs |
| Code-sm | `font-mono text-xs` | 12px | 400 | 1.5 | IP addresses, machine keys |

### Rules

- Headings cap at weight 600. No `font-bold` (700) or heavier in dashboard UI
- Body text color: `text-foreground` (primary) or `text-muted-foreground` (secondary)
- Labels above fields: `text-xs font-medium text-muted-foreground uppercase tracking-wide`
- Never truncate credential values, IP addresses, or commands
- Relative times ("3 hours ago") preferred over raw ISO strings — use a utility function

---

## 4. Spacing Scale

8px base grid. These Tailwind classes are the reference:

| Step | px | Tailwind | Usage |
|---|---|---|---|
| 1 | 4 | `gap-1` / `p-1` | Icon-to-text gap, tight inline |
| 2 | 8 | `gap-2` / `p-2` | Badge padding, compact row gap |
| 3 | 12 | `gap-3` / `p-3` | Between label and value |
| 4 | 16 | `gap-4` / `p-4` | Standard card section gap |
| 5 | 20 | `gap-5` / `p-5` | — |
| 6 | 24 | `gap-6` / `p-6` | Card internal padding |
| 8 | 32 | `gap-8` / `p-8` | Between major page sections |
| 10 | 40 | `gap-10` | — |
| 12 | 48 | `py-12` | Page top/bottom padding |

**Card internal padding:** `p-6` on desktop, `p-4` on mobile. Consistent. No exceptions.

**Section gap:** `gap-6` between cards in a page. `gap-4` within a card between sub-sections.

---

## 5. Radius

| Level | Value | Tailwind | Usage |
|---|---|---|---|
| sm | 6px | `rounded-md` | Badges, inline code, small pills |
| md | 8px | `rounded-lg` | Buttons, inputs, dropdown items |
| lg | 12px | `rounded-xl` | Cards |
| xl | 16px | `rounded-2xl` | Dialogs, sheets |
| full | 9999px | `rounded-full` | Status dots, avatar |

The current `--radius: 0.625rem` (10px) in globals is the base. Use `rounded-xl` (12px) for cards as the standard.

---

## 6. Shadows

Two levels only. Do not use `shadow-lg` or heavier — it reads as modal or marketing.

| Level | Class | Usage |
|---|---|---|
| Card | `shadow-sm ring-1 ring-black/[0.04]` | All content cards |
| Elevated | `shadow-md ring-1 ring-black/[0.06]` | Active/focused card, open sheets |

Dark mode: replace `ring-black/[0.04]` with `ring-white/[0.06]`.

---

## 7. Card System

All cards use the shadcn `<Card>` component. Do not build custom card containers.

### Standard Card

```
padding: p-6 (24px all sides)
radius: rounded-xl
shadow: shadow-sm ring-1 ring-black/[0.04]
background: bg-card
```

### Section Header (inside a card)

```
label: text-xs font-medium text-muted-foreground uppercase tracking-wide
title: text-lg font-semibold text-foreground
gap between label and title: gap-1
gap between header and content: mt-4
```

### Status Overlay (replaces mix-blend watermark)

When a service is expired or finished, apply to the card:
- `opacity-60` on the card
- A `<Badge>` with status text in the card header (e.g. "Expired", "Cancelled")
- **Do NOT use** the current `mix-blend-difference` watermark — it is visually harsh and inaccessible

---

## 8. Badge System

Use shadcn `<Badge>` only. Do not create inline `<span>` styled as badges.

| State | Variant / Classes | Use case |
|---|---|---|
| Active | `bg-[--color-success-bg] text-[--color-success] border-[--color-success]/20` | Active subscription, online device |
| Inactive | `variant="secondary"` | Inactive, no subscription |
| Expired | `bg-destructive/10 text-destructive` | Expired subscription |
| Expiring soon | `bg-[--color-warning-bg] text-[--color-warning]` | < 7 days to expiry |
| Pending | `variant="outline"` | Pending order, awaiting payment |
| Neutral | `variant="secondary"` | Plan name, period label, IP address |

All badges: `text-xs font-medium`, `rounded-md` (not `rounded-full`), horizontal padding `px-2`.

---

## 9. Button System

Use shadcn `<Button>` variants only.

| Variant | Usage | Notes |
|---|---|---|
| `default` (primary) | Subscribe, Get Started, Confirm payment | Blue fill, white text |
| `secondary` | Download app, Import link | Neutral, less prominent |
| `outline` | Renew, Reset traffic, Copy (default) | Border, no fill |
| `ghost` | Icon-only row actions, sidebar nav items | No border, hover bg |
| `destructive` | Delete device, Cancel subscription | Red — requires confirmation |
| `link` | Inline text links | No decoration on hover |

### Size Usage

- `default` — primary CTA, card actions
- `sm` — inline row actions, secondary actions
- `icon` — single-icon buttons (copy, show/hide)

### Copy Button State Machine

This pattern applies wherever copy is used: auth key, login server, setup command, subscription URL, invite code.

```
State 1 — Default:
  [Copy icon]  Copy
  variant="outline"  text-muted-foreground

State 2 — Active (0ms to 2000ms after click):
  [Check icon]  Copied
  text-[--color-success]  border-[--color-success]/30

Transition: direct swap, no animation
Return after 2000ms: 200ms ease-in back to Default

Implementation: useState(false), setTimeout 2000ms reset
The check icon replaces the copy icon exactly (same size)
```

**Toast is supplemental.** The button state IS the primary confirmation. Toast may still be used as accessibility fallback but must not be relied upon as the only feedback.

---

## 10. Traffic Progress Bar

Replaces the current 2×4 number grid.

**Component structure:**

```
[Plan name]                          [XX GB used of YY GB]
[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░]   72%
```

- Use shadcn `<Progress>` component
- Progress bar height: `h-2` (8px)
- Color: `bg-primary` when < 80%, `bg-[--color-warning]` when 80–95%, `bg-destructive` when > 95%
- Values line: `text-sm text-muted-foreground` right-aligned
- Percentage badge: `text-xs font-medium` beside the bar label
- When traffic is unlimited: show "Unlimited" instead of a progress bar

---

## 11. Credential Block

Replaces `<Input readOnly>` for login server, auth key, subscription URLs, invite code.

**Anatomy:**

```
[Label text]                    [State: Copy / Copied ✓]
┌────────────────────────────────────────────────────────┐
│  value in monospace font, wraps naturally               │
└────────────────────────────────────────────────────────┘
```

- **Label**: `text-xs font-medium text-muted-foreground uppercase tracking-wide`
- **Copy button**: right-aligned with label, `variant="ghost" size="sm"`, state machine per §9
- **Value area**: `bg-muted rounded-lg px-4 py-3 font-mono text-sm text-foreground break-all`
- **Auth key variant**: adds show/hide toggle button alongside copy. Hidden state: `••••••••••••••••` (16 bullets, fixed). No layout shift.
- Value area is NOT an `<input>`. It is a `<div>` or `<code>` element — credentials are not form data.

---

## 12. Dark Code Block

For setup commands only. Signals "developer tool."

**Anatomy:**

```
┌── dark header bar ─────────────────────── [Copy command] ┐
│  $ tailscale up --login-server=https://...                │
│    --authkey=tskey-auth-...                               │
└───────────────────────────────────────────────────────────┘
```

- Header bar: `bg-slate-800 rounded-t-xl px-4 h-10 flex items-center justify-between`
- Header left label: platform/language hint in `text-xs text-slate-400`
- Header copy button: `text-xs text-slate-400 hover:text-slate-200`, state machine from §9
- Code area: `bg-slate-900 rounded-b-xl text-slate-200 font-mono text-sm leading-relaxed px-5 py-4`
- Command wraps naturally — never clipped, no horizontal scroll
- Long `--flags` indent with 2-space continuation on wrap

---

## 13. Device Row

Used in AmraaNet device list. Not a `<Table>` — a styled list.

**Row anatomy (desktop, min-height 64px):**

```
●  [Device name]         [IP badge]   [Last seen]   [···]
   [hostname if differ]
```

- **Status dot**: `size-2 rounded-full`
  - Online (LastSeen < 5 min): `bg-[--color-success]`, slow pulse animation (`animate-pulse`)
  - Offline: `bg-muted-foreground/40`, no animation
  - Unknown: `bg-muted-foreground/20`, no animation
- **Device name**: `text-sm font-medium text-foreground`
- **Hostname sub-label**: `text-xs text-muted-foreground` (only when different from GivenName)
- **IP badge**: `font-mono text-xs bg-muted rounded-md px-2 py-0.5 text-muted-foreground`
- **Last seen**: `text-xs text-muted-foreground` — relative time ("2 min ago", "Yesterday")
- **Actions (···)**: `<Button variant="ghost" size="icon">` → opens `<DropdownMenu>` with "View details" and "Delete device"

**Mobile:** Status dot + Device name stacked with IP below. Last seen below IP. No separate actions column — swipe or tap reveals a contextual menu.

**Row separator:** `<Separator>` between rows. No outer card border needed when rows are clearly separated.

**Platform availability:** The current API does not expose platform type per device. Do NOT display a platform icon or column. Mark as future enhancement.

---

## 14. Skeleton Loading

Use `<Skeleton>` (shadcn) for all page-level loading. Spinners only for user-triggered actions.

### Service Card Skeleton

```
[Skeleton: 120px wide, 20px tall — card title]
[Skeleton: 80px wide, 16px — badge]
[Skeleton: full width, 8px — progress bar]
[Skeleton: 40px, 12px — traffic text]
[Row of 3 Skeletons: 80px each — action buttons]
```

### Credential Block Skeleton

```
[Skeleton: 80px, 12px — label]
[Skeleton: full width, 48px — value area]
```

### Device Row Skeleton

```
[Skeleton: 8px circle] [Skeleton: 120px, 16px] [Skeleton: 60px, 16px] [Skeleton: 80px, 12px]
```

Repeat 3 times with a separator between. `animate-pulse` on all.

### Rules

- Show skeleton immediately on mount (before the first query resolves)
- Do not flash between skeleton and content — use `isLoading` not `!data`
- Do not show empty state while still loading

---

## 15. Empty States

Every empty state has three parts:

1. **Icon** — neutral, 40px, `text-muted-foreground/50`
2. **Title** — `text-sm font-medium text-muted-foreground` — what happened
3. **Action** — `text-sm text-muted-foreground` — what to do next, optionally with a `<Button>`

### Catalog

| Context | Title | Action |
|---|---|---|
| No active subscriptions | "No active services" | "Browse plans →" (link to /subscribe) |
| No orders | "No orders yet" | "Your purchase history will appear here." |
| No wallet transactions | "No transactions yet" | "Transactions appear after your first purchase." |
| No devices (AmraaNet) | "No devices connected" | "Connect your first device using the setup command above." |
| No plans available | "No plans available right now" | "Check back soon — plans will be listed here when ready." |
| Support tickets empty | "No tickets" | "Need help? Open a support ticket." + Button "New Ticket" |
| Announcement empty | "No announcements" | "We'll post updates and news here." |

Empty states are placed inside the card where the content would appear. They do not replace the page — the section label and card chrome still render.

---

## 16. Responsive Rules

| Breakpoint | Tailwind | Behavior |
|---|---|---|
| Mobile | < `md` (768px) | Single column, `p-4` card padding, bottom nav bar |
| Tablet | `md`–`lg` | Single column, `p-6`, left sidebar hidden |
| Desktop | `lg`+ (1024px) | Left sidebar visible, main content max-w-3xl centered |
| Wide | `2xl`+ | Right sidebar visible (balance widget) |

### Mobile Specifics

- No horizontal scroll on credential blocks or code blocks (wrap instead)
- Device rows collapse to stacked layout (status dot + name + IP + last seen vertically)
- Tab bars wrap to two rows if items overflow one row — do not truncate
- Buttons in card footers are full-width on mobile: `w-full sm:w-auto`
- Copy button in credential blocks is full-width on very narrow viewports (< 360px)

### Max Content Width

Main content area: `max-w-3xl` (768px) on desktop. This applies to all user pages — services, AmraaNet, orders, wallet, profile. The portal is not a wide dashboard; it is a focused product interface.
