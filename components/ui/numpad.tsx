"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface NumpadProps {
    onDigitClick: (digit: string) => void
    onClear: () => void
    onBackspace: () => void
    title?: string
    description?: string
    disabled?: boolean
}

export function Numpad({
    onDigitClick,
    onClear,
    onBackspace,
    title = "PIN Pad",
    description = "Enter PIN using touch screen",
    disabled = false
}: NumpadProps) {
    return (
        <Card className="flex-1">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <Button
                            key={num}
                            type="button"
                            variant="outline"
                            className="h-16 text-2xl font-bold"
                            onClick={() => onDigitClick(num.toString())}
                            disabled={disabled}
                        >
                            {num}
                        </Button>
                    ))}
                    <Button
                        type="button"
                        variant="destructive"
                        className="h-16 text-lg font-bold"
                        onClick={onClear}
                        disabled={disabled}
                    >
                        Clear
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-16 text-2xl font-bold"
                        onClick={() => onDigitClick('0')}
                        disabled={disabled}
                    >
                        0
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-16 text-lg font-bold"
                        onClick={onBackspace}
                        disabled={disabled}
                    >
                        ⌫
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
