# SwaSuraksha Hackathon Pitch Deck & Technical Specifications

SwaSuraksha is an AI-powered, blockchain-secured journey safety and emergency response platform.

---

## 🎙️ The Hackathon Pitch (2-Minute Script)

> **"Judges, millions of students, night-shift workers, and citizens travel alone every day. But if you look at existing safety apps, they all have a fatal flaw: they are reactive. They only work *after* an emergency has already occurred, usually requiring the user to tap a panic button. If a traveler is chased, cornered, or knocked unconscious, those apps fail.**
>
> **Introducing SwaSuraksha—an AI-powered, blockchain-secured journey safety and emergency response platform. Our mission is simple: 'Feel Free to Travel.'**
>
> **SwaSuraksha is proactive. By combining real-time GPS tracking with Gemini AI safety routing and a background Silent Escort countdown timer, the platform automatically detects off-route deviations and notifies emergency contacts without any user action. And if an accident does happen, first responders scan a lockscreen QR code to instantly retrieve a blockchain-verified paramedic medical summary and dial primary contacts.**
>
> **We secure this data through defense-in-depth: database encryption-at-rest for medical history, dynamic privacy locks that hide health records unless an alert is active, and a SHA-256 blockchain ledger to verify that the patient records scanned are authentic and untampered."**

---

## 🛠️ Feature & Module Breakdown

### 1. User & Session Security (Baseline Layer)
* **Features**: State-free **JWT Authentication** + **BCrypt password hashing** + CORS config for safe cross-origin client scripts.
* **Why it matters**: Ensures all API requests to location updates, medical profiles, and contacts require verified digital tokens.

### 2. Trusted Contacts Circle (Notification Routing)
* **Features**: CRUD view enabling users to register contacts. Toggles assign roles: **Primary SOS** (receives manual panic coords) or **Silent Escort Guests** (monitors check-in timeout alerts).

### 3. Emergency Medical Profile & Paramedic AI Brief
* **Features**: Form to compile blood type, allergies, conditions, and responder directives.
* **AI Integration**: Automatically sends details to the **Gemini API** to generate a highly compressed, paramedic-first medical summary, highlighting critical life-threatening conditions (e.g. asthma, penicillin allergy) in all caps.

### 4. Lockscreeen QR Card Generator (ZXing Engine)
* **Features**: Generates a custom QR code (using ZXing engine) encoding a secure, unguessable UUID access key, rendering it in a downloadable image format for users to set as their phone lockscreen wallpaper.

### 5. Open-Access First Responder Viewer
* **Features**: A public route (`/emergency/public-card/{accessKey}`) bypasses authentication so paramedics can scan the QR code and instantly view medical details and click-to-call trusted contacts.

### 6. AI Route Safety Recommendation
* **Features**: Takes origin/destination parameters and queries Gemini to produce a **Route Safety Score (0-100%)**, a **Safest Travel Window**, and street safety explanations based on illumination, crime rate, and community flags.

### 7. GPS Journey Tracking & Anomaly Detector
* **Features**: Simulates walk updates. Using the **Haversine formula**, the backend calculates coordinate deviations. If a traveler drifts off-course, the status instantly flags to **`DEVIATED`** and registers a timeline anomaly event.

### 8. Silent Escort Background Worker
* **Features**: A Spring Boot background service running on a **cron scheduler** scans active trips. If the traveler's countdown timer hits zero and they haven't checked in, the system raises a **`TIMEOUT_ALERT`** and dispatches SMTP/console emails containing a live tracking link to their secure circle.

### 9. Smart Assistance (SafePoint range lookup)
* **Features**: Automatically queries and sorts nearest verified safe spots (Police checkposts, hospitals, shelters) based on range filters from the user's live GPS coordinates.

---

## 🔒 Web3 & Security Innovations (Core Differentiators)

To stand out in the hackathon, highlight these three advanced security implementations that resolve major data privacy concerns:

| Security Vector | Existing Safety Apps | SwaSuraksha Solution | Why it Wins |
| :--- | :--- | :--- | :--- |
| **Data Privacy (At Rest)** | Store medical/contact profiles in plaintext tables, vulnerable to database breaches. | **AES-128 Encryption-at-Rest** using a JPA AttributeConverter. | Compliance with **HIPAA / GDPR** standards for sensitive personal health logs. |
| **Access Control (Public QR)** | Anyone scanning your QR lockscreen code can see your private medical details and contact numbers. | **Dynamic SOS Lock**. The QR profile returns a locked screen unless the traveler is in an active `SOS` or `TIMEOUT_ALERT` status. | **True Privacy**. Details stay completely locked during daily routines and decrypt only during an emergency. |
| **Data Integrity Verification** | Open to database tampering or record manipulation by intruders. | **SHA-256 Hashing on Blockchain**. Profile updates write a data hash block to the ledger. Fetching profiles verifies the hash matches the blockchain block. | **Decentralized Verification**. Guarantees to first responders that the medical instructions scanned have not been modified or tampered with. |
