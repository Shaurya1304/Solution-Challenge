  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
  import {getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
 import{getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js"
  

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
  
  const signUp=document.getElementById('submitSignUp');
   
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
        const provider = new GoogleAuthProvider();
        const db = getFirestore();
    
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
    
                const userData = {
                    email,
                    Name
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

    const popin = document.getElementById('popup-signin');
    popin.addEventListener("click", function(){
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
        .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;

        const user = result.user;
        console.log(user);
        window.location.href = "../homepage.html";
        }).catch((error) => {
         // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log(errorMessage);
        });
    })

    const signIn=document.getElementById('submitSignIn');
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
    })
 })