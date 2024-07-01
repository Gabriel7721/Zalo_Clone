import { BaseApi } from '@/api/base'

export class UserAPI extends BaseApi {
  getUsers(params: any): Promise<any> {
    return this.get('/users', { params })
  }

  user(id: string): Promise<any> {
    return this.get(`/users/${id}`)
  }

  getUserByPhone(phone: string): Promise<any> {
    return this.get(`/users/${phone}`)
  }

  addFriend(id: string, friendId: string): Promise<any> {
    return this.post(`/users/${id}/add-friend/${friendId}`)
  }

  getFriendByName(id: string, name: string): Promise<any> {
    return this.get(`/users/${id}/friends/${name}`)
  }

  getProfile(params: any): Promise<any> {
    return this.get('/users/profile', { params })
  }

  updateProfile(phone: string, params: any): Promise<any> {
    return this.put(`/users/update/${phone}`, params)
  }

  uploadAvatar(id: string, params: any): Promise<any> {
    return this.post(`/users/upload-avatar/${id}`, params)
  }

  uploadImageCover(id: string, params: any): Promise<any> {
    return this.post(`/users/upload-image-cover/${id}`, params)
  }

  getFriends(): Promise<any> {
    return this.get('/users/friends')
  }

  changePassword(id: string, params: any): Promise<any> {
    return this.post(`/users/change-password/${id}`, params)
  }

  getUserByPhoneSkipMe(phone: string, id: string): Promise<any> {
    return this.get(`/users/${phone}/skip-me/${id}`)
  }

  saveTokenNotification(token: any): Promise<any> {
    return this.post('/notifications/save-token', { token })
  }
}
