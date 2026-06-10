'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductVariationResponse } from "@/lib/types";

interface VariationSelectionModalProps {
    open: boolean;
    onClose: () => void;
    variations: ProductVariationResponse[];
    onSelectVariation: (variation: ProductVariationResponse) => void;
}

export function VariationSelectionModal({ open, onClose, variations, onSelectVariation }: VariationSelectionModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Select Size</DialogTitle>
                    <DialogDescription>
                        Choose a size for this product
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-3 py-4">
                    {variations.map((variation) => (
                        <Button
                            key={variation.id}
                            variant="outline"
                            className="h-16 text-lg font-semibold"
                            onClick={() => onSelectVariation(variation)}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <span>{variation.name}</span>
                                <span className="text-sm font-normal text-muted-foreground">₱{variation.price.toFixed(2)}</span>
                            </div>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
