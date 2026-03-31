/**
 * Certificate Verification Module
 * Handles certificate verification by ID or QR code
 */

let qrScanner;
let cameraActive = false;

/**
 * Initialize Verification Page
 */
async function initVerification() {
    loadVerificationStats();
}

/**
 * Handle Verify by ID
 */
async function handleVerifyById(event) {
    event.preventDefault();

    const certId = document.getElementById('cert-id-input').value.trim();

    if (!certId) {
        showAlert('Please enter a certificate ID', 'warning');
        return;
    }

    showLoading('Verifying certificate...');

    try {
        const result = await verifyCertificateFromDatabase(certId);
        displayVerificationResult(result);
    } catch (error) {
        console.error('Verification error:', error);
        showAlert('Verification failed. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

/**
 * Verify Certificate from Database
 */
async function verifyCertificateFromDatabase(certificateId) {
    try {
        const snapshot = await firebaseServices.db.collection('certificates')
            .where('certificateId', '==', certificateId)
            .get();

        if (snapshot.empty) {
            return {
                valid: false,
                message: 'Certificate not found in our database',
                certificateId: certificateId
            };
        }

        const certDoc = snapshot.docs[0];
        const certData = certDoc.data();

        // Update verification count
        await firebaseServices.db.collection('certificates').doc(certDoc.id).update({
            verifyCount: (certData.verifyCount || 0) + 1,
            lastVerifiedAt: new Date().toISOString()
        });

        return {
            valid: true,
            data: certData,
            id: certDoc.id,
            message: 'Certificate verified successfully'
        };

    } catch (error) {
        console.error('Database verification error:', error);
        throw error;
    }
}

/**
 * Display Verification Result
 */
function displayVerificationResult(result) {
    document.getElementById('verify-result-container').style.display = 'block';
    
    const resultContainer = document.getElementById('verify-result');
    
    if (result.valid) {
        const data = result.data;
        const verifiedDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        resultContainer.innerHTML = `
            <div class="result-status success">
                <div class="result-status-icon">✅</div>
                <div>
                    <strong>Certificate Verified!</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem;">This is a genuine certificate from our system</p>
                </div>
            </div>

            <div class="result-details">
                <div class="detail-row">
                    <span class="detail-label">Certificate ID:</span>
                    <span class="detail-value"><code>${data.certificateId}</code></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Student Name:</span>
                    <span class="detail-value">${data.studentName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${data.studentEmail}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Course:</span>
                    <span class="detail-value">${data.courseName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">${data.duration || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Issued Date:</span>
                    <span class="detail-value">${formatDate(data.createdAt)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Verified At:</span>
                    <span class="detail-value">${new Date().toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Verifications:</span>
                    <span class="detail-value">${(data.verifyCount || 0) + 1}</span>
                </div>
            </div>

            <div class="cert-actions">
                <button class="btn btn-primary" onclick="downloadVerifiedCertificate('${data.certificateId}')">
                    📥 Download Certificate
                </button>
                <button class="btn btn-secondary" onclick="copyCertificateLink('${data.certificateId}')">
                    🔗 Share Certificate Link
                </button>
            </div>
        `;

    } else {
        resultContainer.innerHTML = `
            <div class="result-status error">
                <div class="result-status-icon">❌</div>
                <div>
                    <strong>Certificate Not Found</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem;">${result.message}</p>
                </div>
            </div>

            <div style="margin-top: 1.5rem; padding: 1rem; background-color: var(--bg-tertiary); border-radius: 0.5rem;">
                <p><strong>Troubleshooting:</strong></p>
                <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                    <li>Check that the Certificate ID is correct</li>
                    <li>Verify the QR code is readable and not damaged</li>
                    <li>Try scanning the QR code again</li>
                    <li>Contact support if the issue persists</li>
                </ul>
            </div>
        `;
    }

    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Start QR Scanner
 */
async function startQRScanner() {
    try {
        showLoading('Starting camera...');

        const videoElement = document.getElementById('qr-video');
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showAlert('Camera not supported on this device', 'danger');
            hideLoading();
            return;
        }

        // Get camera stream
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
        });

        videoElement.srcObject = stream;
        videoElement.style.display = 'block';
        cameraActive = true;

        document.getElementById('start-camera').style.display = 'none';
        document.getElementById('stop-camera').style.display = 'inline-block';

        // Initialize QR Scanner using html5-qrcode
        initializeQRScanner(stream);

        showAlert('Camera started. Point at QR code', 'success', 2000);
        hideLoading();

    } catch (error) {
        console.error('Camera error:', error);
        showAlert('Failed to access camera. Check permissions.', 'danger');
        hideLoading();
    }
}

/**
 * Initialize QR Scanner with html5-qrcode
 */
function initializeQRScanner(stream) {
    const html5QrCode = new Html5Qrcode("qr-video");

    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250},
        aspectRatio: 1.0
    };

    html5QrCode.start(
        { facingMode: "environment" },
        config,
        onQRCodeSuccessful,
        onQRCodeError
    );
}

