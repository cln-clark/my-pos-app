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
import { Search, Filter, Calendar, User, CreditCard, DollarSign, RefreshCw, Ban, RotateCcw, ArrowRightLeft } from "lucide-react";
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import { ManagerLayout } from "@/components/layout/manager-layout";
import { VoidReasonDialog } from "@/components/pos/void-reason-dialog";
import { PinConfirmationDialog } from "@/components/pos/pin-confirmation-dialog";
import { ExchangeModal } from "@/components/pos/exchange-modal";
import { TransactionHistoryResponse, UserResponse } from "@/lib/types";


export default function VoidRefundPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterVoidStatus, setFilterVoidStatus] = useState<'all' | 'voided' | 'active'>('all');
  const [transactions, setTransactions] = useState<TransactionHistoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionHistoryResponse | null>(null);
  const [pendingAction, setPendingAction] = useState<'void' | 'unvoid' | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let businessDate = filterDate || now.toLocaleDateString('en-US');
      if (filterDate) {
        const date = new Date(filterDate);
        businessDate = date.toLocaleDateString('en-US');
      }
      const [data, count] = await invoke<[TransactionHistoryResponse[], number]>('get_transaction_history', {
        businessDate,
        page: 1,
        pageSize: 100,
      });
      setTransactions(data);
    } catch (error) {
      toast.error('Failed to fetch transactions: ' + error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterDate]);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.invoice_no?.toString().includes(searchQuery) || tx.cashier_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVoidStatus = filterVoidStatus === 'all' ||
      (filterVoidStatus === 'voided' && tx.is_voided) ||
      (filterVoidStatus === 'active' && !tx.is_voided);

    return matchesSearch && matchesVoidStatus;
  }).sort((a, b) => b.invoice_no - a.invoice_no);

  const handleVoid = (tx: TransactionHistoryResponse) => {
    setSelectedTransaction(tx);
    setPendingAction('void');
    setPinDialogOpen(true);
  };

  const handlePinConfirm = async (pin: string) => {
    if (!selectedTransaction) return;

    try {
      // Validate manager PIN
      const users = await invoke<UserResponse[]>('get_users');
      const manager = users.find((u) => u.role_id === 2 && u.pin === pin); // Assuming role_id 2 is manager

      if (!manager) {
        toast.error('Invalid manager PIN');
        setPinDialogOpen(false);
        return;
      }

      if (pendingAction === 'void') {
        setPinDialogOpen(false);
        setVoidDialogOpen(true);
      } else if (pendingAction === 'unvoid') {
        await invoke('unvoid_transaction', {
          data: {
            transaction_no: selectedTransaction.transaction_no,
          },
        });
        toast.success('Transaction unvoided successfully');
        setPinDialogOpen(false);
        fetchTransactions();
      }
    } catch (error) {
      toast.error('Failed to validate PIN: ' + error);
    }
  };

  const handleVoidConfirm = async (reason: string) => {
    if (!selectedTransaction) return;

    try {
      await invoke('void_transaction', {
        data: {
          original_transaction_no: selectedTransaction.invoice_no,
          voided_by_user_code: '1', // TODO: Use actual manager user code
          void_reason: reason,
          company_code: 1,
          store_code: 1,
          terminal_id: 1,
          business_date: selectedTransaction.business_date,
        },
      });
      toast.success('Transaction voided successfully');
      setVoidDialogOpen(false);
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to void transaction: ' + error);
    }
  };

  const handleUnvoid = (tx: TransactionHistoryResponse) => {
    setSelectedTransaction(tx);
    setPendingAction('unvoid');
    setPinDialogOpen(true);
  };

  const handleExchange = (tx: TransactionHistoryResponse) => {
    setSelectedTransaction(tx);
    setExchangeModalOpen(true);
  };

  return (
    <ManagerLayout>
    <div className="">

       <div className='grid grid-cols-3 gap-4'>

          <div className='col-span-1 space-y-5'>
            {/* Filters */}
            <div>
              <Card className="shrink-0 hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex flex-col gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by invoice or cashier..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 h-9"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className="w-full h-9 pl-10"
                        />
                      </div>
                      <div className="relative flex-1">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <select
                          value={filterVoidStatus}
                          onChange={(e) => setFilterVoidStatus(e.target.value as 'all' | 'voided' | 'active')}
                          className="w-full h-9 pl-10 pr-8 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="all">All Transactions</option>
                          <option value="active">Active Only</option>
                          <option value="voided">Voided Only</option>
                        </select>
                      </div>
                      <Button
                        variant="outline"
                        onClick={fetchTransactions}
                        disabled={loading}
                        className="h-9 px-3"
                      >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

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
                <div className="flex items-center justify-between">
                  <CardTitle>Void / Exchange</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredTransactions.length} of {transactions.length}
                  </span>
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
                          <TableHead className="whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((tx) => (
                          <TableRow key={`${tx.invoice_no}-${tx.is_voided}`}>
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
                            <TableCell className="whitespace-nowrap">
                              <div className="flex gap-1">
                                {!tx.is_voided && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleVoid(tx)}
                                    className="h-8 px-2"
                                  >
                                    <Ban className="h-3 w-3" />
                                  </Button>
                                )}
                                {tx.is_voided && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUnvoid(tx)}
                                    className="h-8 px-2"
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExchange(tx)}
                                  className="h-8 px-2"
                                >
                                  <ArrowRightLeft className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

       </div>

    </div>

    <VoidReasonDialog
      open={voidDialogOpen}
      onOpenChange={setVoidDialogOpen}
      onConfirm={handleVoidConfirm}
      transactionId={selectedTransaction?.invoice_no?.toString() || ''}
      transactionTotal={selectedTransaction?.total || 0}
    />
    <PinConfirmationDialog
      open={pinDialogOpen}
      onOpenChange={setPinDialogOpen}
      onConfirm={handlePinConfirm}
    />
    {selectedTransaction && (
      <ExchangeModal
        open={exchangeModalOpen}
        onOpenChange={setExchangeModalOpen}
        transaction={selectedTransaction}
        cashierUserCode={1}
        companyCode={1}
        storeCode={1}
        terminalId={1}
      />
    )}
    </ManagerLayout>
  );
}
