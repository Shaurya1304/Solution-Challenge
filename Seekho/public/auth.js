import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, setDoc, doc, onSnapshot, collection, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

function showMessage(message, divId){
  var messageDiv=document.getElementById(divId);
  messageDiv.style.display="block";
  messageDiv.innerHTML=message;
  messageDiv.style.opacity=1;
  setTimeout(function(){
      messageDiv.style.opacity=0;
  },5000);
}

const firebaseConfig = {
  apiKey: "AIzaSyBs4RuqwGbJpiiWt3ntLmI1yDaHSXWvrd0",
  authDomain: "project-a0503.firebaseapp.com",
  projectId: "project-a0503",
  storageBucket: "project-a0503.firebasestorage.app",
  messagingSenderId: "104700283996",
  appId: "1:104700283996:web:4957e00f4e117ce3972a99",
  measurementId: "G-82WXTZ39FR"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();
const usersRef = collection(db, "users");

// Make fetchUserCoins globally available
window.fetchUserCoins = async function() {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.log("No user logged in!");
            return;
        }

        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.coins) {
                const coinCountElement = document.getElementById("coin-count");
                if (coinCountElement) {
                    coinCountElement.innerText = data.coins;
                }
            }
        } else {
            console.log("User document not found!");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
};

// Add logout functionality
window.logoutUser = function() {
    signOut(auth).then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
};

// Initialize all DOM elements and event listeners when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Check authentication state first
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            console.log("User is logged in:", user.email);
            fetchUserCoins();
            
            // Set up real-time listener for coin updates
            const userRef = doc(db, "users", user.uid);
            onSnapshot(userRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    if (data.coins) {
                        const coinCountElement = document.getElementById("coin-count");
                        if (coinCountElement) {
                            coinCountElement.innerText = data.coins;
                        }
                    }
                }
            });
            
            // If we're on the login page, redirect to homepage
            if (window.location.pathname.includes('login.html') || window.location.pathname.includes('index.html')) {
                window.location.href = 'homepage.html';
            }
        } else {
            // User is signed out
            console.log("No user logged in");
            
            // If we're not on the login page, redirect to login
            if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('index.html')) {
                window.location.href = 'login.html';
            }
        }
    });

    // Sign Up functionality
    const signUp = document.getElementById('submitSignUp');
    if (signUp) {
        signUp.addEventListener('click', (event) => {
            event.preventDefault();
        
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const Name = document.getElementById('name').value;
        
            if (!email || email.trim() === "") {
                showMessage("Email cannot be empty!", "signUpMessage");
                return;
            }
            if (!password || password.trim() === "") {
                showMessage("Password cannot be empty!", "signUpMessage");
                return;
            }
        
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
        
                    const userData = {
                        email,
                        Name,
                        coins: 100 // Initialize coins for new user
                    };
        
                    const docRef = doc(db, "users", user.uid);
                    return setDoc(docRef, userData);
                })
                .then(() => {
                    showMessage("Account Created Successfully!", "signUpMessage");
                    window.location.href = 'homepage.html';
                })
                .catch((error) => {
                    console.error("Error creating user:", error);
                    if (error.code === "auth/email-already-in-use") {
                        showMessage("Email address already exists!", "signUpMessage");
                    } else if (error.code === "auth/weak-password") {
                        showMessage("Password is too weak!", "signUpMessage");
                    } else {
                        showMessage(`Unable to create user: ${error.message}`, "signUpMessage");
                    }
                });    
        });
    }

    // Google Sign In functionality
    const popin = document.getElementById('popup-signin');
    if (popin) {
        popin.addEventListener("click", function(){
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                // Create or update user document
                const userData = {
                    email: user.email,
                    Name: user.displayName || user.email.split('@')[0],
                    coins: 100 // Initialize coins for new user
                };
                
                const docRef = doc(db, "users", user.uid);
                return setDoc(docRef, userData, { merge: true });
            })
            .then(() => {
                window.location.href = 'homepage.html';
            })
            .catch((error) => {
                console.error("Google Sign In Error:", error);
                showMessage("Error signing in with Google", "signInMessage");
            });
        });
    }

    // Sign In functionality
    const signIn = document.getElementById('submitSignIn');
    if (signIn) {
        signIn.addEventListener('click', (event)=>{
            event.preventDefault();
            const email = document.getElementById('mail').value;
            const password = document.getElementById('pass').value;

            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential)=>{
                showMessage('Login successful', 'signInMessage');
                const user = userCredential.user;
                localStorage.setItem('loggedInUserId', user.uid);
                window.location.href = 'homepage.html';
            })
            .catch((error)=>{
                const errorCode = error.code;
                if(errorCode === 'auth/invalid-credential'){
                    showMessage('Incorrect Email or Password', 'signInMessage');
                }
                else{
                    showMessage('Account does not Exist', 'signInMessage');
                }
            });
        });
    }
});

function signUpUser(email, password, username) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const userId = userCredential.user.uid;
            
            // Save user data with coins field in Firestore
            setDoc(doc(db, "users", userId), {
                username: username,
                email: email,
                coins: 100 // Initialize coins to 100
            }).then(() => {
                console.log("User registered with coins!");
            }).catch(error => {
                console.error("Error saving user data:", error);
            });
        })
        .catch((error) => {
            console.error("Signup Error:", error);
        });
}

function loginUser(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const userId = userCredential.user.uid;

            // Fetch user data from Firestore
            const userRef = doc(db, "users", userId);
            onSnapshot(userRef, (doc) => {
                if (doc.exists()) {
                    const userData = doc.data();
                    const coinCountElement = document.getElementById("coin-count");
                    if (coinCountElement) {
                        coinCountElement.innerText = userData.coins || 0;
                    }
                }
            });
        })
        .catch((error) => {
            console.error("Login Error:", error);
        });
}

function hideVideo() {
    document.getElementById("video-player").style.display = "none";
    document.getElementById("play-ad-btn").style.display = "block";

    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);

        // Increase coin count in Firestore
        onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                let currentCoins = doc.data().coins || 0;
                let newCoins = currentCoins + 10;

                setDoc(userRef, { coins: newCoins }, { merge: true }).then(() => {
                    const coinCountElement = document.getElementById("coin-count");
                    if (coinCountElement) {
                        coinCountElement.innerText = newCoins;
                    }
                    console.log("Coins updated successfully!");
                });
            }
        });
    }
}

