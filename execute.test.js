const {checkOpen} = require('./helper')

// see if properly executed with open trade -  
// ensure no trade is opened, only attempt to close. 

const shortTrade=[[[{
    type: 'short',
    sell_price: 500.50,
    open_date:'2023-11-18',
    ticker:'SPY',
    buy_price:null,
    close_date:null
}]]]
const longTrade=[[[{
    type: 'long',
    buy_price: 500.50,
    open_date:'2023-11-18',
    ticker:'SPY',
    sell_price:null,
    close_date:null
}]]]
const openTrades = shortTrade.concat(longTrade);
describe.each(openTrades)('main', (trade)=>{
    test(`should be truthy since criteria are met`, async()=>{

        const validTrade = await checkOpen(trade);
        expect(validTrade.close).toBeTruthy();
    })
})