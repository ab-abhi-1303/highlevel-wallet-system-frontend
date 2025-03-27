import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTransactions, TransactionResponse } from "../util/api";
import { columns } from "../config/TableConfig";

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [skip, setSkip] = useState<number>(0);
  const limit = 10;
  const [error, setError] = useState<string>("");

  const walletId = useMemo(() => localStorage.getItem("walletId"), []);

  const loadTransactions = useCallback(async () => {
    if (!walletId) {
      setError("Wallet is not configured.");
      return;
    }
    try {
      const res = await fetchTransactions({ walletId, skip, limit });
      setTransactions(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load transactions.");
    }
  }, [walletId, skip, limit]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleExportCSV = useCallback(() => {
    const headers = columns.map((col) => col.header);
    const rows = transactions.map((txn) =>
      columns.map((col) => {
        const value = txn[col.accessor];
        return col.formatter ? col.formatter(value) : value;
      })
    );
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
  }, [transactions, columns]);

  const handlePrevious = useCallback(() => {
    setSkip((prev) => Math.max(0, prev - limit));
  }, [limit]);

  const handleNext = useCallback(() => {
    setSkip((prev) => prev + limit);
  }, [limit]);

  return (
    <div>
      <h1>Transactions</h1>
      {error && <p className="error">{error}</p>}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.accessor}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((txn) => (
                <tr key={txn.id}>
                  {columns.map((col) => (
                    <td key={col.accessor}>{col.formatter ? col.formatter(txn[col.accessor]) : txn[col.accessor]}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="button-group">
        <button onClick={handlePrevious} disabled={skip === 0}>
          Previous
        </button>
        <button onClick={handleNext} disabled={transactions.length < limit}>
          Next
        </button>
      </div>
      <div className="button-group" style={{ marginTop: "10px" }}>
        <button onClick={handleExportCSV}>Export CSV</button>
      </div>
      <div>
        <button className="back-btn" onClick={() => navigate("/")}>
          Back to Wallet
        </button>
      </div>
    </div>
  );
};

export default Transactions;
