import { Column } from "../interfaces/types";

export const columns: Column[] = [
    { header: "ID", accessor: "id" },
    { header: "Wallet ID", accessor: "walletId" },
    { header: "Amount", accessor: "amount" },
    { header: "Balance", accessor: "balance" },
    { header: "Description", accessor: "description" },
    {
        header: "Date",
        accessor: "date",
        formatter: (value) => new Date(value).toLocaleString(),
    },
    { header: "Type", accessor: "type" },
];