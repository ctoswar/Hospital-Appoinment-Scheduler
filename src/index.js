import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import reportWebVitals from './reportWebVitals';
import Homepage from './Homepage';

const handleLogin = (user, token) => {
  console.log('User logged in:', user);
  // Add any login handling logic here
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Homepage onLogin={handleLogin} />
  </React.StrictMode>
);

reportWebVitals();