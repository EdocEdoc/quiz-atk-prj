# 🚀 Firebase Deployment & Emulator Guide

This guide summarizes the commands and setup for deploying and testing your Firebase project that includes both Hosting (Vite frontend) and Functions (backend).

---

## 🧩 Project Structure
```
my-repo/
│
├─ functions/            # Cloud Functions backend
│   ├─ index.js
│   ├─ package.json
│
├─ web-app/              # Vite frontend
│   ├─ dist/
│   ├─ src/
│
├─ firebase.json
└─ .firebaserc
```

---

## 🚀 1️⃣ Deploy to Production

### 🔸 Deploy Hosting only
```bash
firebase deploy --only hosting
```

### 🔸 Deploy Functions only
```bash
firebase deploy --only functions
```

### 🔸 Deploy Both (Full Release)
```bash
firebase deploy --only hosting,functions
```

---

## 🧪 2️⃣ Run Locally (Emulators)

### 🔸 Run Functions Emulator only
```bash
firebase emulators:start --only functions
```
> Access your function locally via:
> `http://127.0.0.1:5001/<project-id>/us-central1/<functionName>`

### 🔸 Run Hosting + Functions Emulators
```bash
firebase emulators:start --only hosting,functions
```
> Your frontend will be served on `http://localhost:5000`
> Your API will run on `http://127.0.0.1:5001/...`

---

## 🧰 3️⃣ Useful Extras

### View Cloud Logs
```bash
firebase functions:log
```

### Redeploy a Single Function
```bash
firebase deploy --only functions:<functionName>
```

### Skip Linting Before Deploy
```bash
firebase deploy --only functions --force
```

---

## ✅ Quick Summary

| Task | Command |
|------|----------|
| Deploy frontend only | `firebase deploy --only hosting` |
| Deploy backend only | `firebase deploy --only functions` |
| Deploy both | `firebase deploy --only hosting,functions` |
| Run functions emulator | `firebase emulators:start --only functions` |
| Run hosting + functions emulators | `firebase emulators:start --only hosting,functions` |
| View cloud logs | `firebase functions:log` |

---

**Created by:** ChatGPT Firebase Setup Helper  
**Last updated:** 2025-10-10
