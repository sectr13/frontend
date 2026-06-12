# Amraa Nets — AmraaNet Product Spec

**Version:** 1.0  
**Route:** `/amraanet`  
**Product:** AmraaNet (private networking, Tailscale/Headscale)  
**Current file:** `apps/user/src/sections/user/amraanet/index.tsx`  
**API services:** `packages/ui/src/services/user/amraanet.ts`  
**i18n namespace:** `amraanet`

---

## 1. Current Problems

| Problem | Code location |
|---|---|
| Login server, auth key, setup command use `<Input readOnly>` | Lines 115–189 of `index.tsx` |
| Input fields imply editable form — wrong mental model | Same |
| Auth key toggle + copy require two separate icon buttons | Lines 145–165 |
| Setup command truncated by input width on narrow screens | Line 179 |
| Device list uses raw `<Table>` + `<TableRow>` | Lines 396–442 |
| No visible online/offline status per device | No status column |
| "Last seen" shows raw `toLocaleString()` — verbose, non-relative | Line 429 |
| IP in a `<Badge>` inside a `<TableCell>` — unnecessary wrapper depth | Lines 415–421 |
| Platform instructions in tabs inside a card — low visual weight | Lines 199–386 |
| Setup command inside a plain `<code>` with `bg-muted` — looks like inline code, not a terminal | Lines 232–244 |
| Not-activated plan cards have price with `font-bold text-2xl` but no context | Lines 527–528 |
| Subscribe CTA says "Subscribe Now" (pushy) | Line 536 |
| No loading state (spinner only, no skeleton) | Lines 62–71 |
| No empty device state when `devicesData.list.length === 0` | Line 390 (`&&` hides entire section) |

---

## 2. Page States

The page has two top-level states. They are rendered separately with zero overlap.

### State A: Not Activated

User has no active AmraaNet subscription.

**Purpose:** Explain the product + guide to purchase.

### State B: Activated

User has an active AmraaNet subscription.

**Purpose:** Provide credentials + setup instructions + device management.

---

## 3. State A — Not Activated Page

### Layout

```
[Page heading: "AmraaNet"]

[Hero card — product explanation]

[Plan cards]
```

### Hero Card

Not a marketing card. A concise product introduction.

```
┌──────────────────────────────────────────────────────────┐
│  Your private network                                    │
│                                                          │
│  AmraaNet gives you a private Tailscale network on      │
│  your own infrastructure. One auth key. One command.    │
│  All your devices.                                       │
│                                                          │
│  ✓  Encrypted by default — WireGuard-based              │
│  ✓  Works on macOS, Windows, Linux, iOS, Android        │
│  ✓  One-command device setup                            │
│  ✓  Your own private infrastructure                     │
└──────────────────────────────────────────────────────────┘
```

**No icon in the heading.** The text is the signal.  
Title: `text-xl font-semibold`  
Body: `text-sm text-muted-foreground`  
Feature list: `text-sm text-foreground` with `text-primary` checkmark icons (`uil:check-circle`)  

### Plan Cards

Grid: `grid gap-4 md:grid-cols-2 lg:grid-cols-3`

```
┌─────────────────────────────────────┐
│  [Plan name]          [Monthly]     │
│  [Description]                      │
│                                     │
│  $9.99                              │
│  per month                          │
│                                     │
│  [────── Get Started ─────────────] │
└─────────────────────────────────────┘
```

**Plan name:** `text-base font-semibold`  
**Period badge:** `variant="secondary" text-xs` — right-aligned in header  
**Description:** `text-sm text-muted-foreground` — shown only if non-empty  
**Price:** `text-2xl font-semibold` (not `font-bold`)  
**Period:** `text-sm text-muted-foreground` inline after price  
**CTA:** `<Button asChild className="w-full">` linking to `/subscribe` — label "Get Started" (not "Subscribe Now")  

Price computation: `(plan.unit_price / 100).toFixed(2)` — unchanged.  
Period label: "per month" / "per year" / `per ${plan.unit_time}` — same logic.

### Empty Plans State

When `plans.length === 0`, show a single centered empty state (Design System §15):

```
[icon]
No plans available right now
Check back soon — plans will appear here when ready.
```

Do not show the hero card if there are no plans AND no explanation to give. Show only the empty state.

---

## 4. State B — Activated Dashboard

### Layout

```
[Page heading: "AmraaNet"]
[Active status row]

[Credentials section]

[Setup section]

[My Devices section]
```

### Active Status Row

Below the page heading, a single line showing service status:

```
● AmraaNet is active
```

- Dot: 8px, `bg-[--color-success]`, `animate-pulse`
- Text: `text-sm font-medium text-foreground`

