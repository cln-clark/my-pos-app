'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePOS } from "@/lib/context";

interface DiscountModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedItemId: string | null;
    discountCodes: Array<{ id: number; name: string; percent: number }>;
}

type DiscountStep = 'select' | 'scpwd-mode' | 'card-info' | 'portioning' | 'regular';

export function DiscountModal({ open, onOpenChange, selectedItemId, discountCodes }: DiscountModalProps) {
    const { cart, setItemDiscountCode, setItemPortioningDiscount, updateDiscountQty } = usePOS();

    const selectedItem = cart.find(item => item.product.id === selectedItemId);
    const currentDiscountId = selectedItem?.discountCode;

    const [step, setStep] = useState<DiscountStep>('select');
    const [selectedDiscountName, setSelectedDiscountName] = useState<string | null>(null);
    const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(null);
    const [totalPortion, setTotalPortion] = useState<string>('');
    const [discountPortion, setDiscountPortion] = useState<string>('');
    const [regularPortionDiscount, setRegularPortionDiscount] = useState<string>('');
    const [regularDiscountPercent, setRegularDiscountPercent] = useState<string>('');
    const [beneficiaryId, setBeneficiaryId] = useState<string>('');
    const [beneficiaryName, setBeneficiaryName] = useState<string>('');

    const handleRemoveDiscount = () => {
        if (selectedItemId) {
            setItemPortioningDiscount(selectedItemId, undefined, undefined, 0, 0, 0);
            onOpenChange(false);
            resetForm();
        }
    };

    const handleSelectDiscount = (discountId: number | null, discountName: string | null) => {
        if (discountName === 'Senior Citizen' || discountName === 'PWD' || discountName === 'Athlete') {
            setSelectedDiscountId(discountId);
            setSelectedDiscountName(discountName);
            setStep('card-info');
        } else if (discountName === 'Regular') {
            setSelectedDiscountId(discountId);
            setSelectedDiscountName(discountName);
            setStep('regular');
        } else {
            handleRemoveDiscount();
        }
    };

    const handleCardInfoSubmit = () => {
        if (!beneficiaryId.trim() || !beneficiaryName.trim()) {
            alert('Beneficiary ID and Beneficiary Name are required');
            return;
        }
        // Save beneficiary info to the cart item
        if (selectedItemId && selectedItem) {
            updateDiscountQty(selectedItemId, selectedItem.discountQty, beneficiaryId, beneficiaryName);
        }
        if (selectedDiscountName === 'Senior Citizen' || selectedDiscountName === 'PWD') {
            setStep('scpwd-mode');
        } else if (selectedDiscountName === 'Athlete') {
            if (selectedItemId) {
                setItemPortioningDiscount(selectedItemId, selectedDiscountId || undefined, 'per-item', 0, selectedItem?.quantity || 0, 0);
                onOpenChange(false);
                resetForm();
            }
        }
    };

    const handleSCPWDMode = (mode: 'per-item' | 'portioning') => {
        if (mode === 'portioning') {
            setStep('portioning');
        } else {
            if (selectedItemId) {
                setItemPortioningDiscount(selectedItemId, selectedDiscountId || undefined, 'per-item', 0, selectedItem?.quantity || 0, 0);
                onOpenChange(false);
                resetForm();
            }
        }
    };

    const handlePortioningSubmit = () => {
        if (selectedItemId) {
            const totalPortionNum = parseInt(totalPortion) || 0;
            const discountPortionNum = parseInt(discountPortion) || 0;
            const regularPortionDiscountNum = parseFloat(regularPortionDiscount) || 0;

            setItemPortioningDiscount(selectedItemId, selectedDiscountId || undefined, 'portioning', totalPortionNum, discountPortionNum, regularPortionDiscountNum);
            onOpenChange(false);
            resetForm();
        }
    };

    const handleRegularDiscountSubmit = () => {
        if (selectedItemId) {
            setItemPortioningDiscount(selectedItemId, selectedDiscountId || undefined, 'per-item', 0, selectedItem?.quantity || 0, 0);
            onOpenChange(false);
            resetForm();
        }
    };

    const resetForm = () => {
        setStep('select');
        setSelectedDiscountName(null);
        setSelectedDiscountId(null);
        setTotalPortion('');
        setDiscountPortion('');
        setRegularPortionDiscount('');
        setRegularDiscountPercent('');
        setBeneficiaryId('');
        setBeneficiaryName('');
    };

    const handleCancel = () => {
        onOpenChange(false);
        resetForm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {step === 'select' && 'Select Discount'}
                        {step === 'card-info' && 'Card Information'}
                        {step === 'scpwd-mode' && 'SC/PWD Discount Mode'}
                        {step === 'portioning' && 'Portioning Discount'}
                        {step === 'regular' && 'Regular'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-6">
                    {!selectedItem ? (
                        <p className="text-base text-muted-foreground text-center py-8">
                            Please select an item first
                        </p>
                    ) : (
                        <>
                            <div className="p-3 bg-slate-50 rounded-lg border mb-4">
                                <p className="font-semibold text-base">{selectedItem.product.name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {selectedItem.quantity} | Price: ₱{selectedItem.product.price.toFixed(2)}</p>
                            </div>

                            {step === 'select' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={handleRemoveDiscount}
                                        disabled={!currentDiscountId}
                                        className="h-14 text-lg font-semibold active:scale-95 transition-transform"
                                    >
                                        Remove Discount
                                    </Button>
                                    {discountCodes.map((discount) => (
                                        <Button
                                            key={discount.id}
                                            variant={currentDiscountId === discount.id ? "default" : "outline"}
                                            size="lg"
                                            onClick={() => handleSelectDiscount(discount.id, discount.name)}
                                            className="h-14 text-lg font-semibold active:scale-95 transition-transform"
                                        >
                                            {discount.name} ({discount.percent}%)
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {step === 'card-info' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Beneficiary ID</label>
                                        <Input
                                            type="text"
                                            value={beneficiaryId}
                                            onChange={(e) => setBeneficiaryId(e.target.value)}
                                            placeholder="Enter beneficiary ID"
                                            className="h-12 text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Beneficiary Name</label>
                                        <Input
                                            type="text"
                                            value={beneficiaryName}
                                            onChange={(e) => setBeneficiaryName(e.target.value.replace(/[^a-zA-Z\s\-']/g, '').toUpperCase())}
                                            placeholder="Enter beneficiary name"
                                            className="h-12 text-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 'scpwd-mode' && (
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => handleSCPWDMode('per-item')}
                                        className="h-14 text-lg font-semibold active:scale-95 transition-transform"
                                    >
                                        Per Item Discount
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => handleSCPWDMode('portioning')}
                                        className="h-14 text-lg font-semibold active:scale-95 transition-transform"
                                    >
                                        Per Item Portion
                                    </Button>
                                </div>
                            )}

                            {step === 'portioning' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Total Portion</label>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            value={totalPortion}
                                            onChange={(e) => setTotalPortion(e.target.value)}
                                            placeholder="Enter total portion"
                                            className="h-12 text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Discount Portion (SC/PWD IDs)</label>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            value={discountPortion}
                                            onChange={(e) => setDiscountPortion(e.target.value)}
                                            placeholder="Enter discount portion"
                                            className="h-12 text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Regular Portion Discount (%)</label>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            value={regularPortionDiscount}
                                            onChange={(e) => setRegularPortionDiscount(e.target.value)}
                                            placeholder="Enter discount %"
                                            className="h-12 text-lg"
                                        />
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-blue-800">
                                            <strong>Regular Portion:</strong> {(parseInt(totalPortion) || 0) - (parseInt(discountPortion) || 0)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {step === 'regular' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Discount Percent (%)</label>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            value={regularDiscountPercent}
                                            onChange={(e) => setRegularDiscountPercent(e.target.value)}
                                            placeholder="Enter discount %"
                                            className="h-12 text-lg"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <DialogFooter>
                    {step !== 'select' && (
                        <Button
                            variant="outline"
                            onClick={() => setStep('select')}
                            className="h-12 px-8 text-base font-semibold active:scale-95 transition-transform"
                        >
                            Back
                        </Button>
                    )}
                    {step === 'card-info' && (
                        <Button
                            onClick={handleCardInfoSubmit}
                            className="h-12 px-8 text-base font-semibold active:scale-95 transition-transform"
                        >
                            Next
                        </Button>
                    )}
                    {step === 'portioning' && (
                        <Button
                            onClick={handlePortioningSubmit}
                            className="h-12 px-8 text-base font-semibold active:scale-95 transition-transform"
                        >
                            Apply
                        </Button>
                    )}
                    {step === 'regular' && (
                        <Button
                            onClick={handleRegularDiscountSubmit}
                            className="h-12 px-8 text-base font-semibold active:scale-95 transition-transform"
                        >
                            Apply
                        </Button>
                    )}
                    <Button
                        onClick={handleCancel}
                        className="h-12 px-8 text-base font-semibold active:scale-95 transition-transform"
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
