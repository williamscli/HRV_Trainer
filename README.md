# GENYSYS Pre-MVP

**One question:** Does telling someone what to do actually change outcomes?

---

## The Problem

Every wearable gives you data. Recovery scores. Readiness percentages. Colored rings.

Then they leave you alone with that data to figure out what it means.

You wake up, see a yellow recovery score, and think: *Should I train today or not?*

The apps won't tell you. They show you a number and let you decide.

---

## What This Tests

This demo tests a closed loop:

```
Command → You Comply or Override → Outcome Measured → Evidence Shown
```

**Command:** Based on your HRV, you get one of three instructions:
- **REST** — Don't train today
- **BUILD** — Normal training
- **PERFORM** — Push hard, window is open

**Comply or Override:** The next day, you tell us what you actually did.

**Outcome Measured:** We check if you were ready to train the next morning (HRV above crash threshold).

**Evidence Shown:** You see what happened when you followed vs ignored the command.

---

## What You'll See

After enough data, the command card shows your own evidence:

**When REST appears:**
> "You trained through 3 REST days. 2 times you weren't ready the next morning."

or

> "You followed REST 5 times. 4 mornings you woke up ready to train."

**When BUILD appears:**
> "8 of your last 10 mornings ready to train."

**When PERFORM appears:**
> "3 REST days banked. You earned this."

---

## Why This Matters

No other app does this. Here's why:

| App | What it does | What it doesn't do |
|-----|--------------|-------------------|
| WHOOP | Shows recovery score | Won't tell you what to do |
| Garmin | Shows Body Battery | Won't tell you what to do |
| Oura | Shows Readiness | Won't tell you what to do |
| **This** | Tells you what to do | Then measures if it was right |

The difference isn't the algorithm. The difference is the **closed loop**.

Commands without compliance tracking are just suggestions.
Compliance without outcome measurement is just obedience.
Outcome measurement without evidence display is just data hoarding.

The loop is what builds trust.

---

## How It Works

**The Algorithm:**
1. You enter your morning HRV
2. We calculate your z-score against your rolling baseline (median + MAD)
3. Z-score determines command:
   - Below -1.0 → REST
   - Between -1.0 and +1.0 → BUILD  
   - Above +1.0 → PERFORM

**The Evidence:**
- Last 5 REST decisions (up to 60 days back)
- Minimum 3 REST decisions before showing stats
- "Crashed" = next morning HRV z-score below -1.0
- "Ready" = next morning HRV z-score at or above -1.0

**All data stays in your browser.** Nothing is sent to a server except anonymous analytics events.

---

## What We're Testing

1. **Do people comply with REST commands?**  
   If compliance is below 50%, the system fails regardless of accuracy.

2. **Does compliance correlate with better outcomes?**  
   If crash rate is the same whether you follow or ignore, the command has no value.

3. **Does showing evidence change behavior?**  
   If people ignore REST even after seeing "3 of 3 times you crashed," the feedback loop doesn't work.

---

## What Success Looks Like

The system works if:
- REST compliance > 60%
- Crash rate when ignoring REST > crash rate when following REST
- Users who see evidence have higher compliance than users who don't

---

## How to Use

1. Open the app
2. Enter your morning HRV (from WHOOP, Apple Watch, Oura, etc.)
3. Get your command
4. The next day, tell us if you followed it
5. After 3+ REST decisions, see your evidence

---

## What This Is Not

- Not a replacement for your wearable (you still need HRV data from somewhere)
- Not medical advice
- Not a training program
- Not an AI that learns your patterns (it's a fixed algorithm with personal baseline)

---

## The Thesis

Most wellness apps optimize for engagement. More dashboards, more metrics, more reasons to open the app.

This optimizes for one thing: **Did you wake up ready to train?**

If the answer is yes more often when you follow the commands, the system works.

If not, it doesn't.

That's what we're here to find out.

---

## Files

- `index.html` — Production app (feedback prompt at day 7/14)
- `index_TEST.html` — Test version (immediate feedback prompt)
- `google_apps_script.js` — Analytics backend
- `ANALYTICS_SETUP.md` — Setup instructions for Google Sheets analytics

---

## Privacy

- All HRV data stored locally in your browser
- Anonymous analytics track events (not your HRV values)
- No account required
- No data sold
- You can export your data as CSV anytime
- You can delete everything with one button

---

*Built to answer one question: Does the command actually help?*
