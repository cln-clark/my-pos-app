'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Filter, User, CreditCard, DollarSign, RefreshCw, ChevronLeft, ChevronRight, Download, Printer } from "lucide-react";
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import { ManagerLayout } from "@/components/layout/manager-layout";
import { TransactionDetailDrawer } from "@/components/pos/transaction-detail-drawer";
import { TransactionDetailResponse } from "@/lib/receipt";

interface TransactionHistoryProps {
  // TODO: Pass transactions from context or fetch from backend
}

export default function TransactionHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVoidStatus, setFilterVoidStatus] = useState<'all' | 'voided' | 'active'>('all');
  const [transactions, setTransactions] = useState<TransactionDetailResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const fetchTransactions = async (page: number = 1) => {
    setLoading(true);
    try {
      const now = new Date();
      const businessDate = now.toLocaleDateString('en-US');
      const [data, count] = await invoke<[TransactionDetailResponse[], number]>('get_transaction_history', {
        businessDate,
        page,
        pageSize,
      });
      setTransactions(data);
      setTotalCount(count);
      setCurrentPage(page);
    } catch (error) {
      toast.error('Failed to fetch transactions: ' + error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.invoice_no?.toString().includes(searchQuery) || tx.cashier_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVoidStatus = filterVoidStatus === 'all' ||
      (filterVoidStatus === 'voided' && tx.is_voided) ||
      (filterVoidStatus === 'active' && !tx.is_voided);

    return matchesSearch && matchesVoidStatus;
  }).sort((a, b) => b.invoice_no - a.invoice_no);

  const handleExportCSV = () => {
    const dataToExport = filteredTransactions.length > 0 ? filteredTransactions : transactions;
    const headers = ['Invoice No', 'Transaction No', 'Business Date', 'Transaction Date', 'Transaction Time', 'Cashier Name', 'Payment Method', 'Subtotal', 'VAT Amount', 'Total', 'Cash Tendered', 'Change Given', 'Status', 'Voided By', 'Voided At', 'Void Reason'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map((tx) => [
        tx.invoice_no,
        tx.transaction_no || '',
        tx.business_date,
        tx.transaction_date,
        tx.transaction_time,
        tx.cashier_name,
        tx.payment_method,
        tx.subtotal || 0,
        tx.tax || 0,
        tx.total,
        tx.cash_amount_paid ?? 0,
        tx.change_given ?? 0,
        tx.is_voided ? 'Voided' : 'Active',
        tx.voided_by_name || '',
        tx.void_date && tx.void_time ? `${tx.void_date} ${tx.void_time}` : '',
        tx.void_reason || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully');
  };

  const handlePrintReport = () => {
    const dataToPrint = filteredTransactions.length > 0 ? filteredTransactions : transactions;
    const now = new Date();
    const businessDate = now.toLocaleDateString('en-US');
    const printedAt = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const printContent = `
      <html>
      <head>
        <title>Transaction Report</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { font-size: 24px; margin: 0; }
          .header p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 8px; text-align: left; }
          .footer { margin-top: 20px; }
          .footer p { margin: 5px 0; }
          .divider { border-top: 1px solid #000; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RETAILPOS</h1>
          <p>Transaction History Report</p>
          <p>Business Date: ${businessDate}</p>
          <p>Printed by: Manager</p>
          <p>Printed at: ${printedAt}</p>
        </div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Time</th>
              <th>Cashier</th>
              <th>Method</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${dataToPrint.map((tx) => `
              <tr>
                <td>${String(tx.invoice_no).padStart(6, '0')}</td>
                <td>${tx.transaction_date}</td>
                <td>${tx.transaction_time}</td>
                <td>${tx.cashier_name}</td>
                <td>${tx.payment_method}</td>
                <td>${tx.total.toFixed(2)}</td>
                <td>${tx.is_voided ? 'Voided' : 'Active'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="divider"></div>
        <div class="footer">
          <p>Total Transactions: ${dataToPrint.length}</p>
          <p>Active: ${dataToPrint.filter((t) => !t.is_voided).length}    Voided: ${dataToPrint.filter((t) => t.is_voided).length}</p>
          <p>Total Sales: ₱${dataToPrint.filter((t) => !t.is_voided).reduce((sum, t) => sum + t.total, 0).toFixed(2)}</p>
        </div>
        <div class="divider"></div>
      </body>
      </html>
    `;

    // Create a temporary iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(printContent);
      doc.close();
    }
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  return (
    <ManagerLayout>
    <div className="">


       <div className='grid grid-cols-3 gap-4'>

          <div className='col-span-1 space-y-5'>
            {/* Summary Stats */}
            <div className='grid grid-cols-2 gap-3'>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Transactions</p>
                      <p className="text-lg font-bold">{transactions.length}</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Active Sales</p>
                      <p className="text-lg font-bold">
                        {transactions.filter((t) => !t.is_voided).length}
                      </p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Voided</p>
                      <p className="text-lg font-bold">
                        {transactions.filter((t) => t.is_voided).length}
                      </p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <RefreshCw className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="text-lg font-bold">
                        ₱{transactions
                          .filter((t) => !t.is_voided)
                          .reduce((sum, t) => sum + t.total, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>           
            
          </div>

          {/* Transaction Table */}
          <div className='col-span-2'>

            <Card className="h-[630px] flex flex-col">
              <CardHeader className="shrink-0 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <CardTitle>Transactions</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                      className="h-8"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrintReport}
                      className="h-8"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Report
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by invoice or cashier..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      value={filterVoidStatus}
                      onChange={(e) => setFilterVoidStatus(e.target.value as 'all' | 'voided' | 'active')}
                      className="h-9 pl-10 pr-8 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="all">All Transactions</option>
                      <option value="active">Active Only</option>
                      <option value="voided">Voided Only</option>
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fetchTransactions(currentPage)}
                    disabled={loading}
                    className="h-9 px-3"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin" />
                    <p className="text-sm">Loading transactions...</p>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm">No transactions found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Invoice No</TableHead>
                          <TableHead className="whitespace-nowrap">Date</TableHead>
                          <TableHead className="whitespace-nowrap">Time</TableHead>
                          <TableHead className="whitespace-nowrap">Cashier</TableHead>
                          <TableHead className="whitespace-nowrap">Pay Method</TableHead>
                          <TableHead className="whitespace-nowrap">Total</TableHead>
                          <TableHead className="whitespace-nowrap">Status</TableHead>
                          <TableHead className="whitespace-nowrap">Voided By</TableHead>
                          <TableHead className="whitespace-nowrap">Void Reason</TableHead>
                          <TableHead className="whitespace-nowrap">Void Date/Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((tx) => (
                          <TableRow
                            key={`${tx.invoice_no}-${tx.is_voided}`}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => {
                              setSelectedInvoiceNo(tx.invoice_no);
                              setDrawerOpen(true);
                            }}
                          >
                            <TableCell className="font-medium whitespace-nowrap">{tx.invoice_no}</TableCell>
                            <TableCell className="whitespace-nowrap">{tx.transaction_date}</TableCell>
                            <TableCell className="whitespace-nowrap">{tx.transaction_time}</TableCell>
                            <TableCell className="whitespace-nowrap">{tx.cashier_name}</TableCell>
                            <TableCell className="whitespace-nowrap">{tx.payment_method}</TableCell>
                            <TableCell className="whitespace-nowrap">₱{tx.total.toFixed(2)}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {tx.is_voided ? (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                                  Voided
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                  Active
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{tx.voided_by_name || '-'}</TableCell>
                            <TableCell className="whitespace-nowrap">{tx.void_reason || '-'}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {tx.void_date && tx.void_time ? `${tx.void_date} ${tx.void_time}` : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {/* Pagination */}
                {totalCount > 0 && (
                  <div className="border-t p-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchTransactions(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchTransactions(currentPage + 1)}
                        disabled={currentPage >= Math.ceil(totalCount / pageSize) || loading}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

       </div>

    </div>

    <TransactionDetailDrawer
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
      invoiceNo={selectedInvoiceNo || 0}
    />
    </ManagerLayout>
  );
}
