import React from 'react';
import './App.css';

function App() {
  const holdings = [
    { name: 'Total World Stock ETF', ticker: 'VT', allocation: '65.0%', value: '$142,350.21' },
    { name: 'Intermediate-Term Treasury ETF', ticker: 'VGIT', allocation: '25.0%', value: '$54,750.00' },
    { name: 'Total International Bond ETF', ticker: 'BNDX', allocation: '10.0%', value: '$21,900.00' },
  ];

  const activity = [
    { date: 'Apr 20, 2026', type: 'Dividend Reinvestment', asset: 'VT', amount: '+$342.12' },
    { date: 'Apr 15, 2026', type: 'Monthly Contribution', asset: 'Portfolio', amount: '+$5,000.00' },
    { date: 'Mar 31, 2026', type: 'Rebalance', asset: 'VGIT/VT', amount: 'N/A' },
  ];

  return (
    <div className="dashboard">
      <header className="header">
        <div className="container">
          <h1 className="logo">Global Wealth</h1>
          <nav className="nav">
            <span className="user-status">Investor: H. Wang</span>
          </nav>
        </div>
      </header>

      <main className="container main-content">
        <section className="summary-section">
          <div className="card summary-card">
            <h3>Net Worth</h3>
            <p className="value">$219,000.21</p>
            <span className="trend positive">+1.2% this month</span>
          </div>
          <div className="card summary-card">
            <h3>Equity Allocation</h3>
            <p className="value">65.0%</p>
            <span className="trend neutral">Target: 65%</span>
          </div>
          <div className="card summary-card">
            <h3>Time Horizon</h3>
            <p className="value">18 Years</p>
            <span className="trend neutral">To Goal: Retirement</span>
          </div>
        </section>

        <section className="detail-section">
          <div className="card holdings-card">
            <h2>Core Holdings</h2>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Asset Name</th>
                    <th>Ticker</th>
                    <th>Allocation</th>
                    <th className="text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h, i) => (
                    <tr key={i}>
                      <td>{h.name}</td>
                      <td><code className="ticker">{h.ticker}</code></td>
                      <td>{h.allocation}</td>
                      <td className="text-right">{h.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card activity-card">
            <h2>Recent Activity</h2>
            <ul className="activity-list">
              {activity.map((a, i) => (
                <li key={i} className="activity-item">
                  <div className="activity-info">
                    <span className="activity-type">{a.type}</span>
                    <span className="activity-date">{a.date}</span>
                  </div>
                  <div className="activity-amount">
                    <span className="asset-tag">{a.asset}</span>
                    <span className={a.amount.startsWith('+') ? 'amount positive' : 'amount'}>
                      {a.amount}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Global Wealth Management. Humble growth for the long term.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
