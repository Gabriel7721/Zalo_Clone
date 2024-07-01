import { defineStore } from 'pinia'

export const useUsers = defineStore({
  id: 'users',
  state: () => ({
    users: [],
  }),
  getters: {
    getUsers: (state) => state.users,
  },
  actions: {
    setUsers(users) {
      this.users = users
    },
    addUsers(users) {
      this.users.push(users)
    },
  },
})
