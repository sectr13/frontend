# Amraa Nets — Dashboard Spec

**Version:** 1.0  
**Route:** `/dashboard`  
**Current files:**
- `apps/user/src/sections/user/dashboard/index.tsx`
- `apps/user/src/sections/user/dashboard/content.tsx`
- `apps/user/src/sections/user/sidebar-right.tsx`
- `apps/user/src/sections/user/layout.tsx`

---

## 1. Current Problems

### `content.tsx`

| Problem | Location |
|---|---|
| 2×4 number grid (`font-bold text-2xl`) makes stats hard to scan | `<ul className="grid grid-cols-2 ... lg:grid-cols-4">` |
| Subscription URLs buried inside accordion — users miss them | `<Accordion>` wrapping URLs |
| QR code hidden inside the same accordion, only visible on desktop (`hidden lg:flex`) | `<QRCodeCanvas>` |
| App download grid (6 columns) is visually overwhelming | `grid-cols-2 ... xl:grid-cols-6` |
| Platform tab filter and protocol filter shown together — confusing | Two `<Tabs>` rows |
| `mix-blend-difference` watermark is inaccessible and harsh | `pointer-events-none absolute` overlay |
| "Expired/Finished" subscriptions hidden via `hidden opacity-60 blur grayscale` | `item.status === 4` |
| "Purchase Subscription" button competes with "Refresh" button in the same row | Both at top of the list |

### `sidebar-right.tsx`

| Problem | Location |
|---|---|
| Three separate mini-cards (Balance, Gift, Commission) stacked vertically feel like an ISP panel | Three `<Card>` elements |
| Invite code card with raw `refer_code` string shows no context | Last `<Card>` |
| Visible only at `2xl` breakpoint — most users never see it | `hidden 2xl:flex` |

---

## 2. Dashboard Layout

### Overall Structure

```
[Page heading: "Overview"]

[Announcement banner — pinned, if any]

[Active service cards  ←  primary section]

[Quick actions row  ←  secondary]
```

No right sidebar on mobile or tablet. On `2xl` screens the right sidebar collapses into the page header bar area (see §4).

### Page Heading

```html
<h1 class="text-xl font-semibold mb-6">Overview</h1>
```

Shown inside the main `SidebarInset`. Not inside a card. Simple, grounded.

---

## 3. Service Card (Network Subscription)

Each active subscription gets one card. This is the central UI element of the dashboard.

### Card Anatomy

```
┌─────────────────────────────────────────────────────────┐
│  [Plan name]                              [Active ●]    │
│  Expires 24 Jun 2026  ·  14 days left                   │
│                                                         │
│  Traffic used                                           │
│  [▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░]  45.2 GB of 100 GB  (45%)   │
│                                                         │
│  [Renew]  [Reset Traffic]  [···  More]                  │
└─────────────────────────────────────────────────────────┘
```

**Header row:**
- Plan name: `text-base font-semibold`
- Active badge: right-aligned, success green (see Design System §8)
- For expired: `opacity-70` on the entire card + "Expired" badge in red replacing "Active"

**Expiry row:**
- `text-sm text-muted-foreground`
- If `expire_time === 0`: show "No expiry"
- If expiry within 7 days: `text-[--color-warning]` + amber badge "Expiring soon"
- If expired: `text-destructive`

**Traffic section:**

Uses `<Progress>` component from shadcn. Section label `text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2`.

- Progress bar: `h-2`, color logic from Design System §10
- Below bar: `text-sm text-muted-foreground` — "X GB of Y GB (Z%)"
- If unlimited traffic: no progress bar, show "Unlimited traffic" in `text-sm text-muted-foreground`
- If reset is scheduled: add `· Resets in N days` after the traffic line

**Action buttons (bottom of card):**

Three buttons in a `flex flex-wrap gap-2` row:
1. `<Renewal>` — button `variant="outline" size="sm"` label "Renew"  
   Only shown if `item.expire_time !== 0 && item.subscribe.sell`
2. `<ResetTraffic>` — button `variant="outline" size="sm"` label "Reset Traffic"
3. `<Button variant="ghost" size="sm">···</Button>` → opens `<DropdownMenu>` with:
   - "Subscription URL" → triggers copy panel (see §3.1)
   - "QR Code" → opens dialog (see §3.2)
   - "Cancel subscription" → `<Unsubscribe>` trigger (destructive, requires confirmation)

**Status states:**

| `item.status` | Card treatment |
|---|---|
| 0 (Pending) | Badge "Pending" `variant="outline"`, action buttons hidden except Cancel |
| 1 (Active) | Normal card |
| 2 (Finished/Cancelled) | `opacity-60`, "Cancelled" badge, no action buttons |
| 3 (Expired, expire_time != 0) | `opacity-70`, "Expired" badge in red, show Renew button only |
| 4 (Deducted) | Card fully hidden — `hidden` class, same as now |

Remove the `mix-blend-difference` watermark. The badge and opacity together communicate status clearly without visual distortion.

### 3.1 Subscription URL Copy Panel

Triggered from the "···" menu "Subscription URL" item. Opens a `<Sheet>` from the bottom on mobile, or a `<Sheet>` from the right on desktop.

Sheet contents:

```
[Sheet title: "Subscription URL"]

[Platform tab row: Windows | macOS | Linux | iOS | Android | HarmonyOS]
[Protocol tab row: All | VLESS | VMESS | etc. — only if >1 protocol exists]

[Credential Block: URL 1]
[Credential Block: URL 2, if multiple]

[App grid: download + import buttons for compatible apps]
```

