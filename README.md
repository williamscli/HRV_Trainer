# GENYSYS (Private Beta)

**Your HRV tells us how recovered you are. We read it. We tell you what to do.**

You're early. This is a lightweight tool to test whether HRV-based training commands actually change behavior. Your feedback shapes what we build next.

---

## ⬇️ Get Started

### Open the app

**👉 [https://williamscli.github.io/HRV_Trainer](https://williamscli.github.io/HRV_Trainer)**

Works on any device — phone, tablet, or computer.

### Add to your phone's home screen (recommended)

**iPhone:**
1. Open the link above in Safari
2. Tap the **Share** button (square with arrow)
3. Tap **"Add to Home Screen"**
4. Now it's on your home screen like an app

**Android:**
1. Open the link above in Chrome
2. Tap the **menu** (three dots)
3. Tap **"Add to Home Screen"**
4. Now it's on your home screen like an app

---

## What is this?

Every morning, your body broadcasts a signal through your heart rate variability (HRV). This signal reveals whether your nervous system is recovered, stressed, or primed for performance.

Most apps show you a number. We show you a **command**.

```
REST   →  Light movement only. Your system needs recovery.
BUILD  →  Standard training. Execute your program.
PERFORM →  System primed. Push hard. Chase PRs.
```

No dashboards. No graphs to interpret. Just one word that tells you what to do today.

---

## How it works

**1. Log your morning HRV**  
Get your HRV from any wearable (WHOOP, Apple Watch, Oura, Garmin, etc.)

**2. Build your baseline**  
- After 3 days: Preview commands begin (limited accuracy)
- After 7 days: Full baseline established (personalized to YOU)

**3. Get your command**  
Each morning, we compare today's reading to your baseline and tell you exactly what to do

---

## Don't have a wearable?

No problem. Download **Welltory** (free tier) on your phone.

1. Each morning after waking, open Welltory
2. Take a 1-minute HRV reading using your phone camera
3. Enter the HRV value you see into GENYSYS

That's it. No expensive hardware required.

[Download Welltory for iOS](https://apps.apple.com/app/welltory/id1074367771) | [Download Welltory for Android](https://play.google.com/store/apps/details?id=com.welltory.client.android)

---

## The Science (simplified)

We calculate a Z-score: how far today's HRV deviates from your personal baseline.

| Z-Score | Command | What it means |
|---------|---------|---------------|
| < -1.0 | **REST** | Below your normal. Nervous system is stressed. |
| -1.0 to 0.5 | **BUILD** | Within normal range. Train as planned. |
| ≥ 0.5 | **PERFORM** | Above your normal. System is primed. |

Your baseline recalculates daily using your last 14 days of data.

**Preview mode (3-6 days):** Commands are calculated but accuracy is limited. A disclaimer is shown.  
**Full mode (7+ days):** Baseline is stable and personalized to your patterns.

---

## Daily Workflow

**Morning (2 minutes):**
1. Check HRV on your wearable
2. Open GENYSYS
3. Enter today's HRV
4. See your command
5. (Optional) Log yesterday's compliance and today's energy

**That's it.** Train accordingly.

---

## Data & Privacy

- All data stays on your device (localStorage)
- Nothing is sent to any server
- Export anytime to CSV for your records
- Reset all data with one button

---

## For Beta Testers

You're helping validate whether this approach actually works.

**What we're measuring:**
- Do people follow the commands? (Compliance)
- How do they feel each day? (Energy)
- Does the system surface useful guidance?

**What we need from you:**
- Log your HRV daily for 2 weeks
- Answer the compliance prompt honestly
- Export and share your CSV when done

Your data stays on your device. Only share the export if you're comfortable.

---

## File Structure

```
HRV_Trainer/
├── README.md           # This file
├── index.html          # The app (GitHub Pages serves this)
├── genysys.jsx         # React component source (for developers)
└── genysys_calculator.xlsx  # Excel version (backup option)
```

---

## FAQ

**What HRV value do I use?**  
Use your wearable's morning HRV reading in milliseconds (ms). Most apps show this as "HRV" or "Heart Rate Variability."

**What if my wearable shows RMSSD vs SDNN?**  
Both work. Just be consistent — use the same metric every day.

**Why 3 days minimum for preview?**  
We need at least a few data points to compare against. Preview commands start at 3 days with a disclaimer. Full accuracy kicks in at 7 days when we have enough data to learn YOUR patterns.

**Can I backfill data?**  
Yes. Use the history section to add past HRV readings with their dates.

**What if I miss a day?**  
No problem. Just log when you can. The system uses whatever data you have.

---

## Built With

- React 18
- Tailwind CSS
- Local Storage API
- No backend, no dependencies, no build step

---

## License

MIT — Use it, modify it, share it.

---

## Feedback

Building this in public. Questions, bugs, or ideas — reach out:

[Your email or Twitter here]
