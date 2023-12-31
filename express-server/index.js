const express = require('express')
const db = require('./db')
const cors = require('cors');
const app = express()
const awsServerlessExpress = require('aws-serverless-express')
app.use(cors());
app.use(express.json())

app.get('/api/trades/:ticker', async(request, response)=>{
    const ticker = request.params;
    const trades = await db.getTrades(ticker);
    response.send(trades);
})
app.post('/api/trades', async(request, response)=>{
    const trades = request.body
    try{
        await db.postTrades(trades)
        response.send('success')
    } catch(err){console.log(err)}
})
app.post('/api/spy', async(request, response)=>{
    const arr = request.body
    try{
        await db.postSPY(arr)
        response.send('success')
    } catch(err){console.log(err)}
})
app.get('/api/spy', async(request, response)=>{
    try{
        const re = await db.getSPY();
        response.send(re)
    } catch(err){console.log(err)}
})
app.post('/api/close', async(request, response)=>{
    const trade = request.body;
    try{
        await db.closeTrade(trade)
        response.send('success')
    } catch(err){console.log(err)}
})
app.get('/api/clean', async(request, response)=>{
    try{
        await db.cleanSPY();
        response.send('success')
    } catch(err){console.log(err)}
})
const server = awsServerlessExpress.createServer(app);
exports.handler = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
}