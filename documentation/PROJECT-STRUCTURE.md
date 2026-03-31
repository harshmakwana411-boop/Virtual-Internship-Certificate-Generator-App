# Project Structure Documentation

## Directory Overview

```
certificate-generator/
│
├── index.html                    # Landing page - Public entry point
│
├── auth.html                     # Authentication page (Login/Signup)
│
├── admin.html                    # Admin dashboard - Main application
│
├── verify.html                   # Certificate verification page (Public)
│
├── css/
│   ├── styles.css               # Global styles, variables, utilities
│   │   - CSS variables for theming (light/dark mode)
│   │   - Responsive grid and flexbox utilities
│   │   - Component styles (button, card, badge, alert, modal, table)
│   │   - Animation keyframes
│   │
│   ├── admin.css                # Admin dashboard specific styles
│   │   - Sidebar navigation layout
│   │   - Header and content area layout
│   │   - Dashboard cards and statistics
│   │   - Form styles
│   │   - Table styles with actions
│   │
│   └── verify.css               # Verification page styles
│       - Header with gradient
│       - Form tabs and inputs
│       - QR scanner area
│       - Result display cards
│
├── js/
│   ├── auth.js                  # Authentication Module (~ 150 lines)
│   │   - handleLogin()          - Process login form
│   │   - handleSignup()         - Create new admin account
│   │   - handleLogout()         - Sign out user
│   │   - handleForgotPassword() - Password reset
│   │   - getCurrentUser()       - Get logged-in user info
│   │   - checkAuth()            - Check authentication status
│   │   - getUserProfile()       - Fetch user profile from Firestore
│   │
│   ├── admin.js                 # Admin Dashboard Module (~ 500 lines)
│   │   # Data Management
│   │   - loadStudents()         - Fetch all students from Firestore
│   │   - loadCertificates()     - Fetch all generated certificates
│   │   - loadTemplates()        - Fetch certificate templates
│   │   
│   │   # Display Functions
│   │   - displayStudents()      - Render students in table
│   │   - displayCertificates()  - Render certificates in table
│   │   - displayTemplates()     - Show templates grid
│   │   
│   │   # CRUD Operations
│   │   - handleAddStudent()     - Create new student
│   │   - handleTemplateUpload() - Upload certificate template
│   │   - handleCertificateGeneration() - Generate certificate for student
│   │   - deleteStudent()        - Remove student record
│   │   - deleteTemplate()       - Remove template
│   │   
│   │   # Navigation
│   │   - initializeAdmin()      - Initialize dashboard
│   │   - setupNavigation()      - Setup sidebar navigation
│   │   - goToPage()             - Switch between pages
│   │   
│   │   # Dashboard
│   │   - updateDashboardStats() - Update statistics cards
│   │   - loadDashboard()        - Load dashboard data
│   │
│   ├── certificate.js           # Certificate Generation Module (~ 350 lines)
│   │   - generateCertificatePDF() - Create PDF content
│   │   - generateQRCode()       - Generate QR code
│   │   - downloadCertificateWithQR() - Download PDF with embedded QR
│   │   - createCertificateRecord() - Save to Firestore
│   │   - bulkGenerateCertificates() - Generate from CSV
│   │   - verifyCertificate()    - Verify certificate authenticity
│   │   - storeCertificate()     - Store in database
│   │   - incrementDownloadCount() - Track downloads
│   │   - getCertificateById()   - Fetch certificate by ID
│   │   - exportCertificatesAsCSV() - Export data
│   │
│   ├── verify.js                # Verification Module (~ 300 lines)
│   │   - handleVerifyById()     - Verify by certificate ID
│   │   - verifyCertificateFromDatabase() - Database lookup
│   │   - displayVerificationResult() - Show verification result
│   │   - startQRScanner()       - Start camera for QR scanning
│   │   - stopQRScanner()        - Stop camera
│   │   - handleQRImageUpload()  - Process QR image file
│   │   - resetVerification()    - Clear verification form
│   │   - loadVerificationStats() - Update statistics
│   │
│   ├── email.js                 # Email Service Module (~ 250 lines)
│   │   - sendCertificateEmail() - Send certificate via email
│   │   - sendBulkEmails()       - Send multiple emails
│   │   - sendTestEmail()        - Test email configuration
│   │   - validateEmailConfig()  - Verify email settings
│   │   - getEmailConfig()       - Retrieve settings from localStorage
│   │   - formatEmailBody()      - Template variable replacement
│   │   - resendCertificateEmail() - Resend to student
│   │
│   ├── qrcode.js                # QR Code Utilities (~ 300 lines)
│   │   - generateCertQRCode()   - Generate QR code for certificate
│   │   - encodeCertificateQR()  - Encode certificate data
│   │   - decodeCertificateQR()  - Decode QR data
│   │   - downloadQRCode()       - Download QR as image
│   │   - initializeQRScanner()  - Setup QR scanner
│   │   - stopQRScanner()        - Stop scanning
│   │   - generateBulkQRCodes()  - Generate multiple QRs
│   │   - createQRPoster()       - Create multi-QR poster
│   │
│   └── utils.js                 # Utility Functions (~ 250 lines)
│       - showAlert()            - Display notification
│       - showLoading()          - Show loading indicator
│       - hideLoading()          - Hide loading
│       - openModal()            - Open modal dialog
│       - closeModal()           - Close modal
│       - formatDate()           - Format timestamp
│       - generateUniqueId()     - Create unique ID
│       - copyToClipboard()      - Copy text to clipboard
│       - downloadFile()         - Download file
│       - debounce()             - Debounce function
│       - throttle()             - Throttle function
│       - toggleTheme()          - Switch light/dark mode
│
├── config/
│   └── firebase-config.js       # Firebase Configuration
│       - Firebase SDK initialization
│       - API credentials
│       - Service references (auth, db, storage)
│       - Offline persistence setup
│
├── documentation/
│   ├── SETUP.md                 # Comprehensive setup guide
│   │   - Prerequisites
│   │   - Firebase project setup
│   │   - Authentication setup
│   │   - Firestore database configuration
│   │   - Storage setup
│   │   - Email configuration
│   │
│   ├── DEPLOYMENT.md            # Deployment guide
│   │   - Firebase Hosting
│   │   - Netlify deployment
│   │   - GitHub Pages
│   │   - Production checklist
│   │   - Monitoring setup
│   │
│   └── API-DOCS.md              # API documentation
│       - REST endpoints
│       - Firestore queries
│       - Response formats
│       - Error codes
│
├── sample-data/
│   ├── sample-students.csv      # 15 sample student records
│   │   CSV format with columns: name, email, course, duration, department
│   │
│   └── TEMPLATE-GUIDE.md        # Guide for creating certificate templates
│       - Using Canva
│       - Using PowerPoint
│       - Using Figma
│       - Template specifications
│       - Best practices
│
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions deployment workflow
│
├── README.md                    # Project overview and quick start
├── .gitignore                   # Git ignore file
├── .env.example                 # Environment variables template
├── firebase.json                # Firebase hosting config
└── package.json                 # Node.js dependencies and scripts


## File Statistics

- Total Files: 30+
- Total Lines of Code: 3000+
- HTML Files: 4
- CSS Files: 3
- JavaScript Files: 8
- Documentation: 5
- Configuration: 3

## Module Dependencies

```
auth.js ← Firebase Auth, utils.js
        → admin.js

