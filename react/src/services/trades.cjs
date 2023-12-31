const axios = require('axios')
require('dotenv').config()
const baseURL = process.env.BASEURL

const getTrades = (ticker)=>{
    return axios.get(`${baseURL}/api/trades/${ticker}`);
}
const postTrades = (trades)=>{
    return axios.post(`${baseURL}/api/trades`, trades)
}
const postSPY = (arr) =>{
    return axios.post(`${baseURL}/api/spy`, arr)
}
const getSPY = () =>{
    return axios.get(`${baseURL}/api/spy`)
}
const closeTrade = (trade) =>{
    return axios.post(`${baseURL}/api/close`, trade)
}
const cleanSPY=()=>{
    return axios.get(`${baseURL}/api/clean`)
}
module.exports = {
    getTrades,
    postTrades,
    postSPY,
    getSPY,
    closeTrade,
    cleanSPY,
}