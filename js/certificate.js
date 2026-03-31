/**
 * Certificate Generation Module
 * Handles PDF generation, QR codes, and certificate creation
 */

/**
 * Generate Certificate PDF
 */
async function generateCertificatePDF(student, template, certificateId) {
    try {
        const verifyUrl = `${window.location.origin}/verify.html?certId=${certificateId}`;

        // Create HTML content for the certificate
        const html = `
            <div style="
                width: 1200px;
                height: 850px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #fff;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-family: 'Georgia', serif;
                position: relative;
                overflow: hidden;
            ">
                <!-- Decorative corners -->
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 50px;
                    height: 50px;
                    border-top: 5px solid rgba(255,255,255,0.3);
                    border-left: 5px solid rgba(255,255,255,0.3);
                "></div>
                <div style="
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 50px;
                    height: 50px;
                    border-bottom: 5px solid rgba(255,255,255,0.3);
                    border-right: 5px solid rgba(255,255,255,0.3);
                "></div>

                <!-- Content -->
                <div style="text-align: center; z-index: 10;">
                    <h1 style="margin: 0; font-size: 60px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                        Certificate of Completion
                    </h1>

                    <p style="
                        margin: 40px 0 0 0;
                        font-size: 32px;
                        text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
                    ">
                        This is to certify that
                    </p>

                    <h2 style="
                        margin: 30px 0;
                        font-size: 48px;
                        text-decoration: underline;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    ">
                        ${student.name}
                    </h2>

                    <p style="font-size: 24px; margin: 20px 0;">
                        Has successfully completed the
                    </p>

                    <p style="
                        font-size: 28px;
                        font-weight: bold;
                        margin: 10px 0;
                        text-decoration: underline;
                    ">
                        ${student.course}
                    </p>

                    <p style="font-size: 18px; margin: 20px 0;">
                        ${student.duration ? `Duration: ${student.duration}` : ''}
                    </p>

                    <p style="
                        font-size: 16px;
                        margin-top: 30px;
                        font-style: italic;
                        color: rgba(255,255,255,0.9);
                    ">
                        Issued on: ${new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>

                    <p style="
                        font-size: 14px;
                        margin-top: 30px;
                        font-family: monospace;
                        color: rgba(255,255,255,0.8);
                    ">
                        Certificate ID: ${certificateId}
                    </p>

                    <div id="qr-container" style="margin-top: 30px;"></div>
                </div>
            </div>
        `;

        return html;
    } catch (error) {
        console.error('Generate PDF error:', error);
        throw error;
    }
}

/**
 * Generate QR Code
 */
