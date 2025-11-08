import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Landingpage from './components/landingpage/landingpage';
import Signuppage from './components/signuppage/signuppage';
import Loginpage from './components/loginpage/loginpage';
import Homepage from './components/homepage/homepage';
import TextEditor from './components/editor/TextEditor';
import Qa from './components/editor/QaForum';
import Chatbot from './components/editor/Chatbot';
import Settings from "./components/editor/Settings";
import ForgotPasswordPage from './components/forgotpasswordpage/forgotpasswordpage';





import { v4 as uuidV4 } from 'uuid';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landingpage />} />
      <Route path="/landingpage" element={<Landingpage />} />
      <Route path="/signuppage" element={<Signuppage />} />
      <Route path="/loginpage" element={<Loginpage />} />
      <Route path="/homepage" element={<Homepage />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/forgotpasswordpage" element={<ForgotPasswordPage />} />


      {/* Redirect to a random document */}
      <Route
        path="/editor"
        element={<Navigate to={`/documents/${uuidV4()}`} />}
      />

      <Route path="/qa" element={<Qa />} />
      <Route path="/bot" element={<Chatbot />} />

      {/* Real-time collaborative editor */}
      <Route path="/documents/:id" element={<TextEditor />} />
    </Routes>
  );
}

export default App;
