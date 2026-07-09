<div align="center">

<img src="https://edutechsrm.in/favicon.svg" width="90" height="90" alt="edutechsrm logo" style="border-radius: 20px" />

# edutechsrm

**Your entire SRM academic life. One tab. Zero lag.**

Timetable, attendance, marks, CGPA, assignments, mess menu, AI — all live from your SRM Academia login, wrapped in a buttery-smooth dark interface.

<br>

[![Launch Site](https://img.shields.io/badge/Launch-edutechsrm.in-00f5d4?style=for-the-badge)](https://edutechsrm.in)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![License MIT](https://img.shields.io/badge/License-MIT-a855f7?style=for-the-badge)](LICENSE)

</div>

---

## What is edutechsrm?

edutechsrm is a student-built web app that connects to your SRM Academia account and presents all your academic data in one clean, fast interface. No more switching between tabs on the slow SRM portal — everything is here, with AI assistance, live profile photos, customizable views, and real-time alerts.

> Created by **Aarav Goel** — CSE AIML · SRMIST KTR  
> Independently designed, developed, and deployed.

---

## Features

### AI Assistant
- Ask questions about your timetable, attendance, marks, and exam schedule in natural language
- Powered by a custom backend integration — edutechsrm AI has full academic context and returns real answers about your timetable, attendance, marks, and deadlines
- Available from the dashboard quick-input, navbar, and dedicated AI page

### Dashboard
- A single overview of today's next event, attendance snapshot, assignment alerts, and profile card
- **Dock** — customizable app launcher. Tap the pencil icon on mobile to pick which apps appear; desktop shows all automatically
- **Assignment alerts** — shows today-due assignments with inline In Progress / Done buttons
- **Support card** — Razorpay-powered contribution modal with preset amounts or custom donations
- **Updates card** — latest 2 announcements preview with "Know more" link to full updates page

### Timetable
- Today's classes, full weekly schedule, and day order
- Day view, list view, and grid view
- Auto-scrolls to today on load
- Room number, faculty, slot, and credits per class
- Current class highlighted with a live indicator
- Tap any class in grid view to see full details
- Assignments shown inline for each class

### Attendance Tracker
- Real-time attendance percentage for every subject
- Highlights subjects below 75% in red
- Shows exactly how many classes you can skip — or must attend — to hit 75%
- Safe subjects vs at-risk subjects at a glance
- OD/ML planner — integrated planner to calculate how many days you'd need OD/ML for projected attendance

### Internal Marks
- All SRM internal assessment scores in one view
- Total scored vs total maximum per subject
- Percentage breakdown and visual progress bars
- Low marks alert for assessments below 50%

### GradeX — CGPA Calculator
- Internal CGPA tab — auto-calculates your CGPA from your actual internal marks
- Final Predictor tab — manually set expected grades and simulate your end-semester CGPA
- What-if matrix: see your projected CGPA if all ungraded subjects get O / A+ / A / etc.

### Academic Calendar
- All SRMIST KTR holidays and events
- Upcoming holiday alerts on dashboard
- Filter by type: All, Holiday, Exam, Event, Deadline
- Assignments shown on their due dates inline

### Courses
- Full list of registered subjects with credits, type, slot, room, and faculty
- Deduplicated — no repeated entries
- Searchable and filterable by Theory / Lab

### Mess Menu
- Dedicated page with hostel selector (Sannasi / M-Block / NRI)
- 7-day meal grid with breakfast, lunch, snacks, dinner
- Pill-chip food items for easy browsing

### Assignments
- Inline in Calendar, Timetable, Profile, and Dashboard
- Status buttons: To Do → In Progress → Done
- Priority indicators and delete support
- Done assignments automatically hide from calendar and timetable views

### Notifications
- Low attendance warnings (auto-generated on sync)
- Upcoming holiday alerts (next 7 days)
- Low marks alerts (below 50%)
- Announcement bell for developer updates, bug fixes, and info notices

### Profile
- Student info: name, register number, department, class, batch, semester
- Live profile photo — fetched from SRM Academia portal, shows everywhere (navbar, sidebar, dashboard, profile)
- Academic stats: avg attendance, at-risk subjects, total credits, marks %
- Today's day order (live from timetable data)
- Assignments inline with status controls
- WhatsApp community link and developer contact

### Theme Customization
- Multiple visual modes accessible from Settings
- Glass cards, morphing animated backgrounds, polished dark theme
- Works great on both mobile and laptop

### Settings
- Redesigned in-app settings layout
- Theme picker, account actions, and app preferences
- Clean toggle-based controls

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Animations | Framer Motion, GSAP |
| AI | Custom backend integration — delivers full academic context to the LLM for real, personalised answers |
| Icons | Lucide React |
| Payments | Razorpay (client-side key from server) |
| Backend | Cloudflare Workers + Durable Objects (separate repo) |
| Deployment | Cloudflare Workers + Assets via `@cloudflare/next-on-pages` |
| Auth | Session-token based (no passwords stored) |
| Bot Protection | Cloudflare Turnstile (after 3 failed logins) |
| CI/CD | GitHub Actions → Wrangler deploy |

---

## Security

- Your password is never stored. Credentials go directly to SRM Academia's servers for authentication.
- Only a session token is kept temporarily — the same way any normal login works.
- No database. No third-party analytics. No ads.
- All data is fetched live from SRM Academia on every sync.
- Origin validation on all admin API routes.
- Rate limiting on payment and auth endpoints (Durable Objects).
- Turnstile bot detection after repeated failed login attempts.
- Razorpay key rotated and served server-side, never hardcoded in client.

---

## Pages

| Route | Content |
|-------|---------|
| `/` | App entry — landing page (unauthenticated) or dashboard (authenticated) |
| `/about` | What edutechsrm does and how it works |
| `/contact` | Support and developer contact |
| `/developer` | Technical details, stack, and architecture |
| `/docs` | Live README rendered from GitHub |
| `/terms` | Terms of service |
| `/privacy` | Privacy policy |

---

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with SEO metadata
│   ├── page.tsx                # App entry point + tab routing
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── developer/page.tsx
│   ├── terms/page.tsx
│   ├── privacy/page.tsx
│   └── api/
│       └── srm/login/route.ts  # Login with Turnstile validation + email format check
├── components/
│   ├── landing-page.tsx        # SEO-optimised landing hero + features
│   ├── dashboard-section.tsx   # Dashboard overview with dock, cards, alerts
│   ├── timetable-section.tsx   # Day / list / grid views with assignments
│   ├── attendance-section.tsx  # Attendance with OD/ML planner
│   ├── marks-section.tsx       # Internal marks with progress bars
│   ├── courses-section.tsx     # Course list searchable/filterable
│   ├── calendar-section.tsx    # Academic calendar + assignments
│   ├── gradex-section.tsx      # CGPA calculator + predictor
│   ├── mess-section.tsx        # Mess menu with hostel selector
│   ├── profile.tsx             # Student profile with photo + assignments
│   ├── updates-section.tsx     # Full updates & release notes page
│   ├── settings-section.tsx    # Theme and app settings
│   ├── ai-section.tsx          # AI assistant chat
│   ├── ai-quick-input.tsx      # Quick AI input (dashboard/navbar)
│   ├── ai-promo-badge.tsx      # AI feature promo badge
│   ├── notification-bell.tsx   # In-app notifications
│   ├── navbar.tsx              # Dynamic Island bottom nav + top header
│   ├── sidebar.tsx             # Desktop sidebar navigation
│   ├── support-modal.tsx       # Razorpay-powered contribution modal
│   ├── announcements.ts        # Edit this to post updates
│   ├── footer.tsx              # Site footer
│   ├── login-modal.tsx         # SRM Academia login
│   ├── install-prompt.tsx      # PWA install prompt
│   └── seo-structured-data.tsx # JSON-LD structured data
├── lib/
│   ├── auth-context.tsx        # Auth state + data sync
│   ├── admin-control.ts        # Admin API hooks
│   ├── use-support.ts          # Razorpay support hook
│   └── custom-planner.ts       # Custom class scheduling
└── public/
    ├── favicon.svg
    └── og-image.png
```

---

## Posting Announcements

To post an update, bug fix notice, or announcement to all users, edit `components/announcements.ts`:

```ts
export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id:    13,              // increment from last id
    type:  "update",       // "update" | "fix" | "bug" | "info"
    title: "Your update title",
    body:  "Details about what changed or was fixed.",
    date:  "2026-07-02",   // today's date
  },
  // ... existing announcements
]
```

Save and deploy — the bell badge appears immediately.

**Types:**
- `update` → cyan — new features
- `fix` → green — bug fixes  
- `bug` → red — known issues
- `info` → purple — general notices

---

## Local Development

```bash
# Clone the frontend repo
git clone https://github.com/coderaarav12/edutechsrm-frontend-in.git
cd edutechsrm-frontend-in

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

