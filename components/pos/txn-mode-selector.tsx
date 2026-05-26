"use client"

import { Button } from "@/components/ui/button"

export type TxnMode = 'dine-in' | 'takeout'

interface TxnModeSelectorProps {
    selectedMode: TxnMode
    onModeChange: (mode: TxnMode) => void
}

export function TxnModeSelector({ selectedMode, onModeChange }: TxnModeSelectorProps) {
    return (
        <div className="flex gap-2">
            <Button
                type="button"
                variant={selectedMode === 'dine-in' ? 'default' : 'outline'}
                size="default"
                onClick={() => onModeChange('dine-in')}
                className="flex-1 h-10 text-sm font-medium active:scale-95 transition-transform"
            >
                Dine In
            </Button>
            <Button
                type="button"
                variant={selectedMode === 'takeout' ? 'default' : 'outline'}
                size="default"
                onClick={() => onModeChange('takeout')}
                className="flex-1 h-10 text-sm font-medium active:scale-95 transition-transform"
            >
                Takeout
            </Button>
        </div>
    )
}
