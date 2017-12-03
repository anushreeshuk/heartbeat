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
var config = {
    apiKey: "AIzaSyAInUGOhRpMqohXYMEbFt2km-_AWZ_kBoI",
    authDomain: "group-proj-dev.firebaseapp.com",
    databaseURL: "https://group-proj-dev.firebaseio.com",
    projectId: "group-proj-dev",
    storageBucket: "group-proj-dev.appspot.com",
    messagingSenderId: "538194400345"
};
firebase.initializeApp(config);

ReactDOM.render(<BrowserRouter basename={process.env.PUBLIC_URL + '/'}><App /></BrowserRouter>, document.getElementById('root'));
