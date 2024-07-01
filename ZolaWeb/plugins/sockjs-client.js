import SockJS from 'sockjs-client/dist/sockjs'
import Stomp from 'stompjs'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const sock = new SockJS('http://localhost:8080/ws')
  const stompClient = Stomp.over(sock)
  nuxtApp.provide('stompClient', stompClient)
})
