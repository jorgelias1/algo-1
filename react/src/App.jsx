import { useState } from 'react'
import svg from './assets/svg-path.svg'
import {getTrades} from './services/frontTrades.js'
import './App.css'

const Arrow=()=>{
  return(
    <div className='arrow'>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="30" viewBox="0 0 20 50">
        <line x1="5" y1="16" x2="15" y2="25" stroke="white" strokeWidth="4" strokeLinecap='round'/>
        <line x1="5" y1="34" x2="15" y2="25" stroke="white" strokeWidth="4" strokeLinecap='round'/>
      </svg>
    </div>
  )
}
const Check=()=>{
  return(
    <svg width='25' height='25'>
      <circle cx="25" cy="25" r="21" fill="none" stroke="white" strokeWidth="2" transform='scale(0.5,0.5)'/>
      <path d="M25 50L45 70L75 30" stroke="white" transform='scale(0.25,0.25)' strokeWidth="3" fill="transparent" />
    </svg>
  )
}

const BacktestCard=()=>{
  const data=[
    ['Ticker','GOOG', 'META', 'GME', 'SPY', 'NASDAQ'],
    ['IPO Backtest','92.6x', '16.14x', '16.01x', '21.03x', '224.0x'],
    ['Actual Change','50.72x', '9.85x', '7.76x', '17.95x', '140.10x'],
    ['% Outperform','83%', '64%', '106%', '17%', '60%']
  ]
  return(
    <div className='companies'>
            <div className='cardTitle'>Backtest Highlights</div>
            <table>
              <tbody>
                {data.map((row, rIndex)=>(
                  <tr key={rIndex}>
                    {row.map((cell, cIndex)=>{
                      const name=`row-${rIndex}`;
                      return <td key={cIndex} className={name}>{cell}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
  )
}
const Stats=()=>{
  return(
    <ul className='secondary'>
      <li>
        150+ Years
        <div>of backtesting</div>
      </li>
      <li>
        58%
        <div>success rate</div>
      </li>
      <li>
        Paper Trading
        <div>since 11/07/2023</div>
      </li>
    </ul>
  )
}
const Performance=({avgPctReturn, tradeCount, winCount, lossCount, setStats})=>{
  const roundVal=(val, precision)=>{
    return Number(parseFloat(val).toFixed(precision))
  }
  avgPctReturn = roundVal(avgPctReturn, 4)*100
  return(
      <div>
        <ul className='performance'>
          <div className='main'>
            <li>
              <div>
                <div>SPY</div>
              </div>
              <div>Ticker</div>
            </li>
            <li>
              <div>
                <div>{avgPctReturn}%</div>
              </div>
              <div>Return/Trade</div>
            </li>
            <li>
              <div>
                <div>{tradeCount}</div>
              </div>
              <div>Total Trades</div>
            </li>
            <li>
              <div>
                <div>{roundVal(winCount/lossCount, 2)}</div>
              </div>
              <div>W/L ratio</div>
            </li>
          </div>
          <div className='close' onClick={()=>setStats(null)}>✖</div>
        </ul>
        <div className='blur'>
        </div>
      </div>
  )
}
const MainContents=()=>{
  const [stats, setStats] = useState(null);
  const getTradeStats=(trades)=>{
    // fade, reveal others slowly. 
    // avgpct, number of trades, number of wins, number of losses, number of short trades, number of long trades
    // mini custom timeline showing all trades + magnitude of win/loss.
    const tradeCount = trades.length;
    let winCount=0;
    let lossCount=0;
    let totalPct=0;
    trades.forEach(trade=>{
      if(Number(trade.buy_price) < Number(trade.sell_price)){
        winCount++;
      } else if(Number(trade.buy_price) > Number(trade.sell_price)){
        lossCount++;
      }
      let openCost;
      if(trade.type==='long'){
        openCost=Number(trade.buy_price);
      } else{
        openCost=Number(trade.sell_price);
      }
      const difference = Number(trade.sell_price)-Number(trade.buy_price);
      const pct = difference/openCost;
      totalPct+=pct;
    }) 
    const avgPctReturn = totalPct/tradeCount;
    console.log(tradeCount)
    return{
      winCount, lossCount, tradeCount, avgPctReturn
    }
  }
  const navBacktesting=async()=>{
    const re = await getTrades('SPY');
    const trades = re.data.rows.filter(trade=>(
      new Date(trade.open_date) < new Date('2023-11-02')
    ))
    setStats(getTradeStats(trades));
  }
  const navCurrent=async()=>{
    const re = await getTrades('SPY');
    const trades = re.data.rows.filter(trade=>(
      new Date(trade.open_date) > new Date('2023-11-02')
    ))
    setStats(getTradeStats(trades));
  }
  return(
    <div className='container' style={{height:'100%'}}>
      <div style={{position:'absolute',width:'80vw', height:'0.4vh', background:'linear-gradient(to right, white, transparent)', top:'15%', left:'6%'}}></div>
      <div style={{position:'absolute',width:'0.4vh', height:'40vw', background:'linear-gradient(to bottom, white, transparent)', top:'15%', left:'6%'}}></div>
      {stats && <Performance winCount={stats.winCount} lossCount={stats.lossCount} avgPctReturn={stats.avgPctReturn} tradeCount={stats.tradeCount} setStats={setStats}/>}
      <div className='flexV'>
        <div className='mainContents'>
          <div className='primary'>
            <h1 className='title'>
              <div>Crazy simple.</div>
              <div>Crazy returns.</div>
            </h1>
            <p className='textBody'>
              Based on up to 50 years of data per security, the TA-based algorithm has outperformed major indices like the S&P500 and the NASDAQ on various time scales, including all-time and 3yrs in backtests. This site is designed to track the performance of my algorithm in real-time, by paper trading.
            </p>
            <div className='buttons'>
            <button className='primaryBtn' onClick={navBacktesting}>Backtesting Performance <Arrow/></button>
            <button className='secondaryBtn' onClick={navCurrent}>Current Performance <Arrow/></button>
          </div>
          </div>
          <BacktestCard/>
        </div>
        <Stats/>
      </div>
      <svg className='chartAnimation' xmlns="http://www.w3.org/2000/svg" viewBox="2.3 -10.2 19.5 13.8" style={{minHeight:'100vh', width:'100vw', transform:'scale(1.1)'}}>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:'rgb(20,0,130)', stopOpacity:'1'}} />
            <stop offset="100%" style={{stopColor:'rgb(20,0,80)', stopOpacity:'0'}} />
          </linearGradient>
        </defs>
        <path className='morph' d='M 3 3 L 3.4 2.5 L 4 2.3 L 4.3 1.9 L 4.8 2 L 5.2 0.8 L 5.7 1.7 L 6.1 1.3 L 6.6 0.8 L 7 1 L 7.5 1.8 L 8 1.2 L 8.4 0.5 L 8.9 -0.2 L 9.3 0.9 L 9.8 0.4 L 10 0 L 10.5 -1 L 11.1 -0.2 L 11.6 0 L 12 0 L 12.5 -0.3 L 12.9 -0.7 L 13.4 -0.1 L 13.8 -0.9 L 14.3 -1.5 L 14.7 -2.1 L 15.2 -2.3 L 15.6 -3.1 L 16.1 -3.4 L 16.5 -4.4 L 17 -4.2 L 17.4 -4.7 L 17.9 -5.3 L 18.3 -6.2 L 18.8 -7.1 L 19.2 -8.5 L 19.7 -8.8 L 20.5 -8 L 21 -8.3 L 22.3 -8.3 L 23 -8.8 L 23.4 -9 L 25 -11 L 25 3' fill='url(#gradient)' strokeWidth='0.1' strokeLinecap='round' strokeLinejoin='round'/>
      </svg>
    </div>
  )
}

const App=()=>{
  return (
    <div className='bg' style={{overflow:'hidden', width:'100vw'}}>
    <MainContents/>
    </div>
  )
}

export default App
