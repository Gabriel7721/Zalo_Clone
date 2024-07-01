import { BaseApi } from '@/api/base'

export class FriendRequestAPI extends BaseApi {
  getFriendRequests(): Promise<any> {
    return this.get('/friend-requests')
  }

  sendFriendRequest(fromUserId: any, toUserId: any): Promise<any> {
    return this.post(`/friend-requests/send-friend-request/${fromUserId}/${toUserId}`)
  }

  acceptFriendRequest(fromUserId: any, toUserId: any): Promise<any> {
    return this.post(`/friend-requests/accept-friend-request/${fromUserId}/${toUserId}`)
  }

  declineFriendRequest(fromUserId: any, toUserId: any): Promise<any> {
    return this.post(`/friend-requests/decline-friend-request/${fromUserId}/${toUserId}`)
  }

  removeFriendRequest(id: string): Promise<any> {
    return this.delete(`/friend-requests/${id}`)
  }

  getFriendRequestByFromUser(fromUserId: any): Promise<any> {
    return this.get(`/friend-requests/${fromUserId}`)
  }

  getFriendRequestByToUser(toUserId: any): Promise<any> {
    return this.get(`/friend-requests/invitation/${toUserId}`)
  }
}
