# Amraa Nets — Network Product Spec

**Version:** 1.0  
**Route:** `/subscribe`  
**Product:** Network (proxy/VPN subscription)  
**Current files:**
- `apps/user/src/sections/subscribe/index.tsx` — plan list (purchase)
- `apps/user/src/sections/subscribe/detail.tsx` — plan detail
- `apps/user/src/sections/subscribe/billing.tsx` — billing summary
- `apps/user/src/sections/subscribe/duration-selector.tsx` — period picker
- `apps/user/src/sections/subscribe/renewal.tsx` — renew dialog
- `apps/user/src/sections/subscribe/reset-traffic.tsx` — reset dialog
- `apps/user/src/sections/subscribe/unsubscribe.tsx` — cancel dialog
- `apps/user/src/sections/subscribe/recharge.tsx` — wallet top-up dialog

---

## 1. Route Purpose

The `/subscribe` route serves two distinct user states:

1. **User has no active subscriptions** → show plan catalog, prompt purchase
2. **User has active subscriptions** → show service management (currently on dashboard)

**Current issue:** The dashboard shows service cards, and `/subscribe` shows the plan purchase flow. These are two separate pages. This is correct and should remain so.

What changes: the `/subscribe` page needs a clearer split between "I'm here to buy" vs "I'm here to manage my existing service." Currently it only shows the purchase flow.

**Proposal:** `/subscribe` remains the purchase page. Active service management stays on `/dashboard`. The Network section of the dashboard gets the service card redesign described in `AMRAANETS_DASHBOARD_SPEC.md`. This document focuses on the **purchase flow** at `/subscribe`.

---

## 2. Current Purchase Flow Problems

The current `/subscribe` experience:

1. Shows a list of plan cards
2. User clicks a plan → opens a detail panel
3. Selects duration
4. Applies optional coupon
5. Reviews billing
6. Chooses payment method
7. Pays

This is functionally correct. The UX problems are:

| Problem | Detail |
|---|---|
| Plan cards are too information-dense | Show speed limit, traffic, device limit, price all at once |
| Duration selector is separated from the plan card | User has to scroll/click to find pricing |
| Billing summary uses accounting-style line items | Not friendly for typical users |
| Payment method selector has no visual hierarchy | All methods look equally secondary |
| No clear progress indicator in the flow | Users don't know how many steps remain |

---

## 3. Plan Catalog Page

The plan catalog is the entry point. It should answer one question: **"Which plan is right for me?"**

### Layout

```
[Page heading: "Network"]
[Subheading: "Choose a plan that fits your needs"]

[Duration selector row — ABOVE plan cards]

[Plan card grid]
```

### Duration Selector (Repositioned)

Move the duration selector **above** the plan card grid, not inside a drawer. This lets users see prices update immediately when they change the duration.

```
[Duration pills: 1 Month | 3 Months | 6 Months | 1 Year | ...]
```

- Pills, not dropdown
- Active pill: `bg-primary text-primary-foreground`
- Inactive pill: `variant="outline" size="sm"`
- When selected, all plan cards update their displayed price

### Plan Card

```
┌──────────────────────────────────────────┐
│  [Plan name]               [Recommended] │
│  [Short description]                     │
│                                          │
│  $9.99 / month                           │
│  Billed $29.97 for 3 months              │
│                                          │
│  ✓ 100 GB traffic                        │
│  ✓ Unlimited speed                       │
│  ✓ 3 devices                             │
│                                          │
│  [────────── Get Started ─────────────]  │
└──────────────────────────────────────────┘
```

**Plan name:** `text-base font-semibold`  
**Description:** `text-sm text-muted-foreground` — optional, shown only if not empty  
**Price:** `text-2xl font-semibold text-foreground` + `text-sm text-muted-foreground` for period  
**Billed line:** `text-xs text-muted-foreground` — total for the selected duration  
**Feature list:** `text-sm text-foreground` with checkmark icons in `text-primary`  
**CTA:** `<Button className="w-full">` — "Get Started" (not "Buy Now" — friendlier)  