function generateQRCode(text, elementId, size = 150) {
    return new Promise((resolve) => {
        const element = document.getElementById(elementId);
        if (!element) {
            // Create element if it doesn't exist
            const div = document.createElement('div');
            div.id = elementId;
            document.body.appendChild(div);
            element = div;
        }

        element.innerHTML = ''; // Clear previous QR

        // Generate QR code
        new QRCode(element, {
            text: text,
            width: size,
            height: size,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        resolve(element.querySelector('canvas'));
    });
}

/**
 * Download Certificate PDF (with QR code embedded)
 */
async function downloadCertificateWithQR(student, certificate, certificateId) {
    try {
        showLoading('Generating PDF...');

        const element = document.createElement('div');
        element.innerHTML = await generateCertificatePDF(student, null, certificateId);

        // Generate QR code
        const qrCanvas = await generateQRCode(
            `${window.location.origin}/verify.html?certId=${certificateId}`,
            'temp-qr',
            120
        );

        // Add QR to certificate
        const qrContainer = element.querySelector('#qr-container');
        if (qrContainer && qrCanvas) {
            qrContainer.appendChild(qrCanvas.cloneNode(true));
        }

        // Generate PDF using html2pdf
        const opt = {
            margin: 0,
            filename: `Certificate_${student.name}_${certificateId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { format: 'a4', orientation: 'landscape' }
        };

        await html2pdf().set(opt).from(element).save();

        hideLoading();
    } catch (error) {
        console.error('Download PDF error:', error);
        showAlert('Failed to generate PDF', 'danger');
    }
}

/**
 * Create Certificate Record
 */
async function createCertificateRecord(studentId, templateId, certificateId) {
    try {
        const student = await firebaseServices.db.collection('students').doc(studentId).get();
        const studentData = student.data();

        const certRecord = {
            certificateId: certificateId,
            studentId: studentId,
            studentName: studentData.name,
            studentEmail: studentData.email,
            courseName: studentData.course,
            duration: studentData.duration,
            department: studentData.department,
            templateId: templateId,
            createdAt: new Date().toISOString(),
            downloadCount: 0,
            verifications: [],
            status: 'active'
        };

        const docRef = await firebaseServices.db.collection('certificates').add(certRecord);
        return { ...certRecord, id: docRef.id };

    } catch (error) {
        console.error('Create certificate record error:', error);
        throw error;
    }
}

/**
 * Bulk Generate Certificates from CSV
 */
async function bulkGenerateCertificates(csvData, templateId) {
    try {
        showLoading('Processing bulk upload...');

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const row of csvData) {
            try {
                // Check if student exists
                const query = await firebaseServices.db.collection('students')
                    .where('email', '==', row.email)
                    .get();

                let studentId;
                if (query.empty) {
                    // Create new student
                    const studentRef = await firebaseServices.db.collection('students').add({
                        name: row.name,
                        email: row.email,
                        course: row.course,
                        duration: row.duration,
                        department: row.department || '',
                        status: 'active',
                        createdAt: new Date().toISOString()
                    });
                    studentId = studentRef.id;
                } else {
                    studentId = query.docs[0].id;
                }

                // Generate certificate
                const certificateId = generateCertificateId();
                await createCertificateRecord(studentId, templateId, certificateId);

                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push(`${row.email || row.name}: ${error.message}`);
            }
        }

        hideLoading();
        
        const message = `Processed: ${results.success} success, ${results.failed} failed`;
        showAlert(message, results.failed === 0 ? 'success' : 'warning');

        if (results.errors.length > 0) {
            console.error('Errors:', results.errors);
        }

        return results;

    } catch (error) {
        console.error('Bulk generate error:', error);
        showAlert('Bulk generation failed', 'danger');
        hideLoading();
    }
}

/**
 * Store Certificate in Firestore
 */
async function storeCertificate(certificateData) {
    try {
        const docRef = await firebaseServices.db.collection('certificates').add({
            ...certificateData,
            createdAt: new Date().toISOString(),
            status: 'active'
        });

        return { ...certificateData, id: docRef.id };
    } catch (error) {
        console.error('Store certificate error:', error);
        throw error;
    }
}

/**
 * Increment Certificate Download Count
 */
async function incrementDownloadCount(certificateId) {
    try {
        const doc = await firebaseServices.db.collection('certificates').doc(certificateId).get();
        const currentCount = doc.data()?.downloadCount || 0;

        await firebaseServices.db.collection('certificates').doc(certificateId).update({
            downloadCount: currentCount + 1,
            lastDownloadedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Update download count error:', error);
    }
}

/**
 * Get Certificate by ID
 */
async function getCertificateById(certificateId) {
    try {
        const snapshot = await firebaseServices.db.collection('certificates')
            .where('certificateId', '==', certificateId)
            .get();

        if (snapshot.empty) return null;
        return { ...snapshot.docs[0].data(), id: snapshot.docs[0].id };
    } catch (error) {
        console.error('Get certificate error:', error);
        return null;
    }
}

/**
 * Verify Certificate
 */
async function verifyCertificate(certificateId) {
    try {
        const cert = await getCertificateById(certificateId);
        
        if (!cert) {
            return { valid: false, message: 'Certificate not found' };
        }

        // Increment verification count
        await firebaseServices.db.collection('certificates').doc(cert.id).update({
            verifyCount: (cert.verifyCount || 0) + 1,
            lastVerifiedAt: new Date().toISOString()
        });

        return {
            valid: true,
            data: cert,
            message: 'Certificate verified successfully'
        };
    } catch (error) {
        console.error('Verify certificate error:', error);
        return { valid: false, message: 'Verification failed' };
    }
}

/**
 * Export Certificates as CSV
 */
async function exportCertificatesAsCSV() {
    try {
        const snapshot = await firebaseServices.db.collection('certificates').get();
        
        const data = snapshot.docs.map(doc => ({
            'Certificate ID': doc.data().certificateId,
            'Student Name': doc.data().studentName,
            'Email': doc.data().studentEmail,
            'Course': doc.data().courseName,
            'Generated Date': formatDate(doc.data().createdAt),
            'Downloads': doc.data().downloadCount || 0,
            'Verifications': doc.data().verifyCount || 0,
            'Status': doc.data().status
        }));

        // Convert to CSV
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
        ].join('\n');

        downloadFile(csv, `certificates_export_${Date.now()}.csv`, 'text/csv');
        showAlert('Certificates exported!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showAlert('Export failed', 'danger');
    }
}
