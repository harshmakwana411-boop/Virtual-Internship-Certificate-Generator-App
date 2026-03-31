/**
 * QR Code Utilities
 * Handles QR code generation, scanning, and verification
 */

/**
 * Generate QR Code for Certificate
 */
function generateCertQRCode(certificateId, size = 200) {
    return new Promise((resolve, reject) => {
        try {
            const verifyUrl = `${window.location.origin}/verify.html?certId=${certificateId}`;
            const elementId = `qr-${certificateId}`;
            
            // Create container if not exists
            let container = document.getElementById(elementId);
            if (!container) {
                container = document.createElement('div');
                container.id = elementId;
                container.style.display = 'none';
                document.body.appendChild(container);
            }

            container.innerHTML = '';

            // Generate QR code
            new QRCode(container, {
                text: verifyUrl,
                width: size,
                height: size,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H,
                useSVG: false
            });

            // Get canvas element
            setTimeout(() => {
                const canvas = container.querySelector('canvas');
                if (canvas) {
                    resolve({
                        dataUrl: canvas.toDataURL('image/png'),
                        element: canvas
                    });
                } else {
                    reject(new Error('QR code generation failed'));
                }
            }, 500);

        } catch (error) {
            console.error('QR code generation error:', error);
            reject(error);
        }
    });
}

/**
 * Encode Certificate Data in QR
 */
function encodeCertificateQR(certificateData) {
    const encoded = {
        id: certificateData.certificateId,
        student: certificateData.studentName,
        course: certificateData.courseName,
        date: certificateData.createdAt,
        verify: `${window.location.origin}/verify.html?certId=${certificateData.certificateId}`
    };

    return JSON.stringify(encoded);
}

/**
 * Decode QR Code Data
 */
function decodeCertificateQR(qrData) {
    try {
        return JSON.parse(qrData);
    } catch (error) {
        console.error('QR decode error:', error);
        // If not JSON, assume it's a URL
        const url = new URL(qrData);
        return {
            id: url.searchParams.get('certId'),
            verify: qrData
        };
    }
}

/**
 * Download QR Code
 */
function downloadQRCode(certificateId, dataUrl) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qr-${certificateId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Generate QR Code as Base64
 */
async function getQRCodeBase64(certificateId, size = 200) {
    try {
        const result = await generateCertQRCode(certificateId, size);
        return result.dataUrl;
    } catch (error) {
        console.error('Get QR base64 error:', error);
        return null;
    }
}

/**
 * Embed QR in PDF
 */
async function embedQRInPDF(pdfElement, qrDataUrl, position = 'bottom-right') {
    try {
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        
        // Position QR code
        const positionMap = {
            'top-left': { top: '20px', left: '20px' },
            'top-right': { top: '20px', right: '20px' },
            'bottom-left': { bottom: '20px', left: '20px' },
            'bottom-right': { bottom: '20px', right: '20px' }
        };

        const pos = positionMap[position] || positionMap['bottom-right'];
        
        qrImg.style.position = 'absolute';
        qrImg.style.width = '100px';
        qrImg.style.height = '100px';
        Object.assign(qrImg.style, pos);

        pdfElement.appendChild(qrImg);
        
        return qrImg;
    } catch (error) {
        console.error('Embed QR error:', error);
        return null;
    }
}

/**
 * Initialize QR Scanner
 */
function initializeQRScanner(videoElementId, onDecode) {
    const html5QrCode = new Html5Qrcode(videoElementId);

    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        aspectRatio: 1.0
    };

    const config2 = {
        fps: 10,
        qrbox: { width: 250, height: 250 }
    };

    html5QrCode.start(
        { facingMode: "environment" },
        config2,
        onDecode,
        (error) => {
            // Silently handle scanning errors
            if (error && !error.toString().includes('NotFound')) {
                console.debug('QR scan error:', error);
            }
        }
    ).catch(err => console.warn('Scanner start warning:', err));

    return html5QrCode;
}

/**
 * Stop QR Scanner
 */
function stopQRScanner(html5QrCodeInstance) {
    try {
        if (html5QrCodeInstance) {
            html5QrCodeInstance.stop().then(() => {
                console.log('QR scanner stopped');
            }).catch(err => console.warn('Stop error:', err));
        }
    } catch (error) {
        console.error('Error stopping scanner:', error);
    }
}

/**
 * Validate QR Code Content
 */
function validateQRContent(content) {
    try {
        // Check if it's a URL
        if (content.startsWith('http')) {
            new URL(content);
            return { valid: true, type: 'url' };
        }

        // Check if it's JSON
        const parsed = JSON.parse(content);
        if (parsed.id && parsed.verify) {
            return { valid: true, type: 'certificate', data: parsed };
        }

        return { valid: false, error: 'Invalid QR content format' };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

/**
 * Generate Multiple QR Codes
 */
async function generateBulkQRCodes(certificateIds) {
    try {
        const results = [];

        for (const certId of certificateIds) {
            const qrData = await generateCertQRCode(certId);
            results.push({
                certificateId: certId,
                qrBase64: qrData.dataUrl
            });
        }

        return results;
    } catch (error) {
        console.error('Bulk QR generation error:', error);
        return [];
    }
}

/**
 * Create QR Code Poster
 */
async function createQRPoster(certificateIds, title = 'Certificate QR Codes') {
    try {
        const element = document.createElement('div');
        element.style.padding = '20px';
        element.style.backgroundColor = 'white';
        element.innerHTML = `<h1>${title}</h1>`;

        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        grid.style.gap = '20px';
        grid.style.marginTop = '20px';

        for (const certId of certificateIds) {
            const qrData = await generateCertQRCode(certId, 150);
            
            const card = document.createElement('div');
            card.style.border = '1px solid #ccc';
            card.style.padding = '10px';
            card.style.textAlign = 'center';
            card.innerHTML = `
                <img src="${qrData.dataUrl}" style="width: 100%;" />
                <p style="margin-top: 10px; font-size: 12px;">${certId}</p>
            `;
            
            grid.appendChild(card);
        }

        element.appendChild(grid);
        
        // Generate PDF
        html2pdf().set({
            margin: 10,
            filename: `qr-codes-poster-${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { format: 'a4', orientation: 'landscape' }
        }).from(element).save();

        return true;
    } catch (error) {
        console.error('Create poster error:', error);
        return false;
    }
}

/**
 * Extract Certificate ID from URL
 */
function extractCertIdFromURL(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('certId');
    } catch (error) {
        console.error('URL parse error:', error);
        return null;
    }
}

/**
 * Generate Verification Link
 */
function generateVerificationLink(certificateId) {
    return `${window.location.origin}/verify.html?certId=${certificateId}`;
}
