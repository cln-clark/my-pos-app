"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type PaymentMethod = 'card' | 'cash'

interface PaymentMethodSelectorProps {
    selectedMethod: PaymentMethod
    onMethodChange: (method: PaymentMethod) => void
}

export function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-semibold">Payment Method</CardTitle>
                <CardDescription>Select payment method</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        type="button"
                        variant={selectedMethod === 'card' ? 'default' : 'outline'}
                        onClick={() => onMethodChange('card')}
                        className="h-20"
                    >
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">💳</span>
                            <span className="font-semibold">Card</span>
                        </div>
                    </Button>
                    <Button
                        type="button"
                        variant={selectedMethod === 'cash' ? 'default' : 'outline'}
                        onClick={() => onMethodChange('cash')}
                        className="h-20"
                    >
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">💵</span>
                            <span className="font-semibold">Cash</span>
                        </div>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
