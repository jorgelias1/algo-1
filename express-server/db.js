const pg = require('pg')
const fs = require('fs')
const dotenv = require('dotenv').config()

const pool = new pg.Pool({
    user: 'jorgelias',
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync('./global-bundle.pem'),
    }
});

const getTrades = async(ticker)=>{
    const query = 'SELECT * FROM algo_trades WHERE ticker = $1 ORDER BY open_date'
    const re = await pool.query(query, [ticker.ticker]);
    return re
}
const postTrades = async(trades)=>{
    const query = 
    `INSERT INTO algo_trades 
    (type, buy_price, sell_price, open_date, close_date, ticker) VALUES
    ($1, $2, $3, $4, $5, $6)`
    for (const trade of trades){
        try{
            await pool.query(query, [
                trade.type,
                (trade.buyPrice || null),
                (trade.sellPrice || null),
                trade.openDate, 
                (trade.closeDate || null),
                trade.ticker
            ])
        } catch (err){
            console.log(err)
        }
    }
}
const postSPY = async(data) =>{
    const query = 
    `INSERT INTO spy 
    (date, close, sma, avg_gain, avg_loss, rsi, rsi_ma, fifty_ma, twenty_ma) VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
    for (const day of data){
        await pool.query(query, [
            day.Date,
            day.Close,
            day.SMA, 
            day.avgGain,
            day.avgLoss,
            day.RSI,
            day.RSI_MA,
            day.fiftyMA,
            day.twentyMA
        ])
    }
}
const getSPY = async()=>{
    const query = `SELECT * FROM spy ORDER BY DATE`
    const re = await pool.query(query);
    return re;
}
const closeTrade = async(trade)=>{
    let column;
    let price;
    if (trade.long){
        column='sell_price';
        price=trade.close.sellPrice;
    } else{
        column='buy_price';
        price=trade.close.buyPrice;
    }
    const query = `
    UPDATE algo_trades 
    SET close_date = $1 AND $2 = $3 
    WHERE date = (
    SELECT MAX(date)
    FROM spy)`
    await pool.query(query, [trade.close.closeDate, column, price]);
}
const cleanSPY=async()=>{
    const query=`DELETE FROM spy
    WHERE date = (
        SELECT MIN(date)
        FROM spy)`
    await pool.query(query)
}
module.exports = {
    getTrades,
    postTrades,
    postSPY,
    getSPY,
    closeTrade,
    cleanSPY,
}
