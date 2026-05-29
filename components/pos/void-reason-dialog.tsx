'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VoidReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  transactionId: string;
  transactionTotal: number;
}

const VOID_REASONS = [
  'Wrong item',
  'Customer request',
  'System error',
  'Price correction',
  'Duplicate transaction',
  'Other',
];

export function VoidReasonDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  transactionId,
  transactionTotal 
}: VoidReasonDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [otherReason, setOtherReason] = useState<string>('');

  const handleConfirm = () => {
    const reason = selectedReason === 'Other' ? otherReason : selectedReason;
    if (reason.trim()) {
      onConfirm(reason);
      setSelectedReason('');
      setOtherReason('');
    }
  };

  const handleCancel = () => {
    setSelectedReason('');
    setOtherReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Void Transaction #{transactionId}</DialogTitle>
          <DialogDescription>
            Select a reason for voiding this transaction. Total: ₱{transactionTotal.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason for void:</label>
            <div className="grid grid-cols-2 gap-2">
              {VOID_REASONS.map((reason) => (
                <Button
                  key={reason}
                  type="button"
                  variant={selectedReason === reason ? "default" : "outline"}
                  onClick={() => setSelectedReason(reason)}
                  className="h-12"
                >
                  {reason}
                </Button>
              ))}
            </div>
          </div>
          {selectedReason === 'Other' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Please specify:</label>
              <input
                type="text"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full h-12 px-3 rounded-md border border-input bg-background"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedReason || (selectedReason === 'Other' && !otherReason.trim())}
            variant="destructive"
          >
            Confirm Void
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
