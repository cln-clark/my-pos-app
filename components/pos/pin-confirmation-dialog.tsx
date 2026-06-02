'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

interface PinConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (pin: string) => void;
  title?: string;
  description?: string;
}

export function PinConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Manager PIN Required",
  description = "Please enter your manager PIN to confirm this action."
}: PinConfirmationDialogProps) {
  const [pin, setPin] = useState('');

  // Auto-submit when PIN reaches 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      handleConfirm();
    }
  }, [pin]);

  const handleConfirm = () => {
    if (pin.length === 4) {
      onConfirm(pin);
      setPin('');
    }
  };

  const handleCancel = () => {
    setPin('');
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full">
              <Input
                type="password"
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(value);
                }}
                onKeyPress={handleKeyPress}
                maxLength={4}
                className="text-center text-2xl tracking-widest h-12"
                autoFocus
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
