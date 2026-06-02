'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { CardPaymentData } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CardPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onPaymentComplete: (cardData: CardPaymentData) => void;
}

export function CardPaymentModal({ open, onOpenChange, amount, onPaymentComplete }: CardPaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardType, setCardType] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Generate mock card terminal data
  const generateMockCardData = (): CardPaymentData => {
    // Generate random 6-digit alphanumeric approval code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let approvalCode = '';
    for (let i = 0; i < 6; i++) {
      approvalCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Generate sequential trace no (mock - in real terminal this would be terminal's counter)
    const traceNo = String(Math.floor(Math.random() * 999999)).padStart(6, '0');

    // Generate terminal ref no based on timestamp
    const timestamp = Date.now();
    const terminalRefNo = `TXN-${timestamp}`;

    return {
      cardNumber: cardNumber.slice(-4), // Store only last 4 digits for security
      cardHolderName: cardHolderName.toUpperCase(),
      cardType,
      approvalCode,
      traceNo,
      terminalRefNo,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !cardHolderName || !cardType) {
      return;
    }

    setLoading(true);

    // Simulate card terminal processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const cardData = generateMockCardData();
    toast.success('Payment confirmed');
    onPaymentComplete(cardData);
    
    // Reset form
    setCardNumber('');
    setCardHolderName('');
    setCardType('');
    setLoading(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setCardNumber('');
    setCardHolderName('');
    setCardType('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Card Payment</DialogTitle>
          <DialogDescription>
            Enter card details for payment of ₱{amount.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="cardNumber" className="text-sm font-medium">Card Number (Last 4 Digits)</label>
              <Input
                id="cardNumber"
                placeholder="1234"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="text-center text-lg"
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="cardHolderName" className="text-sm font-medium">Cardholder Name</label>
              <Input
                id="cardHolderName"
                placeholder="JOHN DOE"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value.replace(/[^a-zA-Z\s\-']/g, '').toUpperCase())}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="cardType" className="text-sm font-medium">Card Type</label>
              <Select value={cardType} onValueChange={setCardType} required>
                <SelectTrigger id="cardType">
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VISA">Visa</SelectItem>
                  <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                  <SelectItem value="AMEX">American Express</SelectItem>
                  <SelectItem value="JCB">JCB</SelectItem>
                  <SelectItem value="DISCOVER">Discover</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Spinner size={16} className="mr-2" /> Processing...</> : 'Process Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
