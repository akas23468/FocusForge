🚀 FocusForge: A Gamified Productivity App

FocusForge is a self-contained, single-page application (SPA) built with pure HTML, CSS (using custom variables and BEM-like structure), and vanilla JavaScript. It gamifies your to-do list and time management with points, level-up titles, and integrated task timers.

🌟 Features Implemented

Client-Side Login: A modal-based login system that blurs the background until successful sign-in.

Persistent State: All data (tasks, notes, quotes, points, and timer states) is saved using localStorage.

Gamification:

Complete Task: +10 points

Incomplete Task: -5 points and automatically rescheduled (+30 minutes)

Level Up System with titles like Chanakya, Ramanujan, and Krishna.

Timers & Notifications: Per-task and per-activity timers with visual alerts, sound, and a fallback for the Vibration API/Web Notifications.

Dashboards: Today Focus, Tomorrow Plan, Night Notes (editable), Sports, Quotes, and Profile/Stats.

Responsive UI: Designed to be fully functional and aesthetically pleasing on both mobile and desktop screens.

🛠️ How to Run

Download: Save the four files (index.html, styles.css, app.js, and README.md) into a single folder.

Open: Double-click index.html in your file explorer.

Log In: Use any username/password (e.g., user/pass). The login is client-side only.

⚠️ Security Note

The login mechanism is client-side only. It is designed for UX flow and state persistence via localStorage, not for actual security or user authentication. Do not use this application for sensitive data, as all credentials and data are stored locally in plain text.

✅ QA Checklist for Verification

After running the app, confirm the following core flows work:

Login Modal: Does the page blur and become inaccessible until you successfully log in?

Add Task (Today Focus): Can you add a task? Does it appear with start/pause/reset timer controls?

Timer End: Start a timer for 10 seconds. Does it:

Vibrate (if supported)?

Play a short beep sound?

Show a browser notification (if permission is granted)?

Task Completion: Check the box for a task. Does the task flash a smile emoji, award +10 points, and disappear?

Task Incompletion: Check the box for a task, then select "Incomplete." Does it:

Deduct -5 points?

Display "Try next time" with a quote?

Reschedule the task 30 minutes later?

Level Up: Manually edit points in the Profile/Stats section or complete tasks until you reach 200 points. Does the Chanakya level-up modal appear?

Night Notes: Add, edit, and delete a note. Does the state persist on page reload?

Logout: Does the "Logout" button clear the state and bring back the blurred login modal?