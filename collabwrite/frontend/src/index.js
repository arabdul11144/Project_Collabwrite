import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.render(
  <BrowserRouter> {/* ✅ Already wrapping here */}
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
