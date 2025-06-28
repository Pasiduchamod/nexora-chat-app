import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets'
import { signup, login } from '../../config/firebase'

const Login = () => {

  const [currentState,setCurrentState] = useState("Login");
  const [userName,setuserName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("")

  const onSubmitHandler = (event) =>{
    event.preventDefault();
    if(currentState==="Sign up"){
      signup(userName,email,password)
    }
    else{
      login(email,password)
    }
  }

  return (
    <div className='login'>
        <img src={assets.logo_big} alt="" className="logo" />
        <form onSubmit={onSubmitHandler} className="login-form">
          <img src={assets.logo} alt="" className="login-logo" />
          <h2>{currentState}</h2>
          {currentState === "Sign up"?<input onChange={(e)=>setuserName(e.target.value)} value={userName} type="text" placeholder='Username' className="form-input" required/>:null}
          <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' className="form-input" />
          <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Password' className="form-input" />
          <button type='submit'>{currentState === "Sign up"?"Creaete account":"Login now"}</button>
          <div className="login-term">
            {currentState ==="Sign up"? <input type="checkbox" />:null}
            {currentState ==="Sign up"?<p>Agree to the terms of use & privacy policy.</p>:<p>Login to connect with the world fast and secure.</p>}
          </div>
          <div className="login-forgot">
            {
              currentState === "Sign up"
              ?<p className="login-toggle">Already have an account <span onClick={()=>setCurrentState("Login")}>Login here</span></p>
              :<p className="login-toggle">Create an account <span onClick={()=>setCurrentState("Sign up")}>Click here</span></p>

            }
          </div>
        </form>
    </div>
  )
}

export default Login
