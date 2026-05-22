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
                size="sm"
                onClick={() => onModeChange('dine-in')}
                className="flex-1"
            >
                Dine In
            </Button>
            <Button
                type="button"
                variant={selectedMode === 'takeout' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onModeChange('takeout')}
                className="flex-1"
            >
                Takeout
            </Button>
        </div>
    )
}