**Recommended plan variant:**
- `ring-2 ring-primary ring-offset-2` on the card
- "Recommended" badge in primary blue, top-right corner of card
- Do not change the background color — the ring is sufficient

**Feature display logic:**

Show only the most useful 3 features. Priority order:
1. Traffic (`XX GB traffic` or `Unlimited traffic`)
2. Speed (`XX Mbps limit` or `No speed limit`)
3. Devices (`Up to N devices` or `Unlimited devices`)

Do not show `0` values (e.g., if DeviceLimit = 0, show nothing). Use the word "Unlimited" for zero/null limits.

**Grid layout:** `grid gap-4 md:grid-cols-2 lg:grid-cols-3`  
On mobile: single column, cards stacked

---

## 4. Purchase Detail / Checkout

When user taps "Get Started" on a plan card, open a `<Sheet>` from the bottom (mobile) or right side (desktop).

### Sheet Contents

```
[Sheet title: plan name]

[Duration selector — same pills as catalog page, synced]

[Billing summary card]

[Coupon input — collapsed by default, "Have a coupon?" toggle]

[Payment method selector]

[Pay button]
```

### Billing Summary (Redesigned)

Replace the current accounting-style table with a friendly summary:

```
Plan          Network — 3 Months
Price         $29.97
Discount      –$5.00  (coupon: WELCOME)
──────────────────────────────────
Total         $24.97
```

- Labels: `text-sm text-muted-foreground`
- Values: `text-sm font-medium text-foreground`
- Discount line: `text-[--color-success]` — positive emphasis
- Total row: `text-base font-semibold` with `<Separator>` above it
- This is a visual presentation, not an `<Table>` element

### Coupon Input

Hidden by default. A `text-sm text-primary cursor-pointer` toggle: "Have a coupon code?"

When expanded:
```
[Input: placeholder "Enter coupon code"]  [Apply]
```
Uses existing `<CouponInput>` component logic. No visual change needed beyond applying the Design System input style.

### Payment Method Selector

Current: a list of payment methods with radio or click selection.

**Redesign:** Show payment methods as selection cards.

```
┌──────────────────────────┐  ┌──────────────────────────┐
│  [icon]  Stripe          │  │  [icon]  Cryptocurrency  │
└──────────────────────────┘  └──────────────────────────┘
```

- Each method: `border rounded-xl p-4 cursor-pointer`
- Selected: `border-primary ring-1 ring-primary bg-primary/5`
- Unselected: `border-border hover:border-primary/50`
- Icon: 24px, method name: `text-sm font-medium`

### Pay Button

`<Button className="w-full mt-4" size="lg">` — "Pay $24.97"  
Show the total amount in the button label.  
Disabled until a payment method is selected.

---

## 5. After Purchase (Payment Confirmation)

Current: navigates to `/payment` route.

This flow is out of scope for the visual redesign — payment processing pages have specific constraints. Do not change the payment completion route or logic.

**Only ensure:** the redirect back from payment lands the user on `/dashboard` where they can see their newly active service card.

---

## 6. Renewal Dialog

Triggered from the service card's "Renew" button (on dashboard, per `AMRAANETS_DASHBOARD_SPEC.md`).

Uses existing `<Renewal>` component. Visual changes:

