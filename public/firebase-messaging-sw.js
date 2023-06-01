importScripts("https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js");




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
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();


messaging.onBackgroundMessage(payload=>{
    console.log("Recibiste un mensaje mientras estabas ausente ");

    //previo a mostrar notofocaciones
    const notificationTitle=payload.notification.title;
    const notificationOptions={
        body: payload.notification.body,
        icon:"/vite.svg"
    }

    return self.registration.showNotification(
         notificationTitle,
         notificationOptions
    )
})