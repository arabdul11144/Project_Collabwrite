import React from 'react';
import { Route } from 'react-router-dom';
import { Routes } from 'react-router-dom';
import './App.css';
import Landingpage from './components/landingpage/landingpage';
import Signuppage from './components/signuppage/signuppage';
import Loginpage from './components/loginpage/loginpage';
///import Forgotpasswordpage from './components/forgotpassword/forgotpasswordpage';
import Homepage from './components/homepage/homepage';




function App() {

  return (

    <Routes>

      <Route path="/" element={<Landingpage />} />
      <Route path="/landingpage" element={<Landingpage />} />
      <Route path="/signuppage" element={<Signuppage />} />
      <Route path="/loginpage" element={<Loginpage />} />
      <Route path="/homepage" element={<Homepage />} />


    </Routes>

  );
}

export default App;