No card wrapper for this row. Inline, just below the `<h1>`.

---

## 5. Credentials Section

Section label: `text-xs font-medium text-muted-foreground uppercase tracking-wide` — "Network Credentials"

All three credentials live in a **single card** with internal dividers. The card has `p-6`.

### Credential: Login Server

```
LOGIN SERVER                                    [Copy]
┌──────────────────────────────────────────────────┐
│  https://hs.example.com                          │
└──────────────────────────────────────────────────┘
```

- Label: `text-xs font-medium text-muted-foreground uppercase tracking-wide`
- Copy button: right-aligned with label, `variant="ghost" size="sm"`, state machine (Design System §9)
- Value area: `bg-muted rounded-lg px-4 py-3 font-mono text-sm break-all`
- NOT an `<input>`. A `<div>` or `<code>` element.

### Credential: Auth Key

```
AUTH KEY                              [Show/Hide]  [Copy]
┌──────────────────────────────────────────────────┐
│  ••••••••••••••••••••••••••••••••               │
└──────────────────────────────────────────────────┘
```

Three controls right-aligned: Show/Hide toggle + Copy button, using the state machine.

- Hidden state: 16 bullet characters `••••••••••••••••` — fixed, no layout shift
- Shown state: full auth key in `font-mono text-sm`
- Show/Hide: `<Button variant="ghost" size="sm">` with `uil:eye` / `uil:eye-slash` icon + label "Show" / "Hide"
- Copy: same pattern, but copies the actual value regardless of show/hide state

### Credential: Setup Command (Dark Code Block)

Uses the **Dark Code Block** component (Design System §12).

```
┌── SHELL ─────────────────────────── [Copy command] ─┐
│  $ tailscale up                                      │
│      --login-server=https://hs.example.com           │
│      --authkey=tskey-auth-abc123...                  │
└──────────────────────────────────────────────────────┘
```

- Header bar: `bg-slate-800 rounded-t-xl h-10 px-4 flex items-center justify-between`
- Left label: "SHELL" in `text-xs font-mono text-slate-400`
- Right copy button: "Copy command" in `text-xs text-slate-400 hover:text-white cursor-pointer` — state machine applies
- Code area: `bg-slate-900 rounded-b-xl text-slate-100 font-mono text-sm leading-relaxed px-5 py-4`
- Command wraps with 6-space indent on continuation lines — **never truncated**
- On copy: button text changes to "Copied ✓" in `text-emerald-400` for 2 seconds

The dark block is the only dark-colored element on the page. It earns its darkness by signaling "terminal command."

**Credential separator:** Between each credential block use a `<Separator>` with `my-5`. The credentials card is visually unified but the separators clearly delineate each field.

---

## 6. Setup Section

Section label: "Connect a Device"

A single card below the credentials card.

### Platform Tabs

```
[macOS / Linux]  [Windows]  [iOS]  [Android]
```

- Uses shadcn `<Tabs>`, `<TabsList>`, `<TabsTrigger>`
- Each trigger: icon (16px) + platform label
- Active tab: fills with `bg-primary/10 text-primary` pill (not underline)
- Icons: `uil:apple` / `mdi:microsoft-windows` / `simple-icons:ios` / `uil:android`
- Tab order: macOS/Linux first (most common for Tailscale), then Windows, iOS, Android

### Tab Content Pattern

Each tab shows a **numbered step list**, not prose paragraphs.

**Step format:**
```
Step 1
──────
[Description in text-sm text-muted-foreground]
[Code block if shell command]

Step 2
──────
[Description]
[Code block]
```

Step label: `text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1`
Description: `text-sm text-muted-foreground`

Each code/command uses the **Dark Code Block** component (same as setup command above) with copy button.

**macOS / Linux tab:**
1. Install Tailscale: `curl -fsSL https://tailscale.com/install.sh | sh`
2. Join the network: `{data.setup_command}` (full value from API, not truncated)

**Windows tab:**
1. Download Tailscale for Windows from tailscale.com/download (link opens in new tab)
2. Run in PowerShell/CMD: `{data.setup_command}`

**iOS tab:**
Steps 1–4 (existing logic), with login_server and auth_key shown as Credential Blocks inside the steps, not inline `<code>` tags.

**Android tab:**
Same as iOS pattern.

The `data.setup_command`, `data.login_server`, `data.auth_key` values are the same values from the credentials card above — no duplication of data, only duplication of the displayed value to avoid scrolling.

---

## 7. My Devices Section

Section label: "Devices" + count badge (`text-xs font-medium` pill: "3 connected")

```
[Section label]  [3 connected]

[Device row 1]
[Device row 2]
[Device row 3]
```

No outer card wrapper for the device list. Each row is a list item with a subtle bottom border.

