import axios from 'axios'

const api = axios.create({
    baseURL: 'http://192.168.100.164:5234/api'
})

export default api