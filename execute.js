const axios = require('axios')
const dotenv = require('dotenv').config()
const {getTrades, postTrades, getSPY, postSPY, closeTrade, cleanSPY} = require('./react/src/services/trades.cjs')

// update daily
const main = async()=>{
    const re = await getQuote();
    let today = new Date();
    today = today.toISOString().slice(0,10);
    const day = [{
        Date: today,
        Close: re.data[0].price
    }];
    const res = await getSPY();
    const data = res.data.rows;

    // calculate necessary values
    day[0].SMA = calcSMA(day, data, 200);
    day[0].fiftyMA = calcSMA(day, data.slice(150, 199), 50)
    day[0].twentyMA = calcSMA(day, data.slice(180, 199), 20)
    const change = calcChange(day, data[data.length-1]);
    day[0].RSI = calcRSI(day[0].avgGain, day[0].avgLoss, day);
    day[0].RSI_MA = calcRSI_MA([data.length], data, day)
    day[0].avgGain = change.avgGain;
    day[0].avgLoss = change.avgLoss;

    // add day to db, remove unneccessary day 
    await postSPY(day);
    await cleanSPY();
    // if criteria is met to open trade, make the trade
    const validTrade = await checkCriteria(day, data);
    if (validTrade){
        makeTrade(validTrade);
    }
}

const checkOpen=async()=>{
    const re = await getTrades('SPY');
    const trades = re.data.rows
    const lastTrade = trades.slice(trades.length-2, trades.length-1)
    if (!lastTrade[0].close_date){
        return lastTrade
    } else{
        return false;
    }
}
const checkCriteria=async(day, data)=>{
    // check for open position
    const openTrade = await checkOpen();
    if (openTrade){
        if (openTrade.type==='long'){
            const close = await checkLongClose(day, data, openTrade);
            return {close, long:'long'};
        } else{
            const close = await checkShortClose(day)
            return {close, short: 'short'};
        }
    } else{
        // check buy/short criteria
        const long = await checkLongOpen(day)
        const short = await checkShortOpen(day)
        if (long){
            return {long};
        }
        return {short};
    }
}
const makeTrade=(trade)=>{
    if (trade.close){
        closeTrade(trade);
    } else{
        postTrades(trade);
    }
}
const getQuote=()=>{
    return axios.get(`https://financialmodelingprep.com/api/v3/profile/SPY?apikey=${process.env.FINAPIKEY}`)
}
const calcSMA=(day, data, length)=>{
    let total = data.reduce((sum, i)=>{
        return sum+=Number(i.close);
    },0);
    total+=day[0].Close;
    return total/length;
}
calcChange = (today, data) =>{
    let change = today[0].Close - data.close;
    if (change > 0){
        today.gain = change;
        today.loss = 0;
    } else{
        today.gain = 0;
        today.loss = Math.abs(change);
    }
    const avgGain = (today[0].gain + 13*(data.avg_gain))/14;
    const avgLoss = (today[0].loss + 13*(data.avg_loss))/14;
    return {avgGain, avgLoss};
}
const calcRSI = (avgGain, avgLoss, day) =>{
    const RS = avgGain/avgLoss;
    const RSI = 100 - (100/(1+RS))
    day[0].RSI = RSI;
}
const calcRSI_MA = (currentDay, arr, day) =>{
    let sum = 0;
    for (let i = currentDay-13; i<currentDay; i++){
        sum += arr[i].RSI;
    }
    sum+=day[0].RSI
    const RSI_MA = sum/14
    day[0].RSI_MA = RSI_MA;
}
const checkLongOpen = (arr) =>{
    if (
        (arr[0].Close > arr[0].SMA
        && arr[0].RSI > arr[0].RSI_MA
        || arr[0].RSI > 60 
        )){  
            arr[0].type = 'long';
            arr[0].buyPrice = arr[0].Close;
            arr[0].openDate = arr[0].Date;
            arr[0].ticker = 'SPY';
            return arr; 
    }
} 
const checkShortOpen=(arr)=>{
    if(arr[currentDay].Close < arr[currentDay].SMA){
        arr[0].type = 'short';
        arr[0].sellPrice = arr[0].Close;
        arr[0].openDate = arr[0].Date;
        arr[0].ticker = 'SPY';
        return arr;
    }
}
const checkLongClose = (today, arr, openTrade)=>{
    const todaysDate = new Date(today[0].Date);
    const purchaseDate = new Date(arr[arr.length-1].date)
    if ((today[0].twentyMA - arr[arr.length-1].twentyMA > 0 && today[0].twentyMA/arr[arr.length-1].twentyMA < 1.0001
            )
            || arr[arr.length-1].Close/openTrade[0].buy_price >1.07 || openTrade[0].buy_price/arr[arr.length-1].Close < 0.955
            || (todaysDate - purchaseDate)/(1000*3600*24) > 100
            ){
        today.sellPrice = today[0].Close;
        today.closeDate = today[0].Close;
        return today;
    }
}
const checkShortClose = (today)=>{
    if (today[0].Close > today[0].fiftyMA){
        today[0].buyPrice = today[0].Close;
        today[0].closeDate = today[0].Date;
        return today
    }
}
       
main();