import { BaseApi } from '@/api/base'

export class AuthAPI extends BaseApi {
  sendOTPForgetPassword(data: any): Promise<any> {
    return this.post('/forget-password', data)
  }

  verifyOTPForgetPassword(phone: string, data: any): Promise<any> {
    return this.put(`/otp-forget/${phone}`, data)
  }

  register(data: any): Promise<any> {
    return this.post('/auth/register', data)
  }

  sendOTPRegister(data: any): Promise<any> {
    return this.post('/phoneNumber', data)
  }

  verifyOTPRegister(data: any): Promise<any> {
    return this.post('/otp', data)
  }
}
