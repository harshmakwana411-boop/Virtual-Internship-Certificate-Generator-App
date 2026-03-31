/**
 * Authentication Module
 * Handles Firebase authentication for admin login/signup
 */

/**
 * Handle Login
 */
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    showLoading('Signing in...');

    try {
        const userCredential = await firebaseServices.auth.signInWithEmailAndPassword(email, password);
        showAlert('Login successful! Redirecting...', 'success');
        
        // Store user info in localStorage
        localStorage.setItem('adminUser', JSON.stringify({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName
        }));

        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);
    } catch (error) {
        console.error('Login error:', error);
        let message = 'Login failed. Please try again.';

        if (error.code === 'auth/user-not-found') {
            message = 'No account found with this email. Please sign up first.';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Invalid email address.';
        } else if (error.code === 'auth/user-disabled') {
            message = 'This account has been disabled.';
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Too many login attempts. Please try again later.';
        }

        showAlert(message, 'danger');
    } finally {
        hideLoading();
    }
}

/**
 * Handle Sign Up
 */
async function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById('signup-name').value;
    const org = document.getElementById('signup-org').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;

    // Validation
    if (password !== passwordConfirm) {
        showAlert('Passwords do not match', 'danger');
        return;
    }

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters', 'danger');
        return;
    }

    showLoading('Creating account...');

    try {
        // Create user
        const userCredential = await firebaseServices.auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update profile
        await user.updateProfile({
            displayName: name
        });

        // Store admin info in Firestore
        await firebaseServices.db.collection('admins').doc(user.uid).set({
            name: name,
            organization: org,
            email: email,
            phone: '',
            role: 'admin',
            createdAt: new Date().toISOString(),
            status: 'active',
            preferences: {
                theme: 'light',
                notifications: true
            }
        });

        showAlert('Account created successfully! Redirecting...', 'success');

        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
    } catch (error) {
        console.error('Signup error:', error);
        let message = 'Sign up failed. Please try again.';

        if (error.code === 'auth/email-already-in-use') {
            message = 'This email is already registered. Please login instead.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Invalid email address.';
        } else if (error.code === 'auth/weak-password') {
            message = 'Password is too weak. Use at least 6 characters.';
        }

        showAlert(message, 'danger');
    } finally {
        hideLoading();
    }
}

/**
 * Handle Logout
 */
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        showLoading('Logging out...');
        try {
            await firebaseServices.auth.signOut();
            localStorage.removeItem('adminUser');
            localStorage.removeItem('emailConfig');
            window.location.href = 'auth.html';
        } catch (error) {
            console.error('Logout error:', error);
            showAlert('Logout failed', 'danger');
        }
    }
}

/**
 * Handle Forgot Password
 */
async function handleForgotPassword() {
    const email = prompt('Enter your email address:');
    
    if (email) {
        showLoading('Sending reset email...');
        try {
            await firebaseServices.auth.sendPasswordResetEmail(email);
            showAlert('Password reset email sent! Check your inbox.', 'success');
        } catch (error) {
            console.error('Reset error:', error);
            showAlert('Failed to send reset email. Please check the email address.', 'danger');
        } finally {
            hideLoading();
        }
    }
}

/**
 * Get Current User
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('adminUser');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Check if User is Authenticated
 */
async function checkAuth() {
    return new Promise((resolve) => {
        if (firebaseServices && firebaseServices.auth) {
            firebaseServices.auth.onAuthStateChanged(user => {
                resolve(user);
            });
        } else {
            resolve(null);
        }
    });
}

/**
 * Get User Profile
 */
async function getUserProfile() {
    try {
        const user = firebaseServices.auth.currentUser;
        if (!user) return null;

        const doc = await firebaseServices.db.collection('admins').doc(user.uid).get();
        return doc.exists ? { ...doc.data(), uid: doc.id } : { 
            uid: user.uid,
            email: user.email,
            displayName: user.displayName 
        };
    } catch (error) {
        console.error('Get profile error:', error);
        return null;
    }
}

/**
 * Update User Profile
 */
async function updateUserProfile(updates) {
    try {
        const user = firebaseServices.auth.currentUser;
        if (!user) throw new Error('No user logged in');

        // Update Firebase Auth profile
        if (updates.displayName) {
            await user.updateProfile({
                displayName: updates.displayName
            });
        }

        // Update Firestore record
        await firebaseServices.db.collection('admins').doc(user.uid).update({
            ...updates,
            updatedAt: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
}
