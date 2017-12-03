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
    apiKey: "AIzaSyBpUXCws_AIGorqlsfajBXcxNPe_cwdIfg",
    authDomain: "chat-vinvsv97.firebaseapp.com",
    databaseURL: "https://chat-vinvsv97.firebaseio.com",
    projectId: "chat-vinvsv97",
    storageBucket: "",
    messagingSenderId: "899449637835"
  };
  firebase.initializeApp(config);

ReactDOM.render(<BrowserRouter basename={process.env.PUBLIC_URL+'/'}><App /></BrowserRouter>, document.getElementById('root'));
registerServiceWorker();
