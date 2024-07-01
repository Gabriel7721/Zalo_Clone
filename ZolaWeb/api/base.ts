import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { ToastInterface, useToast } from 'vue-toastification'
import { BaseResponse, ErrorResponse } from '@/types/ResponseTypes'

export class BaseApi {
  public readonly axios: AxiosInstance
  public readonly toast: ToastInterface

  constructor(axios: AxiosInstance) {
    this.axios = axios
    this.toast = useToast()
  }

  public async get(endpoint: string, config?: AxiosRequestConfig): Promise<any> {
    try {
      return (await this.axios.get(endpoint, config)).data
    } catch (error) {
      await this.toastError(error)
    }
  }

  public async post(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    try {
      return (await this.axios.post(endpoint, data, config)).data
    } catch (error) {
      await this.toastError(error)
    }
  }

  public async postDownload(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    try {
      return await this.axios.post(endpoint, data, config)
    } catch (error) {
      await this.toastError(error)
    }
  }

  public async put(endpoint: string, data?: any): Promise<any> {
    try {
      return (await this.axios.put(endpoint, data)).data
    } catch (error) {
      await this.toastError(error)
    }
  }

  public async delete(endpoint: string, data?: any): Promise<any> {
    try {
      return (await this.axios.delete(endpoint, { data })).data
    } catch (error) {
      await this.toastError(error)
    }
  }

  private toastError(error: any) {
    return new Promise((resolve, reject) => {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<BaseResponse<ErrorResponse>>

        if (axiosError.response?.data.error) {
          this.toast.error(axiosError.response.data.error)

          if (axiosError.response.data.error.fields) {
            throw axiosError.response.data.error.fields
          }
        }

        if (axiosError.response?.status === 403) {
          // go back
        }
      }

      reject(error)
    })
  }
}
