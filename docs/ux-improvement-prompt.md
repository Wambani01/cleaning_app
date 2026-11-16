# Prompt: make the client and cleaner journeys obvious, step by step

Role: senior product designer and full-stack engineer on Amsta Clean (Next.js 16, Tailwind v4, Better Auth, Supabase Postgres).
Do not change the business model (free account, EUR 15 membership paid with the first request and renewed 30 days after each payment, EUR 15 per hour, regular cleaner + backup + breakage cover). Do not invent prices, reviews or statistics.

## Problem
Users finish an action and are left without a clear next step. Example: after a client sends the first cleaning request, nothing tells them to pay the membership, and there is no Pay button where they are looking.

## Principles
1. Every screen ends in ONE obvious primary next action, in the place the user is looking (not only in a menu).
2. The dashboard always answers: where am I, what is done, what do I do next, what happens after that.
3. Money is explicit: what is due, why, how much, when it renews. Never surprise-charge.
4. Status is plain language with the reason and the next step (for example "Waiting for Ewa to accept. You will get a confirmation").
5. Errors say what to do. Empty states offer the action. Nothing is a dead end.
6. Works at 375px width, keyboard accessible, readable contrast, no layout shift.

## Client journey (fix in this order)
1. Account created -> dashboard with a 4-step tracker: Free account, First request, Pay membership, Cleaner confirms. The current step is highlighted with a link.
2. First request sent -> the success state shows a prominent "Pay EUR 15 membership now" button (not only text). Request cards in "Awaiting payment" also carry a Pay button.
3. Dashboard banner whenever something is owed (first payment, renewal due, overdue) with a single Pay button.
4. After paying -> receipt, plain explanation of what happens next, and a link back to the request.
5. Request cards show a timeline: Sent -> Paid -> Cleaner accepted -> Confirmed -> Done, with the current stage marked.
6. Renewal: show next billing date and card on file on the dashboard; remind 3 days before; failed payment explains how to fix it.
7. After a completed cleaning: show the amount due (hours x EUR 15), pay in one tap, then offer "Book the next one" and "Rate this cleaning".

## Cleaner journey
1. Application -> clear status tracker (received, interview, documents, approved) with what is needed next.
2. New requests at the top with Accept / Decline and the earnings for the job; declining asks a short reason.
3. Upcoming jobs list with address, tasks, notes, client first name; after the job, mark done.

## Admin journey
1. A "Needs attention" panel: unpaid first requests, cleaner not answered, declined requests without a replacement, past-due memberships, failed payments.
2. One-click actions from each row (reassign, call cleaner, record payment, process due payments).

## Deliver
- Implement the client journey items 1-3 first, then 4-7, then cleaner and admin items.
- Reuse existing components and tokens. Keep test mode labelling on all payment screens.
- Add Playwright checks for each new step (button visible, leads to the right page, state updates after paying).
- Update copy only where the journey changes; keep public marketing text unchanged unless it is wrong.
- Report what changed, what was tested, and what is still open.
