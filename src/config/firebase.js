import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyBqaSNQSShuWTyCC109sdEL-u8Rgd0Th5I",
  authDomain: "nexora-9e7a5.firebaseapp.com",
  projectId: "nexora-9e7a5",
  storageBucket: "nexora-9e7a5.firebasestorage.app",
  messagingSenderId: "997295970879",
  appId: "1:997295970879:web:1474553e226a0a9165768a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async(username,email,password) =>{
    try {
        const res = await createUserWithEmailAndPassword(auth,email,password);
        const user = res.user;
        await setDoc(doc(db,"users",user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey,There I am using nexora!",
            lastSeen:Date.now()
        })
        await setDoc(doc(db,"chats",user.uid),{
            chatData:[]
        })
    } catch (error) {
        console.error(error)
        toast.error(error.code)
    }
}

const login = async (email,password) =>{
    try {
        await signInWithEmailAndPassword(auth,email,password)
    } catch (error) {
        console.error(error);
        toast.error(error.code);
    }
}

export {signup,login}