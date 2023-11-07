const fs = require('fs')

fs.readFile('spy.json', 'utf8', (err, data)=>{
    const arr = JSON.parse(data)
    // calculate the 200-day Simple Moving Avg
    let sum = [];
    arr.forEach((day, index)=>{
        sum.push(Number(day.Close));
        if (index>=200){
            sum.shift()
            const total = sum.reduce((val, i)=>{
                return val+=i
            }, 0)
            const movingAvg = total/200
            day.SMA = movingAvg
        }
    })
    const newData = JSON.stringify(arr, null, 2);
    fs.writeFile('spy.json', newData, err=>{
        if (err){
            console.log(err)
        } else{
            console.log('nice')
        }
    })
})

