import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter } from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/auth'; 
import 'firebase/database';

var config = {
  apiKey: "AIzaSyD1bOBAZIKzPNPDJtrQzQAWzxgT3mYS5O0",
  authDomain: "heartbeat-vinvsv97.firebaseapp.com",
  databaseURL: "https://heartbeat-vinvsv97.firebaseio.com",
  projectId: "heartbeat-vinvsv97",
  storageBucket: "",
  messagingSenderId: "776533069576"
};
firebase.initializeApp(config);

ReactDOM.render(<BrowserRouter basename={process.env.PUBLIC_URL+'/'}><App /></BrowserRouter>, document.getElementById('root'));
registerServiceWorker();
