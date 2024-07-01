import { BaseApi } from '@/api/base'

export class RoomAPI extends BaseApi {
  getRooms(params: any): Promise<any> {
    return this.get('/rooms', { params })
  }

  room(id: string): Promise<any> {
    return this.get(`/rooms/${id}`)
  }

  addRoom(data: any): Promise<any> {
    return this.post('/rooms', data)
  }

  addRoomMembers(roomId: string, data: string): Promise<any> {
    return this.put(`/rooms/${roomId}/add-members`, data)
  }

  getRoomByUser(userId: string): Promise<any> {
    return this.get(`/rooms/user/${userId}`)
  }

  createRoomGroup(data: any): Promise<any> {
    return this.post('/rooms/create-room-group', data)
  }

  removeUserFromRoom(roomId: string, userId: string): Promise<any> {
    return this.put(`/rooms/${roomId}/remove-member/${userId}`)
  }

  deleteRoom(roomId: string): Promise<any> {
    return this.delete(`/delete-room/${roomId}`)
  }

  leaveRoom(roomId: string): Promise<any> {
    return this.put(`/rooms/${roomId}/leave`)
  }

  getSubAdmins(roomId: string): Promise<any> {
    return this.get(`/rooms/${roomId}/sub-admins`)
  }

  removeSubAdmin(roomId: string, userId: string): Promise<any> {
    return this.put(`/remove-sub-admin/${roomId}/${userId}`)
  }

  addSubAdmin(roomId: string, userId: string): Promise<any> {
    return this.put(`/add-sub-admin/${roomId}/${userId}`)
  }

  changeAdmin(roomId: string, userId: string): Promise<any> {
    return this.put(`/rooms/${roomId}/change-admin/${userId}`)
  }

  callVideo(roomId:string) : Promise<any> {
    return this.get(`/rooms/${roomId}/call`)
  }
}
