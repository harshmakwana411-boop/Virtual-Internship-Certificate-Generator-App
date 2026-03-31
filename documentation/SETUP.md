# Virtual Internship & Certificate Generator App
## Comprehensive Setup & Deployment Guide

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Firebase Setup](#firebase-setup)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Running Locally](#running-locally)
7. [Deployment](#deployment)
8. [Features Guide](#features-guide)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

The **Virtual Internship & Certificate Generator App** is a complete full-stack solution for:
- Creating and managing student records
- Generating digital certificates automatically
- Creating QR codes for certificate verification
- Sending certificates via email
- Verifying certificate authenticity
- Tracking certificate downloads and verifications
- Administrative analytics dashboard

### Tech Stack
- **Frontend**: HTML5, CSS3, vanilla JavaScript
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Libraries**: QR Code JS, html2pdf, html5-qrcode, EmailJS
- **Hosting**: Firebase Hosting

---

## 📦 Prerequisites

Before starting, ensure you have:
1. **Node.js** (v14+) and **npm** installed
2. **Firebase Account** (free tier available)
3. **EmailJS Account** (for email sending) - optional
4. **Git** for version control
5. **Browser** supporting ES6+ JavaScript

### Installation Commands

```bash
# Install Node.js from https://nodejs.org/
# Verify installation
node --version
npm --version

# Install Firebase CLI
npm install -g firebase-tools

# Verify Firebase CLI
firebase --version
```

---

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Project name: `certificate-generator`
4. Accept terms and click "Create project"
5. Wait for project to be created

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Select **Email/Password** provider
4. Enable it and click "Save"

### Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode**
4. Choose location closest to you
5. Click "Create"

### Step 4: Setup Firestore Security Rules

1. Go to **Firestore** → **Rules** tab
2. Replace with the following rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /admins/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Allow authenticated users to manage students
    match /students/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to manage certificates
    match /certificates/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to manage templates
    match /templates/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow public read of certificates for verification
    match /certificates/{certId} {
      allow read: if true;
    }
  }
}
```

3. Click "Publish"

### Step 5: Setup Cloud Storage

1. Go to **Storage**
2. Click "Get started"
3. Start in **production mode**
4. Choose location
5. Click "Done"

### Step 6: Storage Security Rules

1. Go to **Storage** → **Rules** tab
2. Replace with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload templates
    match /templates/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024;
    }
    
    // Allow authenticated users to manage certificates
    match /certificates/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 50 * 1024 * 1024;
    }
  }
}
```

3. Click "Publish"

### Step 7: Get Firebase Config

1. Go to **Project Settings** (⚙️)
2. Click **</> Web** to add an app
3. Choose "Realtime Database" setup
4. Copy the Firebase config object
5. You need these values from the config:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

---

## 🔧 Installation

### Step 1: Clone/Download Project

```bash
# If using git
git clone <your-repo-url>
cd certificate-generator

# Or manually download and extract the ZIP file
```

### Step 2: Update Firebase Configuration

1. Open `config/firebase-config.js`
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 3: Install Dependencies

```bash
npm install
```

This installs Firebase CLI and other tools.

---

## ⚙️ Configuration

### Email Configuration (Optional)

For email delivery functionality:

1. Create [EmailJS Account](https://www.emailjs.com/):
   - Sign up free at emailjs.com
   - Go to **Email Services** → Add a service (Gmail works)
   - Go to **Email Templates** → Create a template
   - Note the: Service ID, Template ID, Public Key

2. In admin dashboard:
   - Go to **Email Configuration** section
   - Enter your EmailJS credentials:
     - Service ID
     - Public Key
     - Template ID
   - Set sender email and templates
   - Click "Save Configuration"

### Demo Credentials Setup

Create a demo admin account:

```bash
# Go to auth.html
# Click "Sign Up" tab
# Use these credentials:
Email: demo@example.com
Name: Demo Admin
Organization: Demo Org
Password: demo1234 (must match)
```

---

## 🚀 Running Locally

### Using Firebase Emulator (Recommended)

```bash
# Install emulator
firebase emulators:start

# In another terminal, open browser to:
http://localhost:5000  # Hosting
http://localhost:4000  # Emulator UI
```

### Using Python's HTTP Server

```bash
# Navigate to project directory
cd /path/to/project

# Python 3
python -m http.server 8000

# Then open browser to:
http://localhost:8000
```

### Using VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"
4. Browser opens to `http://localhost:5500`

---

## 📤 Deployment

### Option 1: Firebase Hosting (Recommended)

```bash
# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init hosting

# When prompted:
# - Select your project
# - Public directory: . (current)
# - Configure rewrite: No
# - Overwrite files: No

# Deploy
firebase deploy

# Your app will be live at: https://your-project.web.app
```

### Option 2: Netlify Hosting

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir .

# Follow instructions to connect to Netlify
```

### Option 3: GitHub Pages

1. Create repository on GitHub
2. Push code to repository
3. Go to Settings → Pages
4. Select branch and folder
5. Site publishes automatically

---

## 📖 Features Guide

### Admin Dashboard

**Access**: `https://your-app.web.app/admin.html`

#### 1. Student Management
- Add new students with course info
- View student list
- Edit/delete students
- Bulk upload via CSV

#### 2. Certificate Generation
- Upload certificate templates (PDF/Image)
- Generate certificates for students
- Auto-fill student data
- Generate unique certificate IDs
- Embed QR codes

#### 3. Email Delivery
- Configure EmailJS credentials
- Set email templates
- Send certificates automatically
- Resend previous certificates

#### 4. Analytics Dashboard
- View statistics:
  - Total students
  - Certificates generated
  - Verification rate
  - Download history
- Export data as CSV

### Public Verification Page

**Access**: `https://your-app.web.app/verify.html`

- Enter certificate ID to verify
- Scan QR code with camera
- Upload QR code image
- View certificate details if authentic
- Share certificate link

---

## 🛠️ Troubleshooting

### Firebase Connection Issues

**Problem**: "Firebase is not defined"
- **Solution**: Ensure Firebase SDK scripts are loaded in HTML
- Check CDN links are accessible
- Check firebaseConfig.js has correct values

### Authentication Not Working

**Problem**: "Cannot create new user"
- **Solution**: 
  - Enable Email/Password in Authentication
  - Check email format is valid
  - Check password is at least 6 characters
  - Try alternative email address

### QR Code Not Scanning

**Problem**: "Camera permission denied"
- **Solution**:
  - Check browser permission settings
  - Try "Verify by ID" instead
  - Use HTTPS (required for camera access)
  - Try different browser (Chrome recommended)

### Email Not Sending

**Problem**: "Failed to send email"
- **Solution**:
  - Verify EmailJS credentials are correct
  - Check email address format
  - Go to EmailJS dashboard to verify service
  - Create test email in EmailJS first

### Certificate Generation Slow

**Problem**: "Loading takes long time"
- **Solution**:
  - Check internet connection
  - Reduce template file size
  - Use JPG instead of PNG for templates
  - Check Firebase database read/write limits

### Firestore Quota Exceeded

**Problem**: "Quota exceeded" errors
- **Solution**:
  - Upgrade Firebase plan
  - Optimize database queries
  - Add indexes to frequently queried fields
  - Clean up old test data

---

## 📚 Database Schema

### Students Collection
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  course: "Web Development",
  duration: "3 months",
  department: "IT",
  completionDate: "2024-03-31",
  status: "active",
  certificatesCount: 1,
  createdAt: "2024-01-15T10:30:00Z"
}
```

### Certificates Collection
```javascript
{
  certificateId: "CERT-2024-001234",
  studentId: "uid123",
  studentName: "John Doe",
  studentEmail: "john@example.com",
  courseName: "Web Development",
  duration: "3 months",
  templateId: "template123",
  verifyUrl: "https://app.com/verify?certId=...",
  status: "completed",
  createdAt: "2024-03-31T14:20:00Z",
  downloadCount: 5,
  verifyCount: 3,
  lastDownloadedAt: "2024-03-31T15:00:00Z",
  lastVerifiedAt: "2024-03-31T14:50:00Z"
}
```

### Templates Collection
```javascript
{
  name: "Professional Certificate",
  fileType: "pdf",
  fileName: "template_1234567_cert.pdf",
  downloadURL: "https://storage.firebase.com/...",
  fileSize: 245000,
  createdAt: "2024-01-10T09:00:00Z",
  uploadedBy: "admin@example.com"
}
```

---

## 🔐 Security Best Practices

1. **Firebase Rules**: Always use restrictive Firestore rules
2. **API Keys**: Keep API keys in environment variables for production
3. **Authentication**: Use strong passwords for admin accounts
4. **Data**: Regularly backup Firestore data
5. **HTTPS**: Always use HTTPS in production
6. **Rate Limiting**: Implement rate limiting for APIs

---

## 📞 Support & Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **EmailJS Docs**: https://www.emailjs.com/docs
- **QR Code Library**: https://davidshimjs.github.io/qrcodejs/
- **html2pdf**: https://ekoopmans.github.io/html2pdf.js/

---

## 📝 License

This project is provided as is for educational and commercial use.

---

**Last Updated**: March 2024
**Version**: 1.0.0
