# Amraa Nets — User Navigation Spec

**Version:** 1.0  
**Scope:** `apps/user` navigation only  
**Current file:** `apps/user/src/layout/navs.ts`  
**i18n namespace:** `components` (key prefix: `menu.*`)

---

## 1. Problem with Current Navigation

The current navigation was designed to mirror the admin panel structure. Every label sounds like an administrative function:

| Current label | Problem |
|---|---|
| "Server Management" | Group name sounds like infrastructure management |
| "Subscribe" (item in "Server Management") | Ambiguous — sounds like an action, not a product |
| "User Detail" | Sounds like an admin viewing user data |
| "Order Management" | Users don't "manage orders" — they view purchase history |
| "Ticket Management" | Users open and view tickets, they don't "manage" them |
| "Document Management" | Documents are guides the user reads, not manages |
| "Announcement Management" | Same |
| "Commerce" | Group name is a business category, not a user concept |
| "Users & Support" | Group name mixes "users" (admin concept) with "support" |

**Goal:** Navigation should describe what the user has and where they go, not what the system does.

---

## 2. New Navigation Structure

### Desktop Sidebar

```
Dashboard

  My Services
    Network           /subscribe         uil:network-chart
    AmraaNet          /amraanet          uil:wifi

  Account
    Orders            /order             uil:receipt
    Wallet            /wallet            uil:wallet
    Referral          /affiliate         uil:users-alt
    Profile           /profile           uil:user-circle

  Help
    Guides            /document          uil:book-open
    Updates           /announcement      uil:bell
    Support           /ticket            uil:headphones
```

### Changes from Current

| Current title key | Current label (en-US) | New label (en-US) | New key |
|---|---|---|---|
| `menu.server` (group) | "Server Management" | "My Services" | `menu.services` |
| `menu.subscribe` | "Subscribe" | "Network" | `menu.network` |
| `menu.amraanet` | "AmraaNet Service" | "AmraaNet" | `menu.amraanet` (unchanged) |
| `menu.personal` (group) | "Personal" | "Account" | `menu.account` |
| `menu.profile` | "User Detail" | "Profile" | `menu.profile` (key same, label changes) |
| `menu.finance` (group) | "Commerce" | "Account" (merged) | merged into account group |
| `menu.order` | "Order Management" | "Orders" | `menu.order` (key same, label changes) |
| `menu.wallet` | "Balance" | "Wallet" | `menu.wallet` (key same) |
| `menu.affiliate` | "Commission" | "Referral" | `menu.affiliate` (key same, label changes) |
| `menu.help` (group) | "Users & Support" | "Help" | `menu.help` (key same, label changes) |
| `menu.document` | "Document Management" | "Guides" | `menu.document` (key same, label changes) |
| `menu.announcement` | "Announcement Management" | "Updates" | `menu.announcement` (key same, label changes) |
| `menu.ticket` | "Ticket Management" | "Support" | `menu.ticket` (key same, label changes) |

### Why "Network" not "Subscribe"

The `/subscribe` route is where users manage their **Network** service (proxy/VPN subscription). Naming it "Subscribe" describes the action (buy), not the product (use). Users who already have an active subscription land on this page to see their service status — calling it "Network" describes what it is.

### Why collapse "Personal" + "Commerce" → "Account"

"Personal" + "Commerce" are two groups that share the same type of content: things that belong to the user's account. Separating them adds visual noise. A single "Account" group with 4 items reads cleanly.

---

## 3. Implementation Map

### `apps/user/src/layout/navs.ts` — exact changes

The `useNavs()` function should produce this structure:

```
Group: t("menu.services", "My Services")
  Item: t("menu.network", "Network")      url="/subscribe"   icon="uil:network-chart"
  Item: t("menu.amraanet", "AmraaNet")    url="/amraanet"    icon="uil:wifi"

Group: t("menu.account", "Account")
  Item: t("menu.profile", "Profile")       url="/profile"     icon="uil:user-circle"
  Item: t("menu.order", "Orders")          url="/order"       icon="uil:receipt"
  Item: t("menu.wallet", "Wallet")         url="/wallet"      icon="uil:wallet"
  Item: t("menu.affiliate", "Referral")    url="/affiliate"   icon="uil:users-alt"

Group: t("menu.help", "Help")
  Item: t("menu.document", "Guides")       url="/document"    icon="uil:book-open"
  Item: t("menu.announcement", "Updates")  url="/announcement" icon="uil:bell"
  Item: t("menu.ticket", "Support")        url="/ticket"      icon="uil:headphones"
```

