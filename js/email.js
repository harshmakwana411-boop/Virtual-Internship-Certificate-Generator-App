/**
 * Email Service Module
 * Handles email sending via EmailJS and Firebase
 */

/**
 * Send Certificate Email
 */
async function sendCertificateEmail(student, certificateId, verifyUrl, certificateData) {
    try {
        // Get email configuration
        const configStr = localStorage.getItem('emailConfig');
        const config = configStr ? JSON.parse(configStr) : null;

        if (!config || !config.serviceId || !config.publicKey) {
            console.warn('Email configuration not set. Skipping email.');
            return false;
        }

        // Initialize EmailJS if not already done
        if (!window.emailjs) {
            console.error('EmailJS not loaded');
            return false;
        }

        emailjs.init(config.publicKey);

        // Prepare email template variables
        const templateParams = {
            to_email: student.email,
            to_name: student.name,
            student_name: student.name,
            course_name: student.course,
            certificate_id: certificateId,
            verify_url: verifyUrl,
            completion_date: new Date().toLocaleDateString(),
            subject: config.subjectTemplate?.replace('{{studentName}}', student.name) || 
                     `Your Certificate - ${student.name}`,
            message: formatEmailBody(config, student, certificateId, verifyUrl)
        };

        // Send email
        const response = await emailjs.send(
            config.serviceId,
            config.templateId,
            templateParams
        );

        console.log('Email sent successfully:', response);
        return true;

    } catch (error) {
        console.error('Send email error:', error);
        return false;
    }
}

/**
 * Format Email Body
 */
function formatEmailBody(config, student, certificateId, verifyUrl) {
    let body = config.bodyTemplate || `Dear {{studentName}},

Congratulations! Your certificate for {{courseName}} has been generated.

Certificate ID: {{certificateId}}

You can verify your certificate at: {{verifyUrl}}

Best regards,
Certificate Generator Team`;

    return body
        .replace('{{studentName}}', student.name)
        .replace('{{courseName}}', student.course)
        .replace('{{certificateId}}', certificateId)
        .replace('{{verifyUrl}}', verifyUrl);
}

/**
 * Send Bulk Emails
 */
async function sendBulkEmails(students, emailTemplate) {
    try {
        const results = {
            success: 0,
            failed: 0
        };

        for (const student of students) {
            try {
                const certificateId = generateCertificateId();
                const verifyUrl = `${window.location.origin}/verify.html?certId=${certificateId}`;
                
                await sendCertificateEmail(student, certificateId, verifyUrl, {});
                results.success++;
            } catch (error) {
                console.error(`Failed to send email to ${student.email}:`, error);
                results.failed++;
            }
        }

        return results;

    } catch (error) {
        console.error('Bulk email error:', error);
        throw error;
    }
}

/**
 * Send Test Email
 */
async function sendTestEmail(recipientEmail) {
    try {
        showLoading('Sending test email...');

        const configStr = localStorage.getItem('emailConfig');
        const config = configStr ? JSON.parse(configStr) : null;

        if (!config || !config.serviceId || !config.publicKey) {
            throw new Error('Email configuration not set');
        }

        emailjs.init(config.publicKey);

        const templateParams = {
            to_email: recipientEmail,
            to_name: 'Test User',
            subject: 'Test Email - Certificate Generator',
            message: 'This is a test email. If you received this, your email configuration is working correctly!'
        };

        await emailjs.send(
            config.serviceId,
            config.templateId,
            templateParams
        );

        hideLoading();
        showAlert('Test email sent successfully!', 'success');
        return true;

    } catch (error) {
        console.error('Test email error:', error);
        hideLoading();
        showAlert('Failed to send test email: ' + error.message, 'danger');
        return false;
    }
}

/**
 * Get Email Configuration
 */
function getEmailConfig() {
    const configStr = localStorage.getItem('emailConfig');
    return configStr ? JSON.parse(configStr) : null;
}

/**
 * Validate Email Configuration
 */
function validateEmailConfig(config) {
    const requiredFields = ['serviceId', 'publicKey', 'templateId', 'fromEmail'];
    
    for (const field of requiredFields) {
        if (!config[field] || config[field].trim() === '') {
            return { valid: false, message: `Missing required field: ${field}` };
        }
    }

    return { valid: true };
}

/**
 * Create Email Template
 */
function createEmailTemplate(certificateData) {
    return `
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; }
                    .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .footer { background: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666; }
                    .btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎓 Certificate of Completion</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${certificateData.studentName},</p>
                        <p>Congratulations! Your certificate for <strong>${certificateData.courseName}</strong> has been generated.</p>
                        <p style="margin: 20px 0;">
                            <strong>Certificate Details:</strong><br>
                            Certificate ID: ${certificateData.certificateId}<br>
                            Issued Date: ${new Date().toLocaleDateString()}<br>
                            Duration: ${certificateData.duration}
                        </p>
                        <p style="text-align: center; margin: 20px 0;">
                            <a href="${certificateData.verifyUrl}" class="btn">Verify Certificate</a>
                        </p>
                        <p>You can download your certificate and share your achievement with others.</p>
                        <p>Best regards,<br><strong>Certificate Generator Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Certificate Generator. All rights reserved.</p>
                    </div>
                </div>
            </body>
        </html>
    `;
}

/**
 * Schedule Email
 */
async function scheduleEmail(recipientEmail, certificateData, delayMinutes = 0) {
    try {
        const scheduledTime = new Date();
        scheduledTime.setMinutes(scheduledTime.getMinutes() + delayMinutes);

        await firebaseServices.db.collection('emailQueue').add({
            recipientEmail: recipientEmail,
            certificateData: certificateData,
            scheduledTime: scheduledTime.toISOString(),
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error('Schedule email error:', error);
        return false;
    }
}

/**
 * Resend Certificate Email
 */
async function resendCertificateEmail(certificateId) {
    try {
        showLoading('Resending email...');

        const cert = await firebaseServices.db.collection('certificates')
            .where('certificateId', '==', certificateId)
            .get();

        if (cert.empty) {
            throw new Error('Certificate not found');
        }

        const certData = cert.docs[0].data();
        const success = await sendCertificateEmail(
            {
                name: certData.studentName,
                email: certData.studentEmail,
                course: certData.courseName
            },
            certificateId,
            certData.verifyUrl,
            certData
        );

        hideLoading();

        if (success) {
            showAlert('Certificate email resent!', 'success');
        } else {
            showAlert('Failed to resend email', 'danger');
        }

    } catch (error) {
        console.error('Resend email error:', error);
        hideLoading();
        showAlert('Failed to resend email', 'danger');
    }
}
