/**
 * Firebase Configuration File
 * Replace with your Firebase project credentials from Firebase Console
 */

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyDemoKeyPlaceholder123456789", // Replace with your API Key
    authDomain: "your-project.firebaseapp.com", // Replace with your Auth Domain
    projectId: "your-project-id", // Replace with your Project ID
    storageBucket: "your-project.appspot.com", // Replace with your Storage Bucket
    messagingSenderId: "123456789", // Replace with your Messaging Sender ID
    appId: "1:123456789:web:abcdef123456" // Replace with your App ID
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("✓ Firebase initialized successfully");
} catch (error) {
    console.error("✗ Firebase initialization error:", error);
}

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Enable offline persistence for Firestore
db.enablePersistence()
    .then(() => console.log("✓ Offline persistence enabled"))
    .catch(error => console.warn("Offline persistence warning:", error));

// Export for use in other files
window.firebaseServices = {
    auth,
    db,
    storage,
    firebase
};
