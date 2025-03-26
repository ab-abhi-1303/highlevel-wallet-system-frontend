import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Wallet from './components/Wallet';
import Transactions from './components/Transactions';

function App() {
  return (
    <Router>
      <div className="container">
        <nav>
          <Link to="/">Wallet</Link>
          <Link to="/transactions">Transactions</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Wallet />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
