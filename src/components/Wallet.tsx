import React, { useState, useEffect } from "react";
import { setupWallet, getWallet, transactWallet } from "../util/api";
import { WalletType } from "../interfaces/types";

const Wallet: React.FC = () => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [username, setUsername] = useState<string>("");
  const [initialBalance, setInitialBalance] = useState<string>("");
  const [txAmount, setTxAmount] = useState<string>("");
  const [txType, setTxType] = useState<"credit" | "debit">("credit");
  const [txDescription, setTxDescription] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const walletId = localStorage.getItem("walletId");
    if (walletId) {
      setLoading(true);
      getWallet(walletId)
        .then((res) => setWallet(res.data))
        .catch((err) => {
          console.error(err);
          setError("Failed to fetch wallet details.");
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const handleSetup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username) {
      setError("Username is required.");
      return;
    }
    const balance = initialBalance ? parseFloat(initialBalance) : 0;
    setLoading(true);
    try {
      const res = await setupWallet({ name: username, balance });
      const newWallet: WalletType = res.data;
      setWallet(newWallet);
      localStorage.setItem("walletId", newWallet.id);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to setup wallet.");
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!txAmount) {
      setError("Transaction amount is required.");
      return;
    }

    const amount = txType === "credit" ? parseFloat(txAmount) : -Math.abs(parseFloat(txAmount));

    const walletId = localStorage.getItem("walletId");

    if (!walletId) {
      setError("Wallet is not configured.");
      return;
    }

    if (txType === "debit" && parseFloat(txAmount) > (wallet?.balance || 0)) {
      setError("Insufficient balance.");
      return;
    }

    setLoading(true);
    try {
      const res = await transactWallet(walletId, {
        amount,
        description: txDescription,
      });

      setWallet((prev) => (prev ? { ...prev, balance: res.data.balance } : null));
      setTxAmount("");
      setTxDescription("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (amount: string) => {
    setTxAmount(amount);
    const parsedAmount = parseFloat(amount);
    if (parsedAmount <= 0) {
      setTxAmount("");
      setError("Amount should be greater than 0.");
    } else {
      setError("");
    }
  };

  return (
    <div>
      <h1>Wallet</h1>
      {error && <p className="error">{error}</p>}

      {loading ? (
        <div className="loader">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {!wallet ? (
            <div className="form-container">
              <h2>Initialize Wallet</h2>
              <form onSubmit={handleSetup}>
                <label>Username:</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <label>Initial Balance (optional):</label>
                <input type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} />
                <div>
                  <button type="submit">Create Wallet</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="form-container">
              <h2>Wallet Details</h2>
              <p>
                <strong>ID:</strong> {wallet.id}
              </p>
              <p>
                <strong>Name:</strong> {wallet.name}
              </p>
              <p>
                <strong>Balance:</strong> {wallet.balance.toFixed(4)}
              </p>
              <hr />
              <h3>Make a Transaction</h3>
              <form onSubmit={handleTransaction}>
                <label>Amount:</label>
                <input type="number" value={txAmount} onChange={(e) => handleAmountChange(e.target.value)} required />
                <label>Type:</label>
                <select value={txType} onChange={(e) => setTxType(e.target.value as "credit" | "debit")}>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
                <label>Description: (Optional)</label>
                <input type="text" value={txDescription} onChange={(e) => setTxDescription(e.target.value)} />
                <button type="submit">Submit Transaction</button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Wallet;
