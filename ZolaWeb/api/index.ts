import { AxiosInstance } from 'axios'
import { UserAPI } from '@/api/users'
import { ChatAPI } from '@/api/chats'
import { RoomAPI } from '@/api/rooms'
import { AuthAPI } from '@/api/auths'
import { FriendRequestAPI } from '@/api/friend-requests'

export class Api<T extends unknown> {
  public readonly users: UserAPI
  public readonly chats: ChatAPI
  public readonly rooms: RoomAPI
  public readonly auths: AuthAPI
  public readonly friendRequests: FriendRequestAPI

  constructor(axios: AxiosInstance) {
    this.users = new UserAPI(axios)
    this.chats = new ChatAPI(axios)
    this.rooms = new RoomAPI(axios)
    this.auths = new AuthAPI(axios)
    this.friendRequests = new FriendRequestAPI(axios)
  }
}
