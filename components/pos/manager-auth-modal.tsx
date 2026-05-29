'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ManagerAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: (managerId: string) => void;
}

export function ManagerAuthModal({ open, onOpenChange, onAuthSuccess }: ManagerAuthModalProps) {
  const [pin, setPin] = useState('');

  const handleSubmit = () => {
    if (pin.length === 4) {
      onAuthSuccess(pin);
      setPin('');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setPin('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Manager/Supervisor Override</DialogTitle>
          <DialogDescription>
            Enter manager PIN to access override functions
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="Enter 4-digit PIN"
            className="text-center text-2xl tracking-widest h-16"
            maxLength={4}
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={pin.length !== 4}
            className="flex-1 h-12"
          >
            Authenticate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
