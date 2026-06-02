'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Receipt, Ban, Printer } from "lucide-react";
import { getTransactionDetails } from '@/lib/data';
import { generateReceiptFromTransaction, TransactionDetailResponse } from "@/lib/receipt";
import { generateReceiptHTML } from "@/lib/utils";
import { toast } from 'sonner';

interface TransactionDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNo: number;
}


export function TransactionDetailDrawer({ open, onOpenChange, invoiceNo }: TransactionDetailDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState<TransactionDetailResponse | null>(null);

  useEffect(() => {
    if (open && invoiceNo) {
      fetchTransactionDetails();
    }
  }, [open, invoiceNo]);

  const fetchTransactionDetails = async () => {
    setLoading(true);
    try {
      const data = await getTransactionDetails(invoiceNo) as TransactionDetailResponse;
      setTransaction(data);
    } catch (error) {
      toast.error('Failed to fetch transaction details: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleReprintReceipt = () => {
    if (!transaction) return;

    const receiptText = generateReceiptFromTransaction(transaction);
    const printContent = generateReceiptHTML(receiptText);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div className="relative z-50 h-full w-[600px] bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Transaction Details</h2>
          </div>
          <div className="flex items-center gap-2">
            {transaction && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReprintReceipt}
                className="h-8"
              >
                <Printer className="h-4 w-4 mr-2" />
                Reprint
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : !transaction ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">No transaction data</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Void Header */}
              {transaction.is_voided && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                    <Ban className="h-4 w-4" />
                    <span>VOIDED TRANSACTION</span>
                  </div>
                  <div className="text-sm text-red-600 space-y-1">
                    <p>Voided By: {transaction.voided_by_name || 'Unknown'}</p>
                    <p>Void Reason: {transaction.void_reason || 'Not specified'}</p>
                    {transaction.void_date && transaction.void_time && (
                      <p>Void Date/Time: {transaction.void_date} {transaction.void_time}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Company Header */}
              <div className="text-center border-b pb-4">
                <h3 className="text-xl font-bold">FASTPOS</h3>
                <p className="text-sm text-muted-foreground">Point of Sale System</p>
                <p className="text-sm text-muted-foreground">Chino Roces Ave, Makati City, Metro Manila</p>
              </div>

              {/* Transaction Info */}
              <div className="border-b pb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice No:</span>
                  <span className="font-medium">{transaction.invoice_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction No:</span>
                  <span className="font-medium">{transaction.transaction_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{transaction.transaction_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span>{transaction.transaction_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cashier:</span>
                  <span>{transaction.cashier_name}</span>
                </div>
              </div>

              {/* Items */}
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3">Items</h4>
                <div className="space-y-2">
                  {transaction.items.map((item, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.product_name}</span>
                        <span>₱{item.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="text-muted-foreground text-xs flex justify-between">
                        <span>{item.quantity} x ₱{item.unit_price.toFixed(2)}</span>
                        <span>SKU: {item.sku}</span>
                      </div>
                      {item.discount_description && item.discount_amount > 0 && (
                        <div className="text-xs text-red-600">
                          Disc: {item.discount_description} (-₱{item.discount_amount.toFixed(2)})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* VAT Breakdown */}
              <div className="border-b pb-4 space-y-2 text-sm">
                <h4 className="font-semibold mb-2">VAT Breakdown</h4>
                {transaction.vatable_sales > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vatable Sales:</span>
                    <span>₱{transaction.vatable_sales.toFixed(2)}</span>
                  </div>
                )}
                {transaction.vat_exempt_sales > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT Exempt Sales:</span>
                    <span>₱{transaction.vat_exempt_sales.toFixed(2)}</span>
                  </div>
                )}
                {transaction.less_vat > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Less VAT:</span>
                    <span>₱{transaction.less_vat.toFixed(2)}</span>
                  </div>
                )}
                {transaction.vat_amount_12_pct > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT (12%):</span>
                    <span>₱{transaction.vat_amount_12_pct.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Discount Breakdown */}
              {(transaction.senior_discount_amount > 0 ||
                transaction.pwd_discount_amount > 0 ||
                transaction.athlete_discount_amount > 0 ||
                transaction.regular_discount_amount > 0) && (
                <div className="border-b pb-4 space-y-2 text-sm">
                  <h4 className="font-semibold mb-2">Discounts</h4>
                  {transaction.senior_discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Senior Discount:</span>
                      <span>₱{transaction.senior_discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {transaction.pwd_discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PWD Discount:</span>
                      <span>₱{transaction.pwd_discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {transaction.athlete_discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Athlete Discount:</span>
                      <span>₱{transaction.athlete_discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {transaction.regular_discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Regular Discount:</span>
                      <span>₱{transaction.regular_discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Summary */}
              <div className="border-b pb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>₱{transaction.subtotal.toFixed(2)}</span>
                </div>
                {transaction.gross_sales > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Sales:</span>
                    <span>₱{transaction.gross_sales.toFixed(2)}</span>
                  </div>
                )}
                {transaction.net_sales > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Sales:</span>
                    <span>₱{transaction.net_sales.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>TOTAL:</span>
                  <span>₱{transaction.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{transaction.payment_method.toUpperCase()}</span>
                </div>
                {transaction.payment_method === 'cash' && transaction.cash_amount_paid !== null && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cash Paid:</span>
                      <span>₱{transaction.cash_amount_paid.toFixed(2)}</span>
                    </div>
                    {transaction.change_given !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Change:</span>
                        <span>₱{transaction.change_given.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
