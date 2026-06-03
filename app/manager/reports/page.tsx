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
      // Convert dates from YYYY-MM-DD to M/D/YYYY format to match database
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US');
      };

      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);

      console.log('Populating temp tables with:', { start_date: formattedStartDate, end_date: formattedEndDate });
      await invoke('populate_temp_tables', {
        data: { start_date: formattedStartDate, end_date: formattedEndDate }
      });
      const fetchedTransactions = await fetchTransactions();
      console.log('Fetched transactions:', fetchedTransactions.length);
      // Only set populated if transactions were found
      if (fetchedTransactions.length > 0) {
        setPopulated(true);
        toast.success('Tables populated successfully');
      } else {
        setPopulated(false);
        toast.error('No transactions found for the selected date range');
      }
    } catch (error) {
      toast.error('Failed to populate tables: ' + error);
      setPopulated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Fetch from temp tables without date filter since they already contain the date range
      const result = await invoke<[any[], number]>('get_transaction_history', {
        businessDate: '', // Empty string to skip date filter
        page: 1,
        pageSize: 1000,
      });
      setTransactions(result[0]);
      return result[0];
    } catch (error) {
      toast.error('Failed to fetch transactions: ' + error);
      return [];
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
              <Button onClick={handleExportCSV} variant="outline" disabled={transactions.length === 0}>
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

        {populated && transactions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm">No transactions exist for the selected date range</p>
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
