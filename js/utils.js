/**
 * Utility Functions
 * Common functions for alerts, loading, modal management
 */

/**
 * Show Alert Message
 */
function showAlert(message, type = 'info', duration = 4000) {
    const container = document.getElementById('alert-container');
    
    const alertTypes = {
        'success': { icon: '✅', class: 'alert-success' },
        'danger': { icon: '❌', class: 'alert-danger' },
        'warning': { icon: '⚠️', class: 'alert-warning' },
        'info': { icon: 'ℹ️', class: 'alert-info' }
    };

    const config = alertTypes[type] || alertTypes['info'];
    
    const alert = document.createElement('div');
    alert.className = `alert ${config.class}`;
    alert.innerHTML = `${config.icon} ${message}`;
    alert.style.animation = 'slideIn 0.3s ease-out';
    
    container.appendChild(alert);

    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => alert.remove(), 300);
    }, duration);
}

/**
 * Show Loading Indicator
 */
function showLoading(message = 'Loading...') {
    const loader = document.getElementById('loading-indicator');
    if (loader) {
        document.getElementById('loading-text').textContent = message;
        loader.style.display = 'block';
    }
}

/**
 * Hide Loading Indicator
 */
function hideLoading() {
    const loader = document.getElementById('loading-indicator');
    if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * Open Modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close Modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

/**
 * Format Date
 */
function formatDate(date) {
    if (!date) return 'N/A';
    if (typeof date === 'string') date = new Date(date);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Generate Unique ID
 */
function generateUniqueId(prefix = 'CERT') {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate Certificate ID
 */
function generateCertificateId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `CERT-${year}-${random}`;
}

/**
 * Copy to Clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Copied to clipboard!', 'success', 2000);
    }).catch(() => {
        showAlert('Failed to copy', 'danger');
    });
}

/**
 * Download File
 */
function downloadFile(data, filename, mimeType = 'application/octet-stream') {
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Validate Email
 */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Format Currency
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount);
}

/**
 * Parse CSV
 */
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const obj = {};
        const values = lines[i].split(',');
        
        headers.forEach((header, index) => {
            obj[header] = values[index] ? values[index].trim() : '';
        });
        
        data.push(obj);
    }

    return data;
}

/**
 * Debounce Function
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle Function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Add CSS for animations
 */
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }

    .alert {
        animation: slideIn 0.3s ease-out !important;
    }
`;
document.head.appendChild(style);

/**
 * Theme Toggle
 */
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
}

/**
 * Update Theme Icon
 */
function updateThemeIcon() {
    const icons = document.querySelectorAll('#theme-icon');
    icons.forEach(icon => {
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
}

/**
 * Initialize Theme
 */
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
});
