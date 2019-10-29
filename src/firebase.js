import firebase from 'firebase'
var config = {
    apiKey: "AIzaSyDreIAOM_ANdl48GgXcZe3t2zCD5noFTw0",
    authDomain: "mission-dm.firebaseapp.com",
    databaseURL: "https://mission-dm.firebaseio.com",
    projectId: "mission-dm",
    storageBucket: "mission-dm.appspot.com",
    messagingSenderId: "708238551673",
    appId: "1:708238551673:web:2ac2ec3ac59c896aa042a8",
    measurementId: "G-S1WDS0Q6S2"
};
var fire = firebase.initializeApp(config);
export default fire;
