// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app'
import { getMessaging } from 'firebase/messaging'
import { onMessage } from '@firebase/messaging'

// BKbMAOeCSK-A0v4gO7QkVLX6c3pcRQspYKpUmoDKcLzD3ZOEJDyoav3WHXEtqMVQGzyWYxXfWiX7oehTmG7pRos
export default defineNuxtPlugin((nuxtApp) => {
  // Your web app's Firebase configuration
  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: 'AIzaSyAKWqdBCe6N8GfHNeL1vLBqhw651C95li8',
      authDomain: 'bezola-8e842.firebaseapp.com',
      projectId: 'bezola-8e842',
      storageBucket: 'bezola-8e842.appspot.com',
      messagingSenderId: '265552807388',
      appId: '1:265552807388:web:d5459ac88790bbcc273b19',
    })

  const messaging = getMessaging(app)

  onMessage(messaging, (payload) => {
    console.log('Messaging:' + JSON.stringify(payload))
  })

  return {
    provide: {
      messaging,
    },
  }
})
