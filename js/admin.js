/**
 * Admin Dashboard Module
 * Handles admin dashboard functionality
 */

let currentPage = 'dashboard';
let studentsData = [];
let certificatesData = [];
let templatesData = [];

/**
 * Initialize Admin Dashboard
 */
function initializeAdmin() {
    setupNavigation();
    setupDragAndDrop();
    loadStudents();
    loadCertificates();
    loadTemplates();
    updateDashboardStats();
    setupAutoRefresh();
}

/**
 * Setup Navigation
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            goToPage(page);
        });
    });
}

/**
 * Go to Page
 */
function goToPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    // Show selected page
    const page = document.getElementById(`page-${pageName}`);
    if (page) {
        page.style.display = 'block';
    }

    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`.nav-link[data-page="${pageName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Update page title
    const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'Overview of your system' },
        students: { title: 'Students', subtitle: 'Manage student information' },
        certificates: { title: 'Certificates', subtitle: 'Generate and manage certificates' },
        templates: { title: 'Templates', subtitle: 'Manage certificate templates' },
        email: { title: 'Email Configuration', subtitle: 'Set up email delivery' },
        analytics: { title: 'Analytics', subtitle: 'View statistics and insights' }
    };

    const config = titles[pageName] || titles.dashboard;
    document.getElementById('page-title').textContent = config.title;
    document.getElementById('page-subtitle').textContent = config.subtitle;

    currentPage = pageName;
    localStorage.setItem('lastPage', pageName);
}

/**
 * Setup Drag and Drop
 */
function setupDragAndDrop() {
    const uploadArea = document.getElementById('template-upload-area');
    if (!uploadArea) return;

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            document.getElementById('template-file').files = files;
        }
    });

    uploadArea.addEventListener('click', () => {
        document.getElementById('template-file').click();
    });
}

/**
 * Load Students from Firestore
 */
async function loadStudents() {
    try {
        const snapshot = await firebaseServices.db.collection('students')
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

        studentsData = [];
        snapshot.forEach(doc => {
            studentsData.push({ ...doc.data(), id: doc.id });
        });

        displayStudents();
        updateStudentSelects();
    } catch (error) {
        console.error('Load students error:', error);
        showAlert('Failed to load students', 'danger');
    }
}

/**
 * Display Students in Table
 */
function displayStudents() {
    const tbody = document.getElementById('students-tbody');
    if (!tbody) return;

    if (studentsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No students added yet</td></tr>';
        return;
    }

    tbody.innerHTML = studentsData.map(student => `
        <tr>
            <td>${student.name || 'N/A'}</td>
            <td>${student.email || 'N/A'}</td>
            <td>${student.course || 'N/A'}</td>
            <td>${student.duration || 'N/A'}</td>
            <td><span class="badge badge-success">${student.status || 'active'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editStudent('${student.id}')" title="Edit">✏️</button>
                    <button class="action-btn view" onclick="viewStudentDetails('${student.id}')" title="View">👁️</button>
                    <button class="action-btn delete" onclick="deleteStudent('${student.id}')" title="Delete">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Open Student Modal
 */
function openStudentModal() {
    openModal('studentModal');
}

/**
 * Handle Add Student
 */
async function handleAddStudent(event) {
    event.preventDefault();

    const student = {
        name: document.getElementById('student-name').value,
        email: document.getElementById('student-email').value,
        course: document.getElementById('student-course').value,
        duration: document.getElementById('student-duration').value,
        department: document.getElementById('student-department').value,
        completionDate: document.getElementById('student-completion-date').value,
        status: 'active',
        createdAt: new Date().toISOString(),
        certificatesCount: 0
    };

    showLoading('Adding student...');

    try {
        const docRef = await firebaseServices.db.collection('students').add(student);
        showAlert('Student added successfully!', 'success');
        
        document.getElementById('student-add-form').reset();
        closeModal('studentModal');
        await loadStudents();
    } catch (error) {
        console.error('Add student error:', error);
        showAlert('Failed to add student', 'danger');
    } finally {
        hideLoading();
    }
}

/**
 * Delete Student
 */
async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    showLoading('Deleting student...');

    try {
        await firebaseServices.db.collection('students').doc(studentId).delete();
        showAlert('Student deleted successfully!', 'success');
        await loadStudents();
    } catch (error) {
        console.error('Delete student error:', error);
        showAlert('Failed to delete student', 'danger');
    } finally {
        hideLoading();
    }
}

