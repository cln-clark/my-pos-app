'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertCircle } from "lucide-react";

interface DayStartOverlayProps {
    open: boolean;
    onClose: () => void;
}

export function DayStartOverlay({ open, onClose }: DayStartOverlayProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if (!open) return;

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, [open]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
            <div className="bg-white rounded-md shadow-2xl p-12 max-w-md w-full mx-4 text-center">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
                        <Calendar className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Day Started</h1>
                    <p className="text-gray-600">Please verify the current date and time before starting transactions</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 mb-6 space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <p className="text-2xl font-semibold text-gray-900">{formatDate(currentTime)}</p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        <p className="text-2xl font-semibold text-gray-900">{formatTime(currentTime)}</p>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 text-left">
                        If the date or time shown above is incorrect, please contact technical support immediately before proceeding with transactions.
                    </p>
                </div>

                <Button
                    onClick={onClose}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-lg font-semibold"
                >
                    Start Transactions
                </Button>
            </div>
        </div>
    );
}
