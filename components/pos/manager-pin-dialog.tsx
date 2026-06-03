'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle } from "lucide-react";
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';

interface ManagerPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (manager: any) => void;
}

export function ManagerPinDialog({ open, onOpenChange, onSuccess }: ManagerPinDialogProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-submit when PIN reaches 4 digits
  useEffect(() => {
    if (pin.length === 4 && !loading) {
      handleConfirm();
    }
  }, [pin]);

  const handleConfirm = async () => {
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate PIN (assuming role_id 2 is manager)
      const users = await invoke<any[]>('get_users');
      const manager = users.find((u: any) => u.role_id === 2 && u.pin === pin);

      if (!manager) {
        setError('Invalid manager PIN');
        setPin('');
        setLoading(false);
        return;
      }

      // PIN is valid
      toast.success('Manager access granted');
      onSuccess(manager);
      setPin('');
      setError('');
    } catch (err) {
      setError('Failed to validate PIN. Please try again.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPin('');
    setError('');
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
    if (error) setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Manager Access
          </DialogTitle>
          <DialogDescription>Enter your manager PIN to access back office</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="relative w-full">
            <Input
              type="password"
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChange={handlePinChange}
              onKeyPress={handleKeyPress}
              maxLength={4}
              className="text-center text-2xl tracking-widest h-12"
              autoFocus
              disabled={loading}
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
