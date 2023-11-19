const {checkLongClose, checkShortClose} = require('./execute')

const yesterday = [{
    twentyMA: 2,
    Close: 420
}]
const today =[{
    twentyMA: 2,
    Close: 420,
    fiftyMA:2,
    Date:'2023-11-19'
}]

exports.checkOpen = async(openTrade) => {
    if (openTrade){
        if (openTrade.type==='long'){
            const close = await checkLongClose(today, yesterday, openTrade);
            return {close, long:'long'};
        } else{
            const close = await checkShortClose(today)
            return {close, short: 'short'};
        }
    }
}