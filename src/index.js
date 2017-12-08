import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css'
import App from './App';
import { BrowserRouter } from 'react-router-dom'
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database'

// Initialize Firebase
// var config = {
//     apiKey: "AIzaSyAInUGOhRpMqohXYMEbFt2km-_AWZ_kBoI",
//     authDomain: "group-proj-dev.firebaseapp.com",
//     databaseURL: "https://group-proj-dev.firebaseio.com",
//     projectId: "group-proj-dev",
//     storageBucket: "group-proj-dev.appspot.com",
//     messagingSenderId: "538194400345"
// };

// var config = {
//     apiKey: "AIzaSyC8SiJmYeouFXdFNfzTqEVq-Oy6ax8fUS0",
//     authDomain: "test-heartbeat-c4718.firebaseapp.com",
//     databaseURL: "https://test-heartbeat-c4718.firebaseio.com",
//     projectId: "test-heartbeat-c4718",
//     storageBucket: "test-heartbeat-c4718.appspot.com",
//     messagingSenderId: "895606864826"
//   };

var config = {
  apiKey: "AIzaSyCLJbg2GIoLKXAiLHDCG15FaReuqEmxH5c",
  authDomain: "heartbeat-1a0c7.firebaseapp.com",
  databaseURL: "https://heartbeat-1a0c7.firebaseio.com",
  projectId: "heartbeat-1a0c7",
  storageBucket: "",
  messagingSenderId: "511606483559"
};

firebase.initializeApp(config);

ReactDOM.render(<BrowserRouter basename={process.env.PUBLIC_URL + '/'}><App /></BrowserRouter>, document.getElementById('root'));
