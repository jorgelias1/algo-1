const fs = require('fs')

fs.readFile('spy.json', 'utf8', (err, data)=>{
    const arr = JSON.parse(data)
    const trades = [];
    let currentAcctValue = 1;
    // find a point where the slope between two days'
    // rsi_ma is negative AND above the 200 SMA.
    // see if the next day's slope is positiev. if so, it's a buy.
    for (let currentDay=28, n=arr.length, tradeCount=0; currentDay<n; currentDay++){

        // if negative slope + price close above the 200sma + slope positive next day (trade day)
        if (arr[currentDay].RSI_MA < arr[currentDay-1].RSI_MA 
            && arr[currentDay].Close > arr[currentDay].SMA
            && arr[currentDay+1].RSI_MA > arr[currentDay].RSI_MA){
                trades.push({buyPrice: arr[currentDay+1].Close, openDate: arr[currentDay+1].Date});
                for (let i = currentDay+1, j = arr.length; i<j;i++){
                    // any downward slope at all after buying, ie, not a maxima
                    // later on modify this by making sure its a max or by choosing 
                    // diff criteria, like flattening instead of waiting for downward slope
                    if (arr[i+1].RSI_MA < arr[i].RSI_MA && arr[i-1].RSI_MA < arr[i].RSI_MA){
                        trades[tradeCount].sellPrice = arr[i+1].Close;
                        trades[tradeCount].closeDate = arr[i+1].Date;
                        tradeCount++;
                        // console.log(trades[tradeCount])
                        break;
                    }
                }
        }
    }
    trades.forEach(trade=>{
        const gainLoss = Number(trade.sellPrice)/Number(trade.buyPrice);
        currentAcctValue = currentAcctValue*gainLoss;
    })
    console.log(trades.slice(trades.length-10, trades.length))
    console.log(trades.length)
    console.log(currentAcctValue);
    // next, see if there's a pt where the slope goes from pos to neg.
    // if so, sell. 

    // for now, if 2 consecutive ones of the same type are encountered,
    // no trade.

    // calc overall change
})