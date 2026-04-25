import React, { useState } from 'react';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const navLinks = [
    { name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Asset Tracker', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'Daily Spending', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V15' },
    { name: 'Monthly & Yearly spending tracker', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="logo">Global Wealth</h1>
        </div>
        <nav className="sidebar-nav">
          {navLinks.map((link, i) => (
            <a key={i} href="#" className={`nav-link ${link.name === 'Dashboard' ? 'active' : ''}`}>
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon}></path>
              </svg>
              {link.name}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="user-info">H. Wang</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-container">
            <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="var(--menu-icon, M4 6h16M4 12h16M4 18h16)"></path>
              </svg>
            </button>
            <h2 className="page-title">Dashboard</h2>
            <div className="header-actions">
              <span className="date-display">April 25, 2026</span>
            </div>
          </div>
        </header>

        <main className="content">
          <div className="container">
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
          </div>
        </main>

        <footer className="footer">
          <div className="container">
            <p>&copy; 2026 Global Wealth Management. Humble growth for the long term.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