### Device Row (Desktop)

```
●  [Device name]                [100.x.x.x]    [2 hours ago]    [···]
   [hostname if different]
```

**Status dot:** 8px circle
- Online (LastSeen within 5 minutes of now): `bg-[--color-success] animate-pulse`
- Offline: `bg-muted-foreground/40`
- LastSeen null: `bg-muted-foreground/20`

**Device name:** `text-sm font-medium text-foreground` — uses `GivenName` if set, else `Hostname`  
**Hostname sub-label:** `text-xs text-muted-foreground` shown below device name only when `GivenName !== Hostname` and both exist  
**IP badge:** `font-mono text-xs bg-muted rounded-md px-2 py-0.5`  
**Last seen:** `text-xs text-muted-foreground` — relative time ("just now", "5 min ago", "2 hours ago", "Yesterday", "Nov 4")  
**Actions (···):** `<Button variant="ghost" size="icon">` → `<DropdownMenu>` with:
- "View details" → opens device detail sheet
- "Delete device" → opens `<AlertDialog>` for confirmation

**Platform column:** NOT shown. The current API (`API.AmraanetDevice`) does not expose a platform/OS field. Do not infer from hostname. Mark as future enhancement.

**Traffic (RX/TX):** NOT shown on the row. Available in the device detail sheet only. Clutters the row on mobile without adding actionable value.

### Device Row (Mobile)

Stack vertically:
```
● [Device name]                           [···]
  [hostname if different]
  [IP]  ·  [Last seen]
```

Horizontal divider between rows. Touch target height minimum 56px.

### Device Detail Sheet

Opens from "View details" in the actions menu. `<Sheet>` from right on desktop, from bottom on mobile.

Contents: all available fields in a clean definition list.

```
DEVICE DETAILS
──────────────

Name          my-macbook
Hostname      my-macbook.local
Node ID       247
Tailscale IP  100.64.0.5
Machine Key   [long key — monospace, wrapping, no truncation]
Last Seen     2 hours ago (2026-06-11 14:23:04)
RX            1.2 GB
TX            456 MB
```

Field label: `text-xs font-medium text-muted-foreground uppercase tracking-wide`  
Field value: `text-sm text-foreground`  
Mono fields (IP, machine key, node ID): `font-mono text-sm`  
Machine key wraps — never truncated or clipped

### Delete Device Dialog

From "Delete device" in the actions menu. Uses `<AlertDialog>`.

- Title: "Delete device"
- Description: "This will remove **[device name]** from your network. The device will need to re-authenticate to reconnect."
- Cancel: `variant="outline"` — "Cancel"
- Confirm: `variant="destructive"` — "Delete device"

---

## 8. Empty Device State

When `data?.activated === true` AND `devicesData?.list.length === 0`:

The "My Devices" section still renders with its section label, but the list body shows the empty state:

```
      [laptop icon, 40px, muted]

      No devices connected yet

      Follow the setup instructions above to connect
      your first device.
```

No action button needed — the instruction points upward to the setup section, which is always visible on the same page.

---

## 9. Loading States

### Page-Level (Profile Loading)

While `isLoading === true` from the profile query:

```
[Skeleton: 160px, 20px — status row]

[Section label skeleton: 100px, 12px]
[Skeleton: full width, 48px — login server block]
[Skeleton: full width, 48px — auth key block]
[Skeleton: full width, 80px — code block]

[Section label skeleton: 120px, 12px]
[Skeleton: four tab pill shapes in a row]
[Skeleton: full width, 120px — code block area]

[Section label skeleton: 80px, 12px]
[Skeleton row ×3: 8px circle + 140px bar + 60px bar + 80px bar]
```

All skeletons use `animate-pulse`.

### Error State

When the profile query fails:

```
[Warning icon, 20px, amber]
Could not load your profile
The AmraaNet service may be temporarily unavailable.

[Try again — variant="outline" size="sm"]
```

"Try again" triggers `refetch()` from the query. Never show raw error messages.

---

## 10. Copy Interaction Summary

All copy interactions follow the state machine from Design System §9. Reference points in this page:

| Element | What is copied |
|---|---|
| Login server copy button | `data.login_server` |
| Auth key copy button | `data.auth_key` (copies actual value even when hidden) |
| Setup command copy button (credentials card) | `data.setup_command` |
| Setup command copy (per platform tab) | `data.setup_command` (same value) |
| Login server copy (inside iOS/Android tab) | `data.login_server` |
| Auth key copy (inside iOS/Android tab) | `data.auth_key` |

Copy uses existing `react-copy-to-clipboard`. The button state machine is the primary feedback. Toast is secondary (accessibility).

---

## 11. i18n Keys

