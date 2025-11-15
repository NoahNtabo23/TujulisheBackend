# 🌐 Tujulishe Backend – API Server

Tujulishe is the backend API powering the **GeoLert** disaster reporting platform.
It handles:

* Disaster report submissions
* Partner authentication (JWT)
* Firestore data storage
* Updating incident status
* Serving incident data to the frontend
* Geolocation support (lat/lng)

This README explains how to install, configure, run, and deploy the backend.

---

## 📁 Project Structure

```
tujulishe/
│── config.js                      # Firebase admin SDK setup
│               
          
│── index.js                      # Express server entry point
│── serviceAccountKey.json         # Firebase Admin SDK key (NOT COMMITTED)
│── .env                           # Environment variables (NOT COMMITTED)
│── package.json
│── package-lock.json
```

---

## 🛠️ Requirements

Make sure you have:

* **Node.js v16+**
* **npm v8+**
* Firebase project
* Firestore database
* Firebase Admin SDK private key

---

# 🔧 1. Installation

### Clone the repository:

```bash
git clone <https://github.com/NoahNtabo23/TujulisheBackend>
cd tujulishe
```

### Install dependencies:

```bash
npm install
```

If your machine has dependency conflicts:

```bash
npm install --legacy-peer-deps
```

---

# 🔐 2. Environment Variables

Create a `.env` file in the root of the `tujulishe` folder:

### **.env**

```
It is in gitignore but will be provided on request
```

---

# 🔑 3. Firebase Admin Key Setup

It is located in serviceaccountkey.son but is in gitignore and will be provided on request

# 🚀 4. Running the Backend

### Development mode (auto-restart):

```bash
node index.js
```

### Production mode:

```bash
nodemon index.js
```

---

# 📌 5. Available Scripts

Add these to your `package.json` if missing:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

---

# 🛣️ 6. API Endpoints

### **POST /disasters/report**

Submit a new disaster report.

Example payload:

```json
{
  "disasterType": "fire",
  "description": "House burning",
  "location": "Nairobi",
  "severity": "high",
  "lat": -1.29,
  "lng": 36.82
}
```

---

### **GET /partners/incidents**

Returns all incidents for the partner dashboard.

---

### **PATCH /partners/incidents/:id/status**

Update an incident’s status.

Example payload:

```json
{
  "status": "in-progress"
}
```

---

### **POST /partners/login**

Authentication for partner accounts.

Payload:

```json
{
  "email": "admin@example.com",
  "password": "987456"
}
```

Response:

```
{
  "token": "JWT_TOKEN_HERE"
}
```

Use the token in all protected endpoints:

```
Authorization: Bearer <token>
```

---

# 🧪 7. Testing With Postman/ThunderClient

Optional but recommended:

* Test login
* Test report submission
* Test updating status
* Test fetching incidents

Ensure to include JWT token where required.

---

# 👥 Contributors

* **Backend Lead**: NoahNtabo23
* **Frontend & QA Team Members**
* **Geolert Development Team**

---


