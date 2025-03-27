import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTransactions, TransactionResponse } from "../util/api";
import { columns } from "../config/TableConfig";

type SortField = "date" | "amount";
type SortOrder = "asc" | "desc";

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [skip, setSkip] = useState<number>(0);
  const limit = 10;
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const walletId = useMemo(() => localStorage.getItem("walletId"), []);

  const loadTransactions = useCallback(async () => {
    if (!walletId) {
      setError("Wallet is not configured.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetchTransactions({ walletId, skip, limit });
      setTransactions(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }, [walletId, skip, limit]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Memoized sorted transactions based on sortField and sortOrder
  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions];
    sorted.sort((a, b) => {
      if (sortField === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortField === "amount") {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0;
    });
    return sorted;
  }, [transactions, sortField, sortOrder]);

  const handleExportCSV = useCallback(() => {
    const headers = columns.map((col) => col.header);
    const rows = sortedTransactions.map((txn) =>
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
  }, [sortedTransactions]);

  const handlePrevious = useCallback(() => {
    setSkip((prev) => Math.max(0, prev - limit));
  }, [limit]);

  const handleNext = useCallback(() => {
    setSkip((prev) => prev + limit);
  }, [limit]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  return (
    <div>
      <h1>Transactions</h1>
      {error && <p className="error">{error}</p>}

      <div className="sorting-controls">
        <label htmlFor="sortField">Sort By: </label>
        <select id="sortField" value={sortField} onChange={(e) => setSortField(e.target.value as SortField)}>
          <option value="date">Date</option>
          <option value="amount">Amount</option>
        </select>
        <button onClick={toggleSortOrder}>{sortOrder === "asc" ? "Ascending" : "Descending"}</button>
      </div>

      {loading ? (
        <div className="loader">
          <div className="spinner"></div>
        </div>
      ) : (
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
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map((txn) => (
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
      )}
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
