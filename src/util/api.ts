// src/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://highlevel-wallet-system-backend.onrender.com/', 
});

// Type definitions
export interface WalletResponse {
  id: string;
  balance: number;
  name: string;
  date: string;
  transactionId?: string;
}

export interface TransactionResponse {
  id: string;
  walletId: string;
  amount: number;
  balance: number;
  description: string;
  date: string;
  type: string;
}

export const setupWallet = (data: { name: string; balance: number }) =>
  api.post<WalletResponse>('/setup', data);

export const getWallet = (walletId: string) =>
  api.get<WalletResponse>(`/wallet/${walletId}`);

export const transactWallet = (walletId: string, data: { amount: number; description?: string }) =>
  api.post<WalletResponse>(`/transact/${walletId}`, data);

export const fetchTransactions = (params: { walletId: string; skip: number; limit: number }) =>
  api.get<TransactionResponse[]>('/transactions', { params });

export default api;