Dashboard remains a top-level nav item (no group), exactly as now.

### `apps/user/public/assets/locales/en-US/components.json` — updated keys

```json
{
  "menu": {
    "dashboard": "Dashboard",
    "services": "My Services",
    "network": "Network",
    "amraanet": "AmraaNet",
    "account": "Account",
    "profile": "Profile",
    "order": "Orders",
    "wallet": "Wallet",
    "affiliate": "Referral",
    "help": "Help",
    "document": "Guides",
    "announcement": "Updates",
    "ticket": "Support"
  }
}
```

Do the same rename in `zh-CN/components.json` with appropriate translations.

---

## 4. Mobile Navigation

The current app has **no mobile navigation**. On small screens, the left sidebar is hidden (`hidden lg:flex`). Users on mobile have no navigation.

### Required: Mobile Bottom Tab Bar

A fixed bottom bar on screens < `lg` breakpoint. It appears only inside the `UserLayout` (authenticated pages), not on auth or marketing pages.

**Position:** `fixed bottom-0 left-0 right-0 z-50 h-16`  
**Background:** `bg-card border-t`  
**Safe area:** Add `pb-safe` or `padding-bottom: env(safe-area-inset-bottom)` for iOS

**Tab items (5 max — show the most important):**

```
[Dashboard]  [Network]  [AmraaNet]  [Orders]  [More ▸]
```

"More" opens a bottom sheet with the remaining items (Wallet, Referral, Profile, Help section).

**Tab item anatomy:**

```
[icon 20px, centered]
[label, text-[10px], centered]
```

- Active state: icon and label in `text-primary`
- Inactive state: `text-muted-foreground`
- No background color change on active — color is sufficient
- Minimum tap target: 44px height

**Bottom sheet ("More"):**

A `<Sheet>` from the bottom, full width, with a simple list of remaining nav items. Each item is a `<Link>` with icon and label. Sheet closes on navigation.

### Header Behavior on Mobile

The top header remains on mobile. It shows: Logo + ThemeSwitch + LanguageSwitch + UserNav.

The left sidebar is hidden on mobile. All navigation happens through the bottom tab bar.

---

## 5. Active State

**Desktop sidebar:**

Currently uses `isActive={item.url === location.pathname}`. This is correct. Visual treatment: `bg-sidebar-accent text-sidebar-accent-foreground` (existing shadcn sidebar behavior).

**Mobile bottom bar:**

`useLocation()` to compare `location.pathname` to tab URL. Active: `text-primary`. Inactive: `text-muted-foreground`.

---

## 6. Brand in Navigation

The product name "Amraa Nets" appears in the **header logo**, not in the sidebar. The logo `<Link>` in `header.tsx` uses `{site.site_name}` from the global store, which is API-driven.

To change the display name from "Outline365" to "Amraa Nets," update the **site configuration in the admin panel** — not the frontend code. The frontend correctly reads this from the API.

**Do not hardcode** "Amraa Nets" in any component file. The `site.site_name` pattern is correct and must be preserved.

---

## 7. Page Titles (Browser + Breadcrumb)

Each page should have a clear `<title>` and optionally a visible page heading. Recommended headings:

| Route | Page heading |
|---|---|
| `/dashboard` | "Overview" |
| `/subscribe` | "Network" |
| `/amraanet` | "AmraaNet" |
| `/order` | "Orders" |
| `/wallet` | "Wallet" |
| `/affiliate` | "Referral" |
| `/profile` | "Profile" |
| `/document` | "Guides" |
| `/announcement` | "Updates" |
| `/ticket` | "Support" |

These headings should appear as an `<h1>` at the top of the page content area (inside `SidebarInset`), not inside the sidebar. Use `text-xl font-semibold mb-6`.

---

## 8. Scope of Change

**Only change:**
- `navs.ts` — group names and item labels (i18n keys + default strings)
- `en-US/components.json` — label strings
- `zh-CN/components.json` — Chinese equivalents
- Add bottom bar component to `UserLayout` (mobile only, hidden on lg+)

**Do not change:**
- Route paths (`/subscribe`, `/amraanet`, etc.) — all existing
- Sidebar component markup — keep `SidebarLeft` as-is
- Auth routes
- Header component structure
- Any backend identifiers
