// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth,onAuthStateChanged} from "firebase/auth";
import {getStorage , getDownloadURL , getBytes,ref,uploadBytes,} from "firebase/storage";
import {getFirestore ,collection , addDoc, getDoc,doc , getDocs,query,where,setDoc,deleteDoc} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from 'firebase/messaging';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCj30otjPRdKVziJn3jDoPNieDAUliqWFE",
  authDomain: "app-spendwise-r.firebaseapp.com",
  projectId: "app-spendwise-r",
  storageBucket: "app-spendwise-r.appspot.com",
  messagingSenderId: "522605424301",
  appId: "1:522605424301:web:6c36af0ac547b824326024",
  measurementId: "G-62CMGRKBTE"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export const messaging = getMessaging(app);

export async function userExists(uid){
  const docRef= doc(db , 'users' , uid);
  const res= await getDoc(docRef);
  console.log (res);
  return res.exists();
}

export async function existsUsername (username){
  const users=[];
  const docsRef = collection(db,'users');
  const q= query(docsRef, where ('username','==',username));

  const querySnapshot = await getDocs(q);

  querySnapshot.forEach(doc => {
    users.push(doc.data());
  });

  return users.length > 0 ? users[0].uid : null;
}

export async function registerNewUser(user){
  try{
    const collectionRef = collection (db , 'users');
    const docRef= doc(collectionRef,user.uid);
    await setDoc(docRef,user);

  }catch(error){

  }
}

export async function updateUser(user){
  try{
    const collectionRef = collection (db,'users');
    const docRef = doc(collectionRef, user.uid);
    await setDoc(docRef,user);
  }catch(error){}
}

export async function getUserInfo(uid){
  try{
    const docRef = doc(db,"users",uid);
    const document = await getDoc(docRef);
    return document.data();
  }catch(error){

  }
}
  export async function getUserValid(){
    try{
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
         console.log(user)
          // ...
        } else {
          // User is signed out
          // ...
          console.log(user)
        }
      });
     
    }catch(error){
  
    }
}
