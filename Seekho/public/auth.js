import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import {getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import{getFirestore, setDoc, doc, getDoc, updateDoc, increment, collectionGroup, getDocs} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js"

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
const db = getFirestore(app); // Initialize Firestore

// Function to fetch and update user coins
async function fetchUserCoins() {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
            console.log("No user logged in");
            return;
        }

        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const coinCount = document.getElementById("coin-count");
            if (coinCount) {
                coinCount.innerText = data.coins || 0;
            }
        } else {
            console.log("No user document found");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

// Update coin count function
async function updateCoinCount(amount) {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
        const userRef = doc(db, "users", user.uid);
        try {
            await updateDoc(userRef, {
                coins: increment(amount)
            });
            // Fetch updated coins after increment
            await fetchUserCoins();
        } catch (error) {
            console.error("Error updating coins:", error);
        }
    }
}

// Add auth state listener to update coins when auth state changes
const auth = getAuth();
auth.onAuthStateChanged((user) => {
    if (user) {
        fetchUserCoins();
    }
});

// Wrap all DOM-dependent code in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    const signUp = document.getElementById('submitSignUp');
    const popin = document.getElementById('popup-signin');
    const signIn = document.getElementById('submitSignIn');

    // Initial fetch of user coins
    fetchUserCoins();

    // Sign Up functionality
    if (signUp) {
        signUp.addEventListener('click', (event) => {
            event.preventDefault();
        
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const Name = document.getElementById('name').value;
        
            console.log("Email:", email, "Name:", Name, "Password:", password);
        
            if (!email || email.trim() === "") {
                showMessage("Email cannot be empty!", "signUpMessage");
                return;
            }
            if (!password || password.trim() === "") {
                showMessage("Password cannot be empty!", "signUpMessage");
                return;
            }
        
            const auth = getAuth();
            const db = getFirestore();
        
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
        
                    const userData = {
                        email,
                        Name,
                        coins: 100 // Initialize coins to 100 for new users
                    };
        
                    const docRef = doc(db, "users", user.uid);
                    return setDoc(docRef, userData);
                })
                .then(() => {
                    showMessage("Account Created Successfully!", "signUpMessage");
                    window.location.href = 'index.html';
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
    if (popin) {
        popin.addEventListener("click", function(){
            const auth = getAuth();
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
            .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                const user = result.user;
                
                // Create user document if it doesn't exist
                const db = getFirestore();
                const userRef = doc(db, "users", user.uid);
                getDoc(userRef).then((docSnap) => {
                    if (!docSnap.exists()) {
                        return setDoc(userRef, {
                            email: user.email,
                            Name: user.displayName,
                            coins: 100
                        });
                    }
                }).then(() => {
                    fetchUserCoins(); // Update coin display
                    window.location.href = 'homepage.html';
                });
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.customData.email;
                const credential = GoogleAuthProvider.credentialFromError(error);
                console.log(errorMessage);
            });
        });
    }

    // Email Sign In functionality
    if (signIn) {
        signIn.addEventListener('click', (event)=>{
            event.preventDefault();
            const email=document.getElementById('mail').value;
            const password=document.getElementById('pass').value;
            const auth=getAuth();

            signInWithEmailAndPassword(auth, email,password)
            .then((userCredential)=>{
                showMessage('login is successful', 'signInMessage');
                const user=userCredential.user;
                localStorage.setItem('loggedInUserId', user.uid);
                
                // Update coin count in UI
                fetchUserCoins();
                
                window.location.href='homepage.html';
            })
            .catch((error)=>{
                const errorCode=error.code;
                if(errorCode==='auth/invalid-credential'){
                    showMessage('Incorrect Email or Password', 'signInMessage');
                }
                else{
                    showMessage('Account does not Exist', 'signInMessage');
                }
            });
        });
    }
});

function hideVideo() {
    document.getElementById("video-player").style.display = "none";
    document.getElementById("play-ad-btn").style.display = "block";
    updateCoinCount(10); // Add 10 coins when video is watched
}
