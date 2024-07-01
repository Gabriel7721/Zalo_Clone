import { BaseApi } from '@/api/base'

export class ChatAPI extends BaseApi {
  chat(senderId: string, recipientId: string): Promise<any> {
    return this.get(`/messages/${senderId}/${recipientId}`)
  }

  chatGroup(senderId: string,groupId: string): Promise<any> {
    return this.get(`/group-messages/${senderId}/${groupId}`)
  }

  sendFileMessage(data: any): Promise<any> {
    return this.post('/send-file-message', data)
  }

  sendFileMessageGroup(data: any): Promise<any> {
    return this.post('/send-file-message-group', data)
  }

  forwardMessage(messageId: string, data: any): Promise<any> {
    return this.post(`/forward-messages/${messageId}`, data)
  }

  forwardMessageGroup(messageId: string, data: any): Promise<any> {
    return this.post(`forward-messages-group/${messageId}`, data)
  }

  getImagesAndVideos(senderId: string, recipientId: string): Promise<any> {
    return this.get(`/image-video-messages/${senderId}/${recipientId}`)
  }

  getImagesAndVideosGroup(senderId: string, chatId: string): Promise<any> {
    return this.get(`/image-video-messages-group/${senderId}/${chatId}`)
  }

  getFiles(senderId: string, recipientId: string): Promise<any> {
    return this.get(`/file-messages/${senderId}/${recipientId}`)
  }

  getFilesGroup(senderId: string, chatId: string): Promise<any> {
    return this.get(`/file-messages-group/${senderId}/${chatId}`)
  }

  deleteMessage(messageId: string): Promise<any> {
    return this.put(`/delete-messages/${messageId}`)
  }

  replyMessage(messageId: string, data: any): Promise<any> {
    return this.post(`/reply-message/${messageId}`, data)
  }

  replyMessageGroup(messageId: string, data: any): Promise<any> {
    return this.post(`/reply-message-group/${messageId}`, data)
  }
}
