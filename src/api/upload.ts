import { request } from '../utils/request'

export const upload = (data: any) => {
  return request.post('/upload', data)
}

export const uploadTabel = (data: string, config: any) => {
  return request.post('/download', data, config)
}
