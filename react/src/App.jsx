import { useState } from 'react'
import svg from './assets/svg-path.svg'
import './App.css'

const ChartAnimation=()=>{
  return(
    // <div >
    //   <img src={svg} style={{height:'100vh', width:'100vw'}}/>
    // </div>
    <div className='container'>
      <p className='textOverlay'>
        <div>Crazy simple.</div>
        <div>Crazy returns.</div>
      </p>
      <ul className='textOverlay secondary' style={{fontFamily: 'monospace'}}>
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
      <svg className='chartAnimation' xmlns="http://www.w3.org/2000/svg" viewBox="2.6 -10.4 16.8 13.8" style={{ height:'100vh', width:'100vw', transform:'scale(1.1)'}}>
        <path className='morph' d='M 3 3 L 5 1 L 7 2 L 8 1 L 10 2 L 11 -2 L 12 -1 L 13 -4 L 15 0 L 16 -5 L 17 -4 L 19 -10' fill='none' strokeWidth='0.2' strokeLinecap='round'/>
      </svg>
    </div>
  )
}

const App=()=>{
  return (
    <div className='bg'>
    <ChartAnimation/>
    </div>
  )
}

export default App
