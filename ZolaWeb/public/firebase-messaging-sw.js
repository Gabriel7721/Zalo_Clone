importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: 'AIzaSyAKWqdBCe6N8GfHNeL1vLBqhw651C95li8',
  authDomain: 'bezola-8e842.firebaseapp.com',
  projectId: 'bezola-8e842',
  storageBucket: 'bezola-8e842.appspot.com',
  messagingSenderId: '265552807388',
  appId: '1:265552807388:web:d5459ac88790bbcc273b19',
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-messaging] Background Message Received]', payload)
})
