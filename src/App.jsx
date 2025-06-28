import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login/Login'
import Chat from './pages/Chat/Chat'
import ProfileUpdate from './pages/ProfileUpdate/ProfileUpdate'
import { ToastContainer, toast } from 'react-toastify';

const App = () => {
  return (
    <>
    <ToastContainer/>
      <Routes>
        <Route path='/' element={<Login/>}/>
        
        <Route path='/chat' element={<Chat/>}/>
        
        <Route path='/profile' element={<ProfileUpdate/>}/>

      </Routes>
    </>
  )
}

export default App