> **Note:** The backend (Cloudflare Workers + Durable Objects) is a separate repository. For full functionality, the backend must be deployed with its own `wrangler.jsonc` and the backend URL configured in the frontend's env vars.

---

## Deployment

This app is deployed on **Cloudflare Workers** using `@cloudflare/next-on-pages`.

```bash
npm run deploy
```

The deployment uses Wrangler and uploads to Cloudflare Workers + Assets automatically. A GitHub Actions workflow also runs on push to `main`.

> After deploying, always clear the `.next` cache if you hit chunk errors:
> ```bash
> rd /s /q .next && npm run deploy   # Windows
> rm -rf .next && npm run deploy      # Mac/Linux
> ```

---

## CI/CD

On every push to `main`, a GitHub Actions workflow:

1. Installs dependencies
2. Sets wrangler secrets (`TURNSTILE_SECRET_KEY`)
3. Runs `npm run deploy` to Cloudflare Workers

The workflow uses `CF_API_TOKEN_IN` and `CF_ACCOUNT_ID_IN` as GitHub secrets (matching the subdomain `.in`).

---

## Contributing

This is a personal project but contributions are welcome.

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes
4. Push and open a Pull Request

Found a bug? Email [admin@edutechsrm.in](mailto:admin@edutechsrm.in)

---

## Support

If edutechsrm saves you time, consider contributing — it helps cover the domain and Cloudflare subscriptions that keep the site running.

**UPI:** `aaravgoel98@fam`

Or use the in-app Razorpay-powered support modal (₹250–₹2000 or custom amount).

---

## Disclaimer

edutechsrm is **not affiliated with SRM Institute of Science and Technology**. It is an independent student project. All academic data is fetched live from the official SRM Academia portal using your own credentials.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

[Aarav Goel](https://github.com/coderaarav12) · [LinkedIn](https://linkedin.com/in/aaravgoel12) · CSE AIML · SRMIST KTR

**[edutechsrm.in](https://edutechsrm.in)**

</div>
