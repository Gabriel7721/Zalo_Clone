import { defineStore } from 'pinia'

export const useRoom = defineStore({
  id: 'room',
  state: () => ({
    room: null,
    rooms: [],
  }),
  getters: {
    getRoom: (state) => state.room,
    getRooms: (state) => state.rooms,
  },
  actions: {
    setRoom(room) {
      this.room = room
    },
    setRooms(rooms) {
      this.rooms = rooms
    },
    addRoom(room) {
      this.rooms.push(room)
    },
  },
})