All existing keys in `amraanet.json` are preserved. New or updated keys:

```json
{
  "title": "AmraaNet",
  "serviceActive": "AmraaNet is active",
  "networkCredentials": "Network Credentials",
  "loginServer": "Login Server",
  "authKey": "Auth Key",
  "setupCommand": "Setup Command",
  "copyCommand": "Copy command",
  "connectDevice": "Connect a Device",
  "shell": "SHELL",
  "myDevices": "Devices",
  "devicesConnected": "{{n}} connected",
  "noDevicesTitle": "No devices connected yet",
  "noDevicesDesc": "Follow the setup instructions above to connect your first device.",
  "viewDetails": "View details",
  "deleteDevice": "Delete device",
  "deleteDeviceDesc": "This will remove {{name}} from your network. The device will need to re-authenticate to reconnect.",
  "deviceDetails": "Device Details",
  "hostname": "Hostname",
  "givenName": "Name",
  "nodeId": "Node ID",
  "tailscaleIp": "Tailscale IP",
  "machineKey": "Machine Key",
  "lastSeen": "Last Seen",
  "rxBytes": "RX",
  "txBytes": "TX",
  "online": "Online",
  "offline": "Offline",
  "notActivatedTitle": "Your private network",
  "notActivatedDesc": "AmraaNet gives you a private Tailscale network on your own infrastructure. One auth key. One command. All your devices.",
  "feature1": "Encrypted by default — WireGuard-based",
  "feature2": "Works on macOS, Windows, Linux, iOS, Android",
  "feature3": "One-command device setup",
  "feature4": "Your own private infrastructure",
  "getStarted": "Get Started",
  "noPlansTitle": "No plans available right now",
  "noPlansDesc": "Check back soon — plans will appear here when ready.",
  "perMonth": "per month",
  "perYear": "per year",
  "active": "Active",
  "loadError": "Could not load your profile",
  "loadErrorDesc": "The AmraaNet service may be temporarily unavailable.",
  "tryAgain": "Try again",
  "desktopStep1Title": "Step 1",
  "desktopStep1Desc": "Install Tailscale:",
  "desktopStep2Title": "Step 2",
  "desktopStep2Desc": "Join the network (run once):",
  "windowsStep1Title": "Step 1",
  "windowsStep1Desc": "Download and install Tailscale for Windows from tailscale.com/download",
  "windowsStep2Title": "Step 2",
  "windowsStep2Desc": "Open Command Prompt or PowerShell as administrator and run:",
  "iosStep1Title": "Step 1",
  "iosStep1Desc": "Install the Tailscale app from the App Store.",
  "iosStep2Title": "Step 2",
  "iosStep2Desc": "Open the app, tap \"Add Account\", then enter this control server:",
  "iosStep3Title": "Step 3",
  "iosStep3Desc": "When prompted for an auth key, paste:",
  "androidStep1Title": "Step 1",
  "androidStep1Desc": "Install the Tailscale app from Google Play.",
  "androidStep2Title": "Step 2",
  "androidStep2Desc": "Open the app, tap \"Add Account\", then enter this control server:",
  "androidStep3Title": "Step 3",
  "androidStep3Desc": "When prompted for an auth key, paste:"
}
```

---

## 12. API Boundary — No Changes

All API calls are unchanged:

| Call | Function | Usage |
|---|---|---|
| Get profile | `getAmraaNetProfile()` | State check + all credential values |
| List devices | `getUserAmraaNetDevices({ page, size })` | Device list query |

Fields used from `API.AmraaNetProfile`: `activated`, `plans`, `login_server`, `auth_key`, `setup_command`  
Fields used from `API.AmraanetDevice`: `Id`, `GivenName`, `Hostname`, `TailscaleIp`, `LastSeen`, `RxBytes`, `TxBytes`, `HeadscaleNodeId`, `MachineKey`

**Platform field:** `API.AmraanetDevice` does not have a platform/OS field. Platform icon column is not implemented. Future enhancement.

---

## 13. Implementation Priority

The highest-impact changes in order:

1. **Credential blocks** — replace `<Input readOnly>` with styled `<div>` blocks. Immediate visual improvement, no logic change.
2. **Dark code block for setup command** — visual signal that this is a terminal command.
3. **Copy button state machine** — button-level "Copied ✓" feedback. Replace toast-only pattern.
4. **Device list redesign** — replace `<Table>` with styled list rows + status dot.
5. **Not-activated page** — hero card + plan cards with "Get Started" CTA.
6. **Skeleton loading** — replace spinner with skeleton layout.
7. **Empty device state** — show friendly message instead of hiding the section.
8. **Setup tabs** — numbered steps with code blocks instead of prose + inline `<code>`.