The subscription URL is shown using the **Credential Block** component from the Design System. Copy button with state machine.

The app download/import grid below the URL: use a `grid grid-cols-3 sm:grid-cols-4 gap-4`. Each app: icon + name on top, Download + Import buttons below. Compact. Not 6 columns.

### 3.2 QR Code Dialog

Opens a `<Dialog>` (not accordion, not hidden div).

Contents: centered `<QRCodeCanvas>` at `size={200}`, title "Scan to subscribe", and a copy button below for the URL. No other content.

---

## 4. Right Sidebar / Account Summary

### Problem

The current right sidebar (`sidebar-right.tsx`) is only visible at `2xl` breakpoint (very wide screens). Balance, Gift Amount, and Commission are three separate mini-cards stacked vertically — this mimics a financial dashboard widget style that doesn't fit a SaaS product.

### Redesign: Inline Account Bar

Remove the right sidebar entirely.

Instead, show account summary **in the page content area** below the service cards, as a compact row.

```
┌─────────────────────────────────────────────────────────┐
│  Account                                                │
│  Balance: $24.00  ·  Gift: $5.00  ·  Referral: $0.00   │
│                         [Top Up →]                      │
└─────────────────────────────────────────────────────────┘
```

This is a single card with:
- Title: "Account" (text-sm font-medium text-muted-foreground)
- Values inline: Balance + Gift + Commission separated by `·`
- "Top Up" button: `variant="outline" size="sm"` — triggers existing `<Recharge>` dialog
- Invite code: shown only if `user.refer_code` exists, as a Credential Block below the values row

At `2xl` screens, this card can move back to the right sidebar if preferred — but the right sidebar layout is optional, not required.

---

## 5. Empty Dashboard (No Active Subscriptions)

When `userSubscribe.length === 0`:

```
[Page heading: "Overview"]

[Announcement banner if any]

┌─────────────────────────────────────────────────────────┐
│                                                         │
│         [network icon, 40px, muted]                    │
│         No active services                             │
│         Browse plans to get started.                   │
│                                                         │
│         [Browse Network plans →]                       │
│         [Explore AmraaNet →]                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Two call-to-action links:
- "Browse Network plans →" → navigates to `/subscribe`
- "Explore AmraaNet →" → navigates to `/amraanet`

This replaces the current behavior of rendering `<Subscribe>` inline on the dashboard when there are no subscriptions. The subscribe flow should live at `/subscribe`, not be embedded on the dashboard.

---

## 6. Loading State

While `isLoading === true` from the `queryUserSubscribe` query, show service card skeletons.

Show 1 skeleton card (most users have 1 subscription). If the app can infer from local storage that the user had N subscriptions last visit, show N skeletons.

Skeleton card height should approximate a real card (approx 200px). See Design System §14 for skeleton anatomy.

---

## 7. Announcement Banner

The pinned announcement (`<Announcement type="pinned">`) renders above the service cards.

**Keep the current component** but apply design system styling:

- Background: `bg-[--color-warning-bg] border border-[--color-warning]/20 rounded-xl`
- Icon: bell icon in amber
- Text: `text-sm text-foreground`
- Dismiss button: `variant="ghost" size="icon"` at the right edge

Do not use a full-width alert stripe. Use a contained card-style banner.

---

## 8. Platform + Protocol Tabs (Simplified)

Currently, platform tabs and protocol tabs both appear at the top of the subscription list, making the header area complex. These tabs exist to filter download link recommendations and subscription URL protocols.

**Redesign:** Move both tab filters INSIDE the Subscription URL sheet (§3.1). They only need to be visible when the user is looking at URLs.

On the main dashboard, remove the platform/protocol tab rows entirely. The subscription card just shows the subscription name, traffic, expiry, and three action buttons.

This simplifies the dashboard significantly. The platform tabs are still fully functional — just relocated to where they're actually needed.

---

## 9. i18n Keys Needed

All existing keys in `dashboard.json` are reused. New copy needed:

```json
{
  "overview": "Overview",
  "noActiveServices": "No active services",
  "noActiveServicesDesc": "Browse plans to get started.",
  "browseNetwork": "Browse Network plans",
  "exploreAmraaNet": "Explore AmraaNet",
  "expiresIn": "Expires in {{days}} days",
  "expiresOn": "Expires {{date}}",
  "noExpiry": "No expiry",
  "expiringSoon": "Expiring soon",
  "trafficUsed": "{{used}} of {{total}} ({{percent}}%)",
  "unlimitedTraffic": "Unlimited traffic",
  "resetsIn": "Resets in {{days}} days",
  "subscriptionUrl": "Subscription URL",
  "moreActions": "More",
  "account": "Account",
  "topUp": "Top Up"
}
```

---

## 10. What Does NOT Change

- All existing query calls (`queryUserSubscribe`, `resetUserSubscribeToken`, `getClient`, `getStat`)
- `<Renewal>`, `<ResetTraffic>`, `<Unsubscribe>` components — keep as-is, just trigger them from the redesigned card
- Subscription URL generation (`getUserSubscribe`, `getAppSubLink` from global store)
- QR code generation (still uses `QRCodeCanvas`, just in a dialog)
- Platform detection (`getPlatform()`)
- Protocol filtering logic
- `CopyToClipboard` wrapper (keep, just change the button state)
