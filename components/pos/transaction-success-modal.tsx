'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface TransactionSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  total: number;
  paymentMethod: string;
}

export function TransactionSuccessModal({ 
  open, 
  onOpenChange, 
  transactionId, 
  total, 
  paymentMethod 
}: TransactionSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            <DialogTitle className="text-2xl text-center">Transaction Complete</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-medium">{transactionId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="font-medium capitalize">{paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground font-medium">Total:</span>
              <span className="font-bold text-lg text-blue-600">₱{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full h-12 text-base"
          >
            New Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