admin.js ← Firebase (Firestore, Storage), utils.js
        ← certificate.js, email.js
        → Dashboard rendering

certificate.js ← Firebase, utils.js
              ← qrcode.js, email.js
              → PDF generation, QR codes

verify.js ← Firebase, utils.js
         ← qrcode.js, email.js
         → Certificate verification

email.js ← EmailJS, Firebase
        ← utils.js
        → Certificate delivery

qrcode.js ← QR Code Library, html5-qrcode
         ← html2pdf
         → QR generation & scanning

utils.js ← No dependencies
       → Used by all modules
```

## Key Technologies

1. **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
2. **Backend**: Firebase (Firestore, Authentication, Storage)
3. **Libraries**:
   - QR Code: qrcodejs v1.0.0
   - PDF: html2pdf v0.10.1
   - Email: EmailJS v3
   - QR Scanner: html5-qrcode

## File Sizes

- HTML Files: ~30KB total
- CSS Files: ~50KB total
- JS Files: ~150KB total
- CDN Libraries: ~100KB (loaded from CDN)
- Total App: ~2-3MB with assets

## Performance Optimization

- Lazy loading of modules
- CSS variables for theme switching
- Debounced database queries
- Cached user preferences
- Optimized images and compression
- CDN delivery for external libraries

---

**Note**: This is a comprehensive single-page application with no build process required. All files are served as-is and run directly in the browser.
