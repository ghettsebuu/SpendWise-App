import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import '../assets/LoginPage.css';
import { auth, getUserInfo, registerNewUser, userExists } from '../firebase/firebase';

import { FaGoogle } from 'react-icons/fa';
import { useEffect, useState } from 'react';

import { useNavigate } from "react-router-dom";




export default function AuthProvider({children, 
    onUserLoggedIn, 
    onUserNotLoggedIn,
    onUserNotRegistered
}){
    const Navigate = useNavigate();

    useEffect(()=>{
       
         onAuthStateChanged(auth, async (user)=>{
    
            if(user){
                // debugger;
                const isRegistered = await userExists(user.uid);
                if(isRegistered){
                    //Todo : redirigir a Dashboard
                    const userInfo = await getUserInfo(user.uid);
                    if(userInfo.processCompleted){
                        onUserLoggedIn(userInfo);
                    }else{
                        onUserNotRegistered(userInfo);
                    }
                  
                }else{
                    //Todo : redirigir a username
                    await registerNewUser({
                        uid: user.uid,
                        displayName: user.displayName,
                        profilePicture:"",
                        username:"",
                        processCompleted:false,
                    });
                    onUserNotRegistered(user);
                  
                }
                
            }else{
                onUserNotLoggedIn();
            }
    
         });
      },[Navigate, onUserLoggedIn, onUserNotLoggedIn,onUserNotRegistered]);
    return <div>{children}</div>
}