/**
 * Update Student Select Dropdowns
 */
function updateStudentSelects() {
    const select = document.getElementById('student-select');
    if (!select) return;

    select.innerHTML = '<option value="">Choose a student...</option>';
    studentsData.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} - ${student.course}`;
        select.appendChild(option);
    });
}

/**
 * Load Certificates
 */
async function loadCertificates() {
    try {
        const snapshot = await firebaseServices.db.collection('certificates')
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

        certificatesData = [];
        snapshot.forEach(doc => {
            certificatesData.push({ ...doc.data(), id: doc.id });
        });

        displayCertificates();
        updateRecentCerts();
    } catch (error) {
        console.error('Load certificates error:', error);
        showAlert('Failed to load certificates', 'danger');
    }
}

/**
 * Display Certificates
 */
function displayCertificates() {
    const tbody = document.getElementById('certs-tbody');
    if (!tbody) return;

    if (certificatesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No certificates generated</td></tr>';
        return;
    }

    tbody.innerHTML = certificatesData.slice(0, 20).map(cert => `
        <tr>
            <td><code style="font-size: 0.85rem;">${cert.certificateId}</code></td>
            <td>${cert.studentName || 'N/A'}</td>
            <td>${formatDate(cert.createdAt)}</td>
            <td><span class="badge badge-success">${cert.status || 'completed'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="action-btn view" onclick="viewCertificate('${cert.id}')" title="View">👁️</button>
                    <button class="action-btn edit" onclick="downloadCertificate('${cert.id}')" title="Download">⬇️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Update Recent Certificates
 */
function updateRecentCerts() {
    const tbody = document.querySelector('#recent-certs tbody');
    if (!tbody) return;

    if (certificatesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">No certificates yet</td></tr>';
        return;
    }

    tbody.innerHTML = certificatesData.slice(0, 5).map(cert => `
        <tr>
            <td>${cert.studentName}</td>
            <td>${formatDate(cert.createdAt)}</td>
            <td><span class="badge badge-success">✓ ${cert.status}</span></td>
        </tr>
    `).join('');
}

/**
 * Load Templates
 */
async function loadTemplates() {
    try {
        const snapshot = await firebaseServices.db.collection('templates')
            .orderBy('createdAt', 'desc')
            .get();

        templatesData = [];
        snapshot.forEach(doc => {
            templatesData.push({ ...doc.data(), id: doc.id });
        });

        displayTemplates();
        updateTemplateSelects();
    } catch (error) {
        console.error('Load templates error:', error);
    }
}

/**
 * Display Templates
 */
function displayTemplates() {
    const templatesListEl = document.getElementById('templates-list');
    if (!templatesListEl) return;

    if (templatesData.length === 0) {
        templatesListEl.innerHTML = '<div style="text-align: center; grid-column: 1/-1;"><p style="color: var(--text-secondary);">No templates uploaded yet</p></div>';
        return;
    }

    templatesListEl.innerHTML = templatesData.map(template => `
        <div class="card">
            <div class="card-body" style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">
                    ${template.fileType === 'pdf' ? '📄' : '🖼️'}
                </div>
                <h4 style="margin: 0.5rem 0;">${template.name}</h4>
                <p style="font-size: 0.85rem; margin: 0.5rem 0; color: var(--text-secondary);">
                    ${template.fileType.toUpperCase()} • ${formatDate(template.createdAt)}
                </p>
                <button class="btn btn-sm btn-danger" onclick="deleteTemplate('${template.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

/**
 * Update Template Select
 */
function updateTemplateSelects() {
    const select = document.getElementById('template-select');
    if (!select) return;

    select.innerHTML = '<option value="">Choose a template...</option>';
    templatesData.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        select.appendChild(option);
    });
}

/**
 * Handle Template Upload
 */
async function handleTemplateUpload(event) {
    event.preventDefault();

    const fileInput = document.getElementById('template-file');
    const file = fileInput.files[0];

    if (!file) {
        showAlert('Please select a file', 'warning');
        return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        showAlert('Only PDF and image files are allowed', 'danger');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showAlert('File size must be less than 5MB', 'danger');
        return;
    }

    showLoading('Uploading template...');

    try {
        const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
        const fileName = `template_${Date.now()}_${file.name}`;
        
        // Upload to Firebase Storage
        const storageRef = firebaseServices.storage.ref(`templates/${fileName}`);
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();

        // Save metadata to Firestore
        await firebaseServices.db.collection('templates').add({
            name: file.name,
            fileType: fileType,
            fileName: fileName,
            downloadURL: downloadURL,
            fileSize: file.size,
            createdAt: new Date().toISOString(),
            uploadedBy: getCurrentUser()?.email || 'unknown'
        });

        showAlert('Template uploaded successfully!', 'success');
        document.getElementById('template-form').reset();
        await loadTemplates();
    } catch (error) {
        console.error('Upload template error:', error);
        showAlert('Failed to upload template', 'danger');
    } finally {
        hideLoading();
    }
}

/**
 * Handle Certificate Generation
 */
async function handleCertificateGeneration(event) {
    event.preventDefault();

    const studentId = document.getElementById('student-select').value;
    const templateId = document.getElementById('template-select').value;
    const sendEmail = document.getElementById('send-email').checked;

    if (!studentId || !templateId) {
        showAlert('Please select student and template', 'warning');
        return;
    }

    showLoading('Generating certificate...');

    try {
        const student = studentsData.find(s => s.id === studentId);
        const template = templatesData.find(t => t.id === templateId);

        if (!student || !template) {
            throw new Error('Student or template not found');
        }

        // Generate unique certificate ID
        const certificateId = generateCertificateId();

        // Generate QR code URL (for verification)
        const verifyUrl = `${window.location.origin}/verify.html?certId=${certificateId}`;

        // Save certificate to Firestore
        const certData = {
            certificateId: certificateId,
            studentId: studentId,
            studentName: student.name,
            studentEmail: student.email,
            courseName: student.course,
            duration: student.duration,
            templateId: templateId,
            templateName: template.name,
            completionDate: student.completionDate || new Date().toISOString(),
            verifyUrl: verifyUrl,
            status: 'completed',
            createdAt: new Date().toISOString(),
            downloadCount: 0,
            verifyCount: 0
        };

        const docRef = await firebaseServices.db.collection('certificates').add(certData);

        // Generate PDF
        await generateCertificatePDF(student, template, certificateId);

        // Send email if requested
        if (sendEmail) {
            await sendCertificateEmail(student, certificateId, verifyUrl, certData);
        }

        // Update student certificate count
        await firebaseServices.db.collection('students').doc(studentId).update({
            certificatesCount: (student.certificatesCount || 0) + 1
        });

        showAlert('Certificate generated successfully!', 'success');
        document.getElementById('cert-gen-form').reset();
        await loadCertificates();
        await loadStudents();
        await updateDashboardStats();

    } catch (error) {
        console.error('Generate certificate error:', error);
        showAlert('Failed to generate certificate', 'danger');
    } finally {
        hideLoading();
    }
}

/**
 * Update Dashboard Stats
 */
async function updateDashboardStats() {
    try {
        // Total students
        const studentsSnapshot = await firebaseServices.db.collection('students').get();
        document.getElementById('stat-students').textContent = studentsSnapshot.size;

        // Total certificates
        const certsSnapshot = await firebaseServices.db.collection('certificates').get();
        document.getElementById('stat-certificates').textContent = certsSnapshot.size;

        // Verified certificates
        const verifiedSnapshot = await firebaseServices.db.collection('certificates')
            .where('verifyCount', '>', 0)
            .get();
        document.getElementById('stat-verified').textContent = verifiedSnapshot.size;

        // Pending (for demo)
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 7);
        const pendingSnapshot = await firebaseServices.db.collection('certificates')
            .where('createdAt', '>=', recentDate.toISOString())
            .get();
        document.getElementById('stat-pending').textContent = pendingSnapshot.size;

    } catch (error) {
        console.error('Update stats error:', error);
    }
}

/**
 * Setup Auto Refresh
 */
function setupAutoRefresh() {
    // Refresh data every 5 minutes
    setInterval(() => {
        if (currentPage === 'dashboard') {
            updateDashboardStats();
            loadCertificates();
        }
    }, 5 * 60 * 1000);
}

/**
 * Toggle User Menu
 */
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    if (userMenu && !userMenu.contains(e.target)) {
        document.getElementById('userDropdown').classList.remove('active');
    }
});

/**
 * View Student Details (modal)
 */
function viewStudentDetails(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    const details = `
        <strong>${student.name}</strong><br>
        Email: ${student.email}<br>
        Course: ${student.course}<br>
        Duration: ${student.duration}<br>
        Department: ${student.department || 'N/A'}<br>
        Status: ${student.status}
    `;

    showAlert(details, 'info', 5000);
}

/**
 * Edit Student
 */
function editStudent(studentId) {
    // TODO: Implement edit functionality
    showAlert('Edit feature coming soon', 'info');
}

/**
 * View Certificate
 */
function viewCertificate(certId) {
    const cert = certificatesData.find(c => c.id === certId);
    if (!cert) return;

    const details = `
        ID: ${cert.certificateId}<br>
        Student: ${cert.studentName}<br>
        Course: ${cert.courseName}<br>
        Date: ${formatDate(cert.createdAt)}<br>
        Verifies: ${cert.verifyCount || 0}
    `;

    showAlert(details, 'info', 5000);
}

/**
 * Download Certificate
 */
async function downloadCertificate(certId) {
    const cert = certificatesData.find(c => c.id === certId);
    if (!cert) {
        showAlert('Certificate not found', 'danger');
        return;
    }

    try {
        // TODO: Implement PDF download from storage
        showAlert('Downloading certificate...', 'info');
    } catch (error) {
        showAlert('Failed to download certificate', 'danger');
    }
}

/**
 * Delete Template
 */
async function deleteTemplate(templateId) {
    if (!confirm('Delete this template?')) return;

    showLoading('Deleting template...');

    try {
        const template = templatesData.find(t => t.id === templateId);
        
        // Delete from storage
        if (template && template.fileName) {
            const fileRef = firebaseServices.storage.ref(`templates/${template.fileName}`);
            try {
                await fileRef.delete();
            } catch (error) {
                console.warn('File not found in storage');
            }
        }

        // Delete from Firestore
        await firebaseServices.db.collection('templates').doc(templateId).delete();
        
        showAlert('Template deleted!', 'success');
        await loadTemplates();
    } catch (error) {
        console.error('Delete template error:', error);
        showAlert('Failed to delete template', 'danger');
    } finally {
        hideLoading();
    }
}

/**
 * Handle Email Configuration
 */
async function handleEmailConfig(event) {
    event.preventDefault();

    const config = {
        serviceId: document.getElementById('emailjs-service').value,
        publicKey: document.getElementById('emailjs-public').value,
        templateId: document.getElementById('emailjs-template').value,
        fromEmail: document.getElementById('email-from').value,
        subjectTemplate: document.getElementById('email-subject').value,
        bodyTemplate: document.getElementById('email-body').value
    };

    // Store in localStorage
    localStorage.setItem('emailConfig', JSON.stringify(config));

    // Initialize EmailJS if credentials provided
    if (config.publicKey) {
        emailjs.init(config.publicKey);
    }

    showAlert('Email configuration saved!', 'success');
}

/**
 * Open Bulk Upload Modal
 */
function openBulkUploadModal() {
    showAlert('Bulk upload feature - Please upload CSV with columns: name, email, course, duration, department', 'info', 5000);
}
