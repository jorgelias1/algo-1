const fs = require('fs')

fs.readFile('spy.json', 'utf8', (err, data)=>{
    const arr = JSON.parse(data)
    // const arr = init.slice(7*init.length/8, init.length)
    const trades = [];
    let currentAcctValue = 1;
    let b = 0;
    for (let currentDay=28, n=arr.length, tradeCount=0; currentDay<n; currentDay++){
        // if negative slope + price close above the 200sma + slope positive next day (trade day)
        if (
            (arr[currentDay].Close > arr[currentDay].SMA
            && arr[currentDay].RSI > arr[currentDay].RSI_MA
            || arr[currentDay].RSI > 60 
            )
            ){  
                const purchaseDate = currentDay+1;
                if (tradeCount > 0){
                    const previousTradeEnd = trades[tradeCount-1].tradeEndIndex;
                    if (previousTradeEnd <= purchaseDate){
                        if (arr[purchaseDate+1]){
                            trades.push({buyPrice: arr[purchaseDate].Close, openDate: arr[purchaseDate].Date});
                            // interesting. the larger the gap, the larger the return?
                            // see returns by year
                            // if returns continue to seem too good to be true, try on other stocks.  
                            for (let i = purchaseDate+1, j = arr.length; i<j;i++){
                                // adjust criteria for selling
                                if (arr[i]){
                                    if ((arr[i].twentyMA - arr[i-1].twentyMA > 0 && arr[i].twentyMA/arr[i-1].twentyMA < 1.0001
                                        )
                                        || arr[i].Close/arr[purchaseDate].Close >1.07 || arr[purchaseDate].Close/arr[i].Close < 0.955
                                        || i - purchaseDate > 100
                                        ){
                                    if (i - purchaseDate > 100){
                                        b++;
                                    }
                                    trades[tradeCount].sellPrice = arr[i].Close;
                                    trades[tradeCount].closeDate = arr[i].Date;
                                    trades[tradeCount].tradeEndIndex = i;
                                    trades[tradeCount].type='buy';
                                    tradeCount++;
                                    break;
                                    } else if (i===arr.length-1){
                                        trades[tradeCount].sellPrice = arr[i].Close;
                                        trades[tradeCount].closeDate = arr[i].Date;
                                        trades[tradeCount].tradeEndIndex = i;
                                        trades[tradeCount].type='buy';
                                        tradeCount++;
                                        break;
                                    }
                                } else{
                                    trades.pop()
                                }
                            }
                        }
                    }
                } else{
                    trades.push({buyPrice: arr[purchaseDate].Close, openDate: arr[purchaseDate].Date});  
                    for (let i = purchaseDate+1, j = arr.length; i<j;i++){
                        // adjust criteria for selling
                        if (arr[i+1].RSI_MA - arr[i].RSI_MA < 0.1){
                            trades[tradeCount].sellPrice = arr[i+1].Close;
                            trades[tradeCount].closeDate = arr[i+1].Date;
                            trades[tradeCount].tradeEndIndex = i+1;
                            trades[tradeCount].type='buy';
                            tradeCount++;
                            break;
                        }
                    }
                }
            
        } 
        // else if bearish
        
        else if (
            arr[currentDay].Close < arr[currentDay].SMA
            ){
                const purchaseDate = currentDay+1;
                let previousTradeEnd;
                if (trades[tradeCount-1]){
                    previousTradeEnd = trades[tradeCount-1].tradeEndIndex;
                }
                    if (!previousTradeEnd || previousTradeEnd <= purchaseDate){
                        if (arr[purchaseDate]){
                            trades.push({sellPrice: arr[purchaseDate].Close, openDate: arr[purchaseDate].Date});

                            for (let i = purchaseDate, j = arr.length; i<j;i++){
                                // adjust criteria for selling
                                if (arr[i].Close > arr[i].fiftyMA){
                                    trades[tradeCount].buyPrice = arr[i+1].Close;
                                    trades[tradeCount].closeDate = arr[i+1].Date;
                                    trades[tradeCount].tradeEndIndex = i+1;
                                    tradeCount++;
                                    break;
                                }
                                if (i===j-1){
                                    trades[tradeCount].buyPrice = arr[i].Close;
                                    trades[tradeCount].closeDate = arr[i].Date;
                                    trades[tradeCount].tradeEndIndex = i;
                                    tradeCount++;
                                    break;
                                }
                            }

                        }
                    }
            }
    }
    console.log('b',b)

    let longWs = 0;
    let shortWs=0;
    trades.forEach((trade)=>{
        if (trade.sellPrice){
        const gainLoss = Number(trade.sellPrice)/Number(trade.buyPrice);
        currentAcctValue = currentAcctValue*gainLoss;
        // console.log(currentAcctValue, trade.openDate,'-',trade.closeDate, trade.buyPrice, trade.sellPrice,trade.type)
        if(!trade.sellPrice){
            console.log(trade)
        }
        if (trade.sellPrice - trade.buyPrice > 0){
            if (trade.type==='buy'){
                longWs++;
            }
            else{
                shortWs++;
            }
        } else{
            if (trade.type==='buy'){
                {}
                // console.log(trade)
            }
        }
    }
    })
    console.log(trades)

    console.log('wins:',longWs, 'losses:', trades.length-(shortWs+longWs))
    // console.log(trades.slice(trades.length-10, trades.length))
    // console.log(trades.slice(0, 1))
    console.log(trades.length)
    console.log(currentAcctValue);
    // next, see if there's a pt where the slope goes from pos to neg.
    // if so, sell. 

    // for now, if 2 consecutive ones of the same type are encountered,
    // no trade.

    // calc overall change
    const dates=[];
    const prices=[];
    arr.forEach(day=>{
        dates.push(day.Date)
        prices.push(day.Close)
    })
})