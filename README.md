# 🇨🇴 Parce AU

> Your quick guide to survive as a Colombian in Australia.

A monolithic web application (Flask + Jinja2 + Bootstrap 5 + Vanilla JS) 
with practical tools for Colombians living in Australia.

✅ No login or registration required  
✅ No external database  
✅ No external APIs  
✅ Works offline (Bootstrap included locally)  
✅ User data stored in localStorage (private, on your own browser)

🌐 **Live at:** [parceau.onrender.com](https://parceau.onrender.com)

---

## 🚀 How to Run Locally

**Requirements:** Python 3.9 or higher

```bash
# 1. (Optional but recommended) Create virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the application
python app.py

# 4. Open in browser
# http://localhost:5000
```

---

## 📦 Project Structure

ParceAU/
├── app.py              # Flask app and routes
├── requirements.txt    # Dependencies
├── data/
│   ├── checklists.json
│   ├── plantillas.json
│   ├── numeros.json
│   ├── transporte.json
│   └── abogados.json   # Migration lawyers directory
├── static/
│   ├── vendor/         # Bootstrap 5 (local/offline)
│   ├── css/style.css
│   └── js/
└── templates/          # Jinja2 views

---

## 🧩 Modules

| Module | Description |
|--------|-------------|
| ⏱️ Hours Calculator | Track shifts and monitor fortnightly hour limits |
| 💰 Financial Control | Income, expenses, balance and daily budget |
| ✅ Arrival Checklist | Tasks before and after arriving in Australia |
| 💬 English Templates | Ready-to-use messages for common situations |
| 📞 Important Numbers | Emergencies, Fair Work, Lifeline, and more |
| 🚌 Public Transport | Cards and tips by city |
| ⚖️ Migration Lawyers | Directory by city with language and contact info |

---

## 🔒 User Data

All information you enter (shifts, income, expenses, checklists) 
is stored exclusively in your browser's localStorage. 
It is never sent to any server.

If you clear your browser cache or use a different device, 
the data will not transfer.

---

## ⚠️ Disclaimer

This application is an **informational guide**. 
It does not replace professional migration, legal, financial, or medical advice.

---

## 🛠️ Stack

`Python` `Flask` `Jinja2` `Bootstrap 5` `JavaScript` `JSON` `Render`
