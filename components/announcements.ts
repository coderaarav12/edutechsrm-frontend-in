// announcements.ts - edit this file to post updates & bug notices
//
// HOW TO ADD A MESSAGE:
// 1. Copy one of the objects below and paste it at the TOP of the array
// 2. Give it a unique `id` (just increment the number)
// 3. Set `type`: "update" | "fix" | "bug" | "info"
// 4. Write your `title` and `body`
// 5. Set `date` to today in "YYYY-MM-DD" format

export type AnnouncementType = "update" | "fix" | "bug" | "info"

export interface Announcement {
  id: number
  type: AnnouncementType
  title: string
  body: string
  date: string
}

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 17,
    type: "update",
    title: "Redesigned mobile navigation bar",
    body: "The mobile nav has been rebuilt as a sleek floating pill with glassmorphism. It now includes a central home icon that takes you straight to the dashboard, per-category color highlighting, and a smooth sliding indicator. Each category (Academics, Tools, Account, AI) has its own distinct color and a popup with compact icon tiles. The AI tab now opens directly without an extra tap.",
    date: "2026-07-10",
  },
  {
    id: 16,
    type: "update",
    title: "Faculty Finder — look up professors",
    body: "Added a Faculty Finder in the Tools section. You can search for any professor by name or faculty ID, filter by department, and view their designation and staff room. The directory covers 400+ faculty members across all departments.",
    date: "2026-07-10",
  },
  {
    id: 15,
    type: "update",
    title: "New app loading screen",
    body: "Added a polished loading screen that greets you with the edutechsrm logo, a progress bar, and a 'Welcome to edutechsrm' message while the page loads. If the network is slow, it waits for everything to finish before showing the landing page.",
    date: "2026-07-04",
  },
  {
    id: 14,
    type: "update",
    title: "Documentation page — live from GitHub",
    body: "A new /docs page renders the project README directly from GitHub. Find it in the header nav, both footers, and the sitemap. Docs stay in sync automatically whenever the README is updated.",
    date: "2026-07-04",
  },
  {
    id: 13,
    type: "update",
    title: "Turnstile bot protection & rate limiting",
    body: "Added Cloudflare Turnstile challenge after 3 failed login attempts and rate-limited the payment endpoint to 10 req/min per IP via Durable Objects.",
    date: "2026-07-02",
  },
  {
    id: 12,
    type: "fix",
    title: "Security hardening fixes",
    body: "Added origin validation on admin routes, rotated Razorpay keys, removed token leaks from login flows, and fixed [object Object] error reporting.",
    date: "2026-07-02",
  },
  {
    id: 11,
    type: "update",
    title: "Support edutechsrm — Razorpay gateway live",
    body: "You can now support edutechsrm directly from the app! Use the Razorpay-powered support modal found in your profile, dashboard, settings, sidebar, or navbar. Choose from preset amounts (₹250–₹2000) or enter a custom amount. Every contribution helps cover domain, hosting & API costs.",
    date: "2026-06-30",
  },
  {
    id: 10,
    type: "update",
    title: "Dashboard dock scroll fix",
    body: "The dock now left-aligns apps on mobile so all selected apps are reachable by scrolling — no more cut-off items when all apps are enabled.",
    date: "2026-06-28",
  },
  {
    id: 9,
    type: "update",
    title: "Dashboard dock customization & assignment alerts",
    body: "Tap the pencil icon on the dock to pick which apps appear on mobile, while desktop shows all apps automatically. The dashboard now shows alerts for today-due assignments with inline In Progress / Done buttons, and considers assignments when calculating your next event.",
    date: "2026-06-28",
  },
  {
    id: 8,
    type: "update",
    title: "New Mess Menu page with hostel menus",
    body: "A dedicated Mess Menu page is now available in the dock with a hostel selector (Sannasi / M-Block / NRI), 7-day meal grid, and pill-chip food items for easy browsing.",
    date: "2026-06-28",
  },
  {
    id: 7,
    type: "update",
    title: "Assignments moved to Calendar & Profile",
    body: "Assignments are no longer a separate page. They now live inline in Calendar, Timetable, Profile, and Dashboard with status buttons (To Do → In Progress → Done), priority indicators, and delete support. Done assignments automatically hide from calendar and timetable views.",
    date: "2026-06-28",
  },
  {
    id: 6,
    type: "update",
    title: "Profile photo now shows everywhere",
    body: "Your SRM Academia profile photo now appears in the navbar, sidebar, dashboard card, and profile page. The photo is fetched live from the portal — update it there and it will reflect here automatically.",
    date: "2026-06-09",
  },
  {
    id: 5,
    type: "update",
    title: "New UI redesign across the app",
    body: "About page, login page, and all major sections have been redesigned with morphing animated backgrounds, glass cards, cleaner typography, and a polished dark theme that work great on both mobile and laptop.",
    date: "2026-06-06",
  },
  {
    id: 4,
    type: "update",
    title: "New pages: About, Contact, Developer & more",
    body: "Added an About page explaining what edutechsrm does, a Contact page for support, a Developer page with technical details, and a Logged-out confirmation screen. The app now has proper navigation for all of these.",
    date: "2026-06-06",
  },
  {
    id: 3,
    type: "update",
    title: "AI with academic context",
    body: "edutechsrm AI now understands your timetable, attendance, marks, and academic data after login. You can ask practical questions like 'When is my next class?' or 'Am I at risk of shortage?' and get answers with full context.",
    date: "2026-06-06",
  },
  {
    id: 2,
    type: "update",
    title: "Theme customization, OD/ML planner & Settings revamp",
    body: "Added theme customization with multiple visual modes, OD/ML range planner integrated with Attendance, redesigned Settings with in-app layout, and a refreshed navigation flow for desktop and mobile.",
    date: "2026-06-06",
  },
  {
    id: 1,
    type: "update",
    title: "Profile, navigation & mobile improvements",
    body: "Profile section follows the new navigation pattern with faster jumps between sections. Mobile layout and interactions have been improved for daily use.",
    date: "2026-06-06",
  },
]

export const ANNOUNCEMENTS = DEFAULT_ANNOUNCEMENTS
