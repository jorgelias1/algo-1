const fs = require('fs')

const calcSum = arr =>{
    const sum = arr.reduce((val, i)=>{
        return val+=i
    }, 0)
    return sum
}
const calcRSI = (avgGain, avgLoss) =>{
    const RS = avgGain/avgLoss;
    const RSI = 100 - (100/(1+RS))
    return RSI
}
const calcRSI_MA = (currentDay, arr) =>{
    let sum = 0;
    for (let i = currentDay-13; i<currentDay+1; i++){
        sum += arr[i].RSI;
    }
    const RSI_MA = sum/14
    return RSI_MA;
}
fs.readFile('spy.json', 'utf8', (err, data)=>{
    const arr = JSON.parse(data)
    // Calculate the 14-day Relative Strength Index
    let gains = [];
    let losses = [];
    for (let currentDay=0, n=arr.length; currentDay<n; currentDay++){
        const prevDay = arr[currentDay-1]
        const change = prevDay 
        ? Number(arr[currentDay].Close) - Number(prevDay.Close)
        : Number(arr[currentDay].Close) - 0;

        if (change < 0){
            losses.push(Math.abs(change));
            gains.push(0);
        } else{
            gains.push(change);
            losses.push(0)
        }
        let avgGain, avgLoss;
        if (currentDay === 13){
        avgGain = calcSum(gains)/14;
        avgLoss = calcSum(losses)/14;
        arr[currentDay].avgGain = avgGain;
        arr[currentDay].avgLoss = avgLoss;
        } else if (currentDay > 13){
            avgGain = (gains[currentDay] + 13*(arr[currentDay-1].avgGain))/14;
            avgLoss = (losses[currentDay] + 13*(arr[currentDay-1].avgLoss))/14;
            arr[currentDay].avgGain = avgGain;
            arr[currentDay].avgLoss = avgLoss;
            arr[currentDay].RSI = calcRSI(avgGain, avgLoss);
        }
        // need 14 past days with an RSI val to calculate the current 14-day SMA
        if (currentDay>27){
            arr[currentDay].RSI_MA = calcRSI_MA(currentDay, arr);
        }
    }
    fs.writeFile('spy.json', JSON.stringify(arr, null, 2), err=>{
        if (err){
            console.log(err)
        } else {
            console.log('finished editing')
        }
    })
})