import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
//adding
import {BrowserRouter} from "react-router-dom";
import reportWebVitals from './reportWebVitals'; // keep this after fixing



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </BrowserRouter>
);

// Performance report
reportWebVitals();