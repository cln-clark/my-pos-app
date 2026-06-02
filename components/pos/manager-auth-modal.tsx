'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle } from 'lucide-react';

interface ManagerAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: (managerId: string) => void;
  error?: string;
}

export function ManagerAuthModal({ open, onOpenChange, onAuthSuccess, error: propError }: ManagerAuthModalProps) {

  const [pin, setPin] = useState('');
  const [error, setError] = useState<string>('');

  // Sync error from prop
  useEffect(() => {
    setError(propError || '');
  }, [propError]);

  // Auto-submit when PIN reaches 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      handleSubmit();
    }
  }, [pin]);

  const handleSubmit = () => {
    if (pin.length === 4) {
      onAuthSuccess(pin);
      setPin('');
    }
  };

  const handleCancel = () => {
    setPin('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Manager/Supervisor Override
          </DialogTitle>
          <DialogDescription>
            Enter manager PIN to access override functions
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 font-semibold justify-center">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}
          <Input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="Enter 4-digit PIN"
            className="text-center text-2xl tracking-widest h-16 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
            maxLength={4}
            autoFocus
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
