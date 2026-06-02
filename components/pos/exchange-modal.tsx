'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, X, Plus, Minus, Trash2 } from "lucide-react";
import { getTransactionDetails, exchangeTransaction } from '@/lib/data';
import { ExchangeTransactionRequest, TransactionHistoryResponse } from '@/lib/types';
import { TransactionDetailResponse } from '@/lib/receipt';
import { toast } from 'sonner';

interface ExchangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionHistoryResponse;
  cashierUserCode: number;
  companyCode: number;
  storeCode: number;
  terminalId: number;
}

interface ExchangeItem {
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount_description: string | null;
  discount_amount: number;
}

export function ExchangeModal({ open, onOpenChange, transaction, cashierUserCode, companyCode, storeCode, terminalId }: ExchangeModalProps) {
  const [originalItems, setOriginalItems] = useState<ExchangeItem[]>([]);
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && transaction) {
      fetchTransactionDetails();
    }
  }, [open, transaction]);

  const fetchTransactionDetails = async () => {
    setLoading(true);
    try {
      const data = await getTransactionDetails(transaction.invoice_no) as TransactionDetailResponse;
      const items: ExchangeItem[] = data.items.map((item) => ({
        product_name: item.product_name,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        discount_description: item.discount_description,
        discount_amount: item.discount_amount,
      }));
      setOriginalItems(items);
      setExchangeItems(JSON.parse(JSON.stringify(items))); // Deep copy
    } catch (error) {
      toast.error('Failed to fetch transaction details: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...exchangeItems];
    newItems[index].quantity = Math.max(0, newItems[index].quantity + delta);
    newItems[index].subtotal = newItems[index].quantity * newItems[index].unit_price;
    setExchangeItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = exchangeItems.filter((_, i) => i !== index);
    setExchangeItems(newItems);
  };

  const calculateTotal = () => {
    return exchangeItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleExchange = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const businessDate = now.toLocaleDateString('en-US');

      const exchangeData: ExchangeTransactionRequest = {
        original_invoice_no: transaction.invoice_no,
        original_transaction_no: transaction.transaction_no || transaction.invoice_no,
        items: exchangeItems.map(item => ({
          product_name: item.product_name,
          sku: item.sku,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          discount_description: item.discount_description || undefined,
          discount_amount: item.discount_amount,
        })),
        cashier_user_code: cashierUserCode,
        payment_method: transaction.payment_method,
        cash_amount_paid: transaction.cash_amount_paid || undefined,
        company_code: companyCode,
        store_code: storeCode,
        terminal_id: terminalId,
        business_date: businessDate,
      };

      const result = await exchangeTransaction(exchangeData) as { new_invoice_no: number };
      toast.success(`Exchange successful! New Invoice: ${result.new_invoice_no}`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to process exchange: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Exchange Transaction
          </DialogTitle>
          <DialogDescription>
            Invoice #{transaction?.invoice_no} - Modify items for exchange
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading transaction details...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Original Items */}
            <div>
              <h3 className="font-semibold mb-3">Original Items</h3>
              <div className="border rounded-lg p-4 bg-muted/30">
                {originalItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">{item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₱{item.subtotal.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} x ₱{item.unit_price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 font-semibold">
                  <span>Original Total:</span>
                  <span>₱{originalItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Exchange Items */}
            <div>
              <h3 className="font-semibold mb-3">Exchange Items</h3>
              <div className="border rounded-lg p-4">
                {exchangeItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No items</p>
                ) : (
                  exchangeItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">{item.sku}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(index, -1)}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(index, 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="h-8 w-8 ml-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right ml-4 w-24">
                        <p className="font-medium">₱{item.subtotal.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">@ ₱{item.unit_price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
                <div className="flex justify-between items-center pt-3 font-semibold text-lg">
                  <span>Exchange Total:</span>
                  <span>₱{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Price Difference */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Price Difference:</span>
                <span className={`font-bold text-lg ${
                  calculateTotal() > originalItems.reduce((sum, item) => sum + item.subtotal, 0)
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {calculateTotal() > originalItems.reduce((sum, item) => sum + item.subtotal, 0) ? '+' : ''}
                  ₱{(calculateTotal() - originalItems.reduce((sum, item) => sum + item.subtotal, 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExchange} disabled={loading || exchangeItems.length === 0}>
            Process Exchange
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
