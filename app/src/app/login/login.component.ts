import { Component } from '@angular/core';
import {getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup} from 'firebase/auth'
import { userSet } from 'src/user';
import { initializeApp } from 'firebase/app';
import { Router } from '@angular/router';

const firebaseConfig = {
  apiKey: "AIzaSyDebNeIIgk9WuvicX5TqLBdxVFKCqxDuC8",
  authDomain: "test-69ad7.firebaseapp.com",
  databaseURL: "https://test-69ad7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "test-69ad7",
  storageBucket: "test-69ad7.appspot.com",
  messagingSenderId: "926120187461",
  appId: "1:926120187461:web:bf00fe7a1fbf7ff836352c",
  measurementId: "G-GHX8TWFHYD"
};


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  app: any;

  constructor(private router: Router)
  {
    this.app = initializeApp(firebaseConfig);
  }

  userLog(email: HTMLInputElement, password: HTMLInputElement)
  {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email.value, password.value)
      .then((userCredential) => {
        // Signed in 
        userSet(userCredential.user);
        this.router.navigateByUrl('editor');
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
      });
  }

  userGoogleLog()
  {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential!.accessToken;

      userSet(result.user);
      this.router.navigateByUrl('editor');
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      alert(errorMessage)
      // ...
    });
  }

  userRegister(email: HTMLInputElement, password: HTMLInputElement, password2: HTMLInputElement)
  {

    console.log(password.value, password2.value)
   
    if(password.value != password2.value)
    {
      alert('Passwords do not match');
      return;
    }

    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      userSet(userCredential.user)
      alert('user created')
      this.router.navigateByUrl('editor');
      // ...
    })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage);
  });
  }

}


