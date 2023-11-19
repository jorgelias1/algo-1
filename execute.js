const axios = require('axios')
const dotenv = require('dotenv').config()
const {getTrades, postTrades, getSPY, postSPY, closeTrade, cleanSPY} = require('./react/src/services/trades.cjs')

// update daily
exports.main = async()=>{
    const re = await getQuote();
    let today = new Date();
    today = new Date(today.getTime() - 8*60 * 60 * 1000)
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
    day[0].avgGain = change.avgGain;
    day[0].avgLoss = change.avgLoss;

    day[0].RSI = calcRSI(day[0].avgGain, day[0].avgLoss);
    day[0].RSI_MA = calcRSI_MA(data.length, data, day)
    // add day to db, remove unneccessary day 
    await postSPY(day);
    await cleanSPY();
    console.log('cleaned up + posted. Checking criteria now...')
    // if criteria is met to open trade, make the trade
    const validTrade = await checkCriteria(day, data);
    console.log('valid trade? ->', validTrade)
    if (validTrade.info || validTrade.close){
        console.log('trade is valid. making trade...')
        await makeTrade(validTrade);
        console.log('finished. ')
    }
}

const checkOpen=async()=>{
    const re = await getTrades('SPY');
    const trades = re.data.rows
    const lastTrade = trades.slice(trades.length-1)
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
            return {type:'long', info: long};
        }
        return {type:'short', info: short};
    }
}
const makeTrade=async(trade)=>{
    if (trade.close){
        await closeTrade(trade);
    } else{
        console.log('posting...')
        await postTrades(trade.info.slice(0));
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
    const avgGain = (today.gain + 13*(data.avg_gain))/14;
    const avgLoss = (today.loss + 13*(data.avg_loss))/14;
    return {avgGain, avgLoss};
}
const calcRSI = (avgGain, avgLoss) =>{
    const RS = avgGain/avgLoss;
    const RSI = 100 - (100/(1+RS))
    return RSI;
}
const calcRSI_MA = (currentDay, arr, day) =>{
    let sum = 0;
    for (let i = currentDay-13; i<currentDay; i++){
        sum += Number(arr[i].rsi);
    }
    sum+=day[0].RSI
    const RSI_MA = sum/14
    return RSI_MA;
}
const checkLongOpen = (day) =>{
    // if open criteria is met return not null
    if (
        (day[0].Close > day[0].SMA
        && day[0].RSI > day[0].RSI_MA
        || day[0].RSI > 60 
        ) 
        ){  
            day[0].type = 'long';
            day[0].buyPrice = day[0].Close;
            day[0].openDate = day[0].Date;
            day[0].ticker = 'SPY';
            return day; 
    }
} 
const checkShortOpen=(day)=>{
    // if open criteria is met, while close criteria is not met, return not null
    if(day[0].Close < day[0].SMA && !(day[0].Close > day[0].fiftyMA)){
        day[0].type = 'short';
        day[0].sellPrice = day[0].Close;
        day[0].openDate = day[0].Date;
        day[0].ticker = 'SPY';
        return day;
    }
} 
exports.checkLongClose = (today, arr, openTrade)=>{
    const todaysDate = new Date(today[0].Date);
    const purchaseDate = new Date(arr[arr.length-1].date)
    if ((today[0].twentyMA - arr[arr.length-1].twentyMA > 0 && today[0].twentyMA/arr[arr.length-1].twentyMA < 1.0001)
            || arr[arr.length-1].Close/openTrade[0].buy_price >1.07 || openTrade[0].buy_price/arr[arr.length-1].Close < 0.955
            || (todaysDate - purchaseDate)/(1000*3600*24) > 100)
            {
        today.sellPrice = today[0].Close;
        today.closeDate = today[0].Date;
        return today;
    }
}
exports.checkShortClose = (today)=>{
    if (today[0].Close > today[0].fiftyMA){
        today.buyPrice = today[0].Close;
        today.closeDate = today[0].Date;
        return today
    }
}
       
// main();