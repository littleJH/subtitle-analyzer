import axios from "axios"

export const request = axios.create({
  baseURL: 'http://api_subtitle.mgaronya.com'
})