/**
 * QR Code Successfully Decoded
 */
async function onQRCodeSuccessful(decodedText, decodedResult) {
    try {
        stopQRScanner();
        
        // Extract certificate ID from URL or text
        let certificateId = decodedText;
        
        if (decodedText.includes('certId=')) {
            const url = new URL(decodedText);
            certificateId = url.searchParams.get('certId');
        }

        if (certificateId) {
            document.getElementById('cert-id-input').value = certificateId;
            
            showLoading('Verifying QR code...');
            const result = await verifyCertificateFromDatabase(certificateId);
            displayVerificationResult(result);
            hideLoading();
        }
    } catch (error) {
        console.error('QR code processing error:', error);
        showAlert('Failed to process QR code', 'danger');
    }
}

/**
 * QR Code Error Handler
 */
function onQRCodeError(error) {
    // Silently continue scanning
    console.debug('QR Code error:', error);
}

/**
 * Stop QR Scanner
 */
function stopQRScanner() {
    try {
        const videoElement = document.getElementById('qr-video');
        if (videoElement.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
        }
        videoElement.style.display = 'none';
        cameraActive = false;

        document.getElementById('start-camera').style.display = 'inline-block';
        document.getElementById('stop-camera').style.display = 'none';

        // Stop html5-qrcode scanner if exists
        if (window.html5QrcodeScanner) {
            window.html5QrcodeScanner.stop();
        }

        showAlert('Camera stopped', 'info', 1500);
    } catch (error) {
        console.error('Stop camera error:', error);
    }
}

/**
 * Handle QR Image Upload
 */
async function handleQRImageUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;

    showLoading('Processing QR code image...');

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                // Try to decode QR using html5-qrcode
                const html5QrCode = new Html5Qrcode("temp-canvas");
                const decodedText = await html5QrCode.scanFile(file, true);
                
                let certificateId = decodedText;
                if (decodedText.includes('certId=')) {
                    const url = new URL(decodedText);
                    certificateId = url.searchParams.get('certId');
                }

                if (certificateId) {
                    document.getElementById('cert-id-input').value = certificateId;
                    const result = await verifyCertificateFromDatabase(certificateId);
                    displayVerificationResult(result);
                }
            } catch (error) {
                showAlert('Could not read QR code from image', 'danger');
            }
            hideLoading();
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('QR image upload error:', error);
        showAlert('Failed to process image', 'danger');
        hideLoading();
    }
}

/**
 * Download Verified Certificate
 */
async function downloadVerifiedCertificate(certificateId) {
    showAlert('Download feature - Certificate PDF would be downloaded', 'info', 3000);
}

/**
 * Copy Certificate Link
 */
function copyCertificateLink(certificateId) {
    const link = `${window.location.origin}/verify.html?certId=${certificateId}`;
    copyToClipboard(link);
}

/**
 * Reset Verification
 */
function resetVerification() {
    document.getElementById('verify-result-container').style.display = 'none';
    document.getElementById('cert-id-input').value = '';
    document.getElementById('qr-image-input').value = '';
    stopQRScanner();
}

/**
 * Load Verification Statistics
 */
async function loadVerificationStats() {
    try {
        const snapshot = await firebaseServices.db.collection('certificates').get();
        
        let totalVerifications = 0;
        let uniqueStudents = new Set();

        snapshot.forEach(doc => {
            const data = doc.data();
            totalVerifications += data.verifyCount || 0;
            if (data.studentId) uniqueStudents.add(data.studentId);
        });

        console.log(`Total verifications: ${totalVerifications}, Unique students: ${uniqueStudents.size}`);
    } catch (error) {
        console.error('Load stats error:', error);
    }
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    initVerification();
});
