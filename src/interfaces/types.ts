import { TransactionResponse } from "../util/api";

export interface Column {
    header: string;
    accessor: keyof TransactionResponse;
    formatter?: (value: any) => string;
}

export interface WalletType {
  id: string;
  name: string;
  balance: number;
  date?: string;
}