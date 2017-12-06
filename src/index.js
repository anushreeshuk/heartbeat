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
  apiKey: "AIzaSyA2gy4awpOteTKJLWMeavNX27AJXMdHODo",
  authDomain: "heartbeart-a788e.firebaseapp.com",
  databaseURL: "https://heartbeart-a788e.firebaseio.com",
  projectId: "heartbeart-a788e",
  storageBucket: "heartbeart-a788e.appspot.com",
  messagingSenderId: "476695936650"
};
firebase.initializeApp(config);

ReactDOM.render(<BrowserRouter basename={process.env.PUBLIC_URL+'/'}><App /></BrowserRouter>, document.getElementById('root'));
registerServiceWorker();
