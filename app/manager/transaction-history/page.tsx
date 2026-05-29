'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Filter, Calendar, User, CreditCard, DollarSign, Shield, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { VoidReasonDialog } from "@/components/pos/void-reason-dialog";
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import { generateVoidReceiptText } from "@/lib/receipt";
import { usePOS } from "@/lib/context";

interface TransactionHistoryProps {
  // TODO: Pass transactions from context or fetch from backend
}

export default function TransactionHistoryPage() {
  const router = useRouter();
  const { managerAuth, setManagerAuth } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCashier, setFilterCashier] = useState('');
  const [filterVoidStatus, setFilterVoidStatus] = useState<'all' | 'voided' | 'active'>('all');
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const businessDate = filterDate || now.toLocaleDateString('en-US');
      const data = await invoke<any[]>('get_transaction_history', {
        companyCode: 1,
        storeCode: 1,
        terminalId: 1,
        businessDate,
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

  const handleBack = () => {
    router.push('/cashier');
  };

  const handleVoidTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setVoidDialogOpen(true);
  };

  const handleVoidConfirm = async (reason: string) => {
    if (selectedTransaction) {
      try {
        // Call backend void command
        const voidTxnNo = await invoke<number>('void_transaction', {
          originalTransactionNo: selectedTransaction.transaction_no,
          voidedByUserCode: managerAuth?.id.toString() || 'MANAGER',
          voidReason: reason,
          companyCode: 1,
          storeCode: 1,
          terminalId: 1,
          businessDate: new Date().toISOString().split('T')[0],
        });

        // Generate void receipt
        const voidReceipt = generateVoidReceiptText({
          originalTransactionNo: selectedTransaction.transaction_no.toString(),
          voidTransactionNo: voidTxnNo.toString(),
          timestamp: new Date(),
          voidedBy: managerAuth?.name || 'MANAGER',
          voidReason: reason,
          originalTotal: selectedTransaction.amount,
          originalPaymentMethod: selectedTransaction.payment_type === 1 ? 'cash' : 'card',
          originalInvoiceNo: selectedTransaction.invoice_number.toString(),
        });

        // Print void receipt (TODO: Integrate with printer)
        console.log('Void Receipt:', voidReceipt);

        toast.success(`Transaction voided successfully. Void TX #${voidTxnNo}`);
        setVoidDialogOpen(false);
        setSelectedTransaction(null);
        fetchTransactions(); // Refresh transaction list
      } catch (error) {
        toast.error('Failed to void transaction: ' + error);
      }
    }
  };

  const filteredTransactions = transactions.filter((tx: any) => {
    const matchesSearch = tx.transaction_no.toString().includes(searchQuery) || tx.cashier_user_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCashier = !filterCashier || tx.cashier_user_code.toLowerCase().includes(filterCashier.toLowerCase());
    const matchesVoidStatus = filterVoidStatus === 'all' ||
      (filterVoidStatus === 'voided' && tx.transaction_type === 'VOID') ||
      (filterVoidStatus === 'active' && tx.transaction_type === 'SALE');

    return matchesSearch && matchesCashier && matchesVoidStatus;
  });

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="h-10 px-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Transaction History</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {managerAuth ? `Manager: ${managerAuth.name}` : 'Manager Mode'}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={fetchTransactions}
          disabled={loading}
          className="h-10 px-4"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold mt-1">{transactions.length}</p>
              </div>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sales</p>
                <p className="text-2xl font-bold mt-1">
                  {transactions.filter((t: any) => t.transaction_type === 'SALE').length}
                </p>
              </div>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Voided</p>
                <p className="text-2xl font-bold mt-1">
                  {transactions.filter((t: any) => t.transaction_type === 'VOID').length}
                </p>
              </div>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold mt-1">
                  ₱{transactions
                    .filter((t: any) => t.transaction_type === 'SALE')
                    .reduce((sum: number, t: any) => sum + t.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shrink-0">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID or cashier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-40 h-10 pl-10"
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by cashier..."
                value={filterCashier}
                onChange={(e) => setFilterCashier(e.target.value)}
                className="w-48 h-10 pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={filterVoidStatus}
                onChange={(e) => setFilterVoidStatus(e.target.value as 'all' | 'voided' | 'active')}
                className="h-10 pl-10 pr-8 rounded-md border border-input bg-background"
              >
                <option value="all">All Transactions</option>
                <option value="active">Active Only</option>
                <option value="voided">Voided Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card className="flex-1 min-h-0">
        <CardHeader className="shrink-0 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <span className="text-sm text-muted-foreground">
              Showing {filteredTransactions.length} of {transactions.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          <div className="divide-y">
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
              filteredTransactions.map((tx: any) => (
                <div
                  key={tx.transaction_no}
                  className={`p-4 flex items-center justify-between hover:bg-slate-50 ${
                    tx.transaction_type === 'VOID' ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">#{tx.transaction_no}</span>
                      {tx.transaction_type === 'VOID' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                          VOIDED
                        </span>
                      )}
                      {tx.transaction_type === 'SALE' && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{tx.date_stamp}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{tx.cashier_user_code}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        <span>{tx.payment_type === 1 ? 'CASH' : 'CARD'}</span>
                      </div>
                    </div>
                    {tx.void_tx_num && tx.void_tx_num !== 0 && (
                      <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Voided transaction #{tx.void_tx_num}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        ₱{Math.abs(tx.amount).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        INV #{tx.invoice_number}
                      </div>
                    </div>
                    {tx.transaction_type === 'SALE' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleVoidTransaction(tx)}
                        className="h-9"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Void
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Void Reason Dialog */}
      {selectedTransaction && (
        <VoidReasonDialog
          open={voidDialogOpen}
          onOpenChange={setVoidDialogOpen}
          onConfirm={handleVoidConfirm}
          transactionId={selectedTransaction.id}
          transactionTotal={selectedTransaction.total}
        />
      )}
    </div>
  );
}
