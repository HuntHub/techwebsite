import React from 'react';
import './mainnavbar.css';
import logo from './websitelogo.png';


const MainNavBar = () => {
    return (
      <div className="main-navbar">
        <div className="website-name">
            {/*Insert webpage name here */}
            <img src={logo} alt="Logo" className="websitelogo" />
        </div>
        <div className="navbar-links">
            {/* Insert links below */}
            <a href="/maxbudgetcalculator">Max Budget Build </a>
        </div>
        <div className='website-title'>
        <h1>Active Deals</h1>
        </div>
        <div className="powered-by-container">
          <span className="powered-by-text">Powered by:</span>
          <a href="https://developer.bestbuy.com" className="best-buy-logo-container">
            <img src="https://developer.bestbuy.com/images/bestbuy-logo.png" alt="Best Buy Developer API" className="best-buy-logo" />
          </a>
        </div>
      </div>
    );
  }
  
  export default MainNavBar;