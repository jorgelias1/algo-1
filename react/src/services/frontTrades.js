import axios from 'axios'
export const getTrades=(ticker)=>{
    return axios.get(`https://q19gn6v76j.execute-api.us-west-1.amazonaws.com/dev/api/trades/${ticker}`)
}