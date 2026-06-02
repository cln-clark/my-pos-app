'use client';

import { useState } from 'react';
import { ManagerLayout } from "@/components/layout/manager-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Calendar, Download, RefreshCw } from "lucide-react";
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [populated, setPopulated] = useState(false);

  const handlePopulateTables = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      await invoke('populate_temp_tables', {
        data: { start_date: startDate, end_date: endDate }
      });
      setPopulated(true);
      toast.success('Tables populated successfully');
      await fetchTransactions();
    } catch (error) {
      toast.error('Failed to populate tables: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const businessDate = now.toLocaleDateString('en-US');
      const result = await invoke<[any[], number]>('get_transaction_history', {
        businessDate,
        page: 1,
        pageSize: 100,
      });
      setTransactions(result[0]);
    } catch (error) {
      toast.error('Failed to fetch transactions: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      // Generate CSV content
      const headers = ['Invoice No', 'Transaction No', 'Date', 'Time', 'Cashier', 'Payment Method', 'Total', 'Status'];
      const rows = transactions.map(t => [
        t.invoice_no,
        t.transaction_no,
        t.transaction_date,
        t.transaction_time,
        t.cashier_name,
        t.payment_method,
        t.total,
        t.is_voided ? 'Voided' : 'Active'
      ]);

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${startDate}_to_${endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      // Clear temp tables after export
      await invoke('clear_temp_tables');
      setPopulated(false);
      setTransactions([]);
      toast.success('CSV exported and temp tables cleared');
    } catch (error) {
      toast.error('Failed to export CSV: ' + error);
    }
  };

  return (
    <ManagerLayout>
      <div className="flex flex-col h-full">
        <h1 className="text-2xl font-bold mb-4">Reports</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={handlePopulateTables} disabled={loading}>
              <Filter className="w-4 h-4 mr-2" />
              {loading ? 'Loading...' : 'Generate Report'}
            </Button>
            {populated && (
              <Button onClick={handleExportCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </div>

        {populated && transactions.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Transaction No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.transaction_no}>
                    <TableCell>{tx.invoice_no}</TableCell>
                    <TableCell>{tx.transaction_no}</TableCell>
                    <TableCell>{tx.transaction_date}</TableCell>
                    <TableCell>{tx.transaction_time}</TableCell>
                    <TableCell>{tx.cashier_name}</TableCell>
                    <TableCell>{tx.payment_method}</TableCell>
                    <TableCell>₱{tx.total.toFixed(2)}</TableCell>
                    <TableCell>
                      {tx.is_voided ? (
                        <span className="text-red-600">Voided</span>
                      ) : (
                        <span className="text-green-600">Active</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!populated && (
          <div className="text-center py-12 text-muted-foreground">
            Select a date range and click "Generate Report" to view transactions
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}