- Use `<Dialog>` not `<Sheet>` for renewal (it's a short confirmation, not a multi-step flow)
- Dialog title: "Renew [Plan Name]"
- Show current expiry date prominently
- Duration selector: same pills as above
- Billing summary: same simplified format
- Confirm button: `<Button className="w-full">` "Renew for $XX"

**All existing Renewal logic and API calls unchanged.**

---

## 7. Reset Traffic Dialog

Triggered from the service card's "Reset Traffic" button.

Uses existing `<ResetTraffic>` component. Visual changes:

- `<Dialog>` with:
  - Title: "Reset traffic"
  - Description: "This will reset your used traffic to zero. Current usage: XX GB."
  - Cost line (if `replacement > 0`): "Cost: $X.XX"  
    (If free: show "Free" in success green)
  - Cancel + Confirm buttons
  
**All existing ResetTraffic logic and API calls unchanged.**

---

## 8. Cancel Subscription Dialog

Triggered from the service card's "···" menu → "Cancel subscription".

Uses existing `<Unsubscribe>` component. This is a destructive action.

- `<AlertDialog>` (not `<Dialog>`)
- Title: "Cancel subscription"
- Description: "Your service will remain active until the end of the current billing period. After that, it will not renew."
- If `allow_deduction` is true: add "A cancellation fee may apply per your plan terms."
- Cancel button: `variant="outline"` — "Keep my plan"
- Confirm button: `variant="destructive"` — "Yes, cancel"

**All existing Unsubscribe logic and API calls unchanged.**

---

## 9. Subscription URL Interaction

The subscription URL is the most-used feature for Network users (it's what their VPN clients use). Its discoverability matters.

**Current issue:** Buried inside an accordion inside the service card.

**Redesign:** Available from the service card's "···" menu → "Subscription URL" → opens a bottom sheet (as described in `AMRAANETS_DASHBOARD_SPEC.md §3.1`).

On the sheet, the URL is shown in a **Credential Block** (Design System §11):

```
Subscription URL                           [Copy]
┌─────────────────────────────────────────────┐
│  https://sub.example.com/api/v1/...token... │
└─────────────────────────────────────────────┘
```

For users who have multiple URLs (multiple protocols), show each as a separate Credential Block with the protocol name as the label.

**Copy interaction:**
- Button changes to "Copied ✓" in success green for 2 seconds
- Toast notification shown as secondary accessibility feedback

**QR Code:**
- A "Show QR code" toggle below the credential block
- When expanded: centered `<QRCodeCanvas size={200}>`
- No separate dialog needed — inline expansion is friendlier

---

## 10. App Client Download Grid (Simplified)

Current: 2–6 column grid with app icon + name + Download + Import buttons per app.

**Redesign:** Available inside the Subscription URL sheet, below the credential block.

```
Compatible apps

[App icon + name]      [App icon + name]      [App icon + name]
[Download] [Import]    [Download] [Import]    [Download] [Import]
```

Grid: `grid grid-cols-2 sm:grid-cols-3 gap-4`

Each app item:
- App icon: 40px, centered
- App name: `text-xs text-muted-foreground` centered below icon
- Download button: `variant="secondary" size="sm"` (links out to download URL)
- Import button: `variant="default" size="sm"` (triggers deep link / copy)

Both buttons are present only if the respective link exists. If only one exists, it is full-width.

**Platform filter:** The platform tab selector that controls which download links appear remains inside the Subscription URL sheet (above the app grid). This removes it from the main dashboard page entirely.

---

## 11. i18n Keys for Network

Existing keys in `subscribe.json` are reused. New keys needed:

```json
{
  "network": "Network",
  "choosePlan": "Choose a plan that fits your needs",
  "getStarted": "Get Started",
  "billedAs": "Billed {{amount}} for {{duration}}",
  "recommended": "Recommended",
  "unlimitedTraffic": "Unlimited traffic",
  "unlimitedSpeed": "No speed limit",
  "unlimitedDevices": "Unlimited devices",
  "trafficGb": "{{amount}} GB traffic",
  "speedMbps": "{{speed}} Mbps",
  "devicesN": "Up to {{n}} devices",
  "haveCoupon": "Have a coupon code?",
  "payAmount": "Pay {{amount}}",
  "keepPlan": "Keep my plan",
  "cancelConfirmDesc": "Your service will remain active until the end of the current billing period.",
  "showQrCode": "Show QR code",
  "compatibleApps": "Compatible apps"
}
```

---

## 12. What Does NOT Change

- All API calls: `querySubscribeList`, `createOrder`, `queryOrderList`, `closeOrder`
- `<Renewal>` component logic
- `<ResetTraffic>` component logic  
- `<Unsubscribe>` component logic
- `<Recharge>` component logic
- Coupon validation API call
- Payment method fetching API call
- Deep link / scheme URL generation (`getAppSubLink`)
- Platform detection logic
- QR code value computation (still uses the subscription URL directly)
- All existing route handlers
