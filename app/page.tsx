'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ShoppingCart, Settings, ArrowLeft } from 'lucide-react';
import { ManagerPinDialog } from "@/components/pos/manager-pin-dialog";
import { usePOS } from "@/lib/context";

export default function MainPage() {
  const router = useRouter();
  const { setManagerAuth } = usePOS();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [pinDialogOpen, setPinDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSalesClick = () => {
    router.push('/login?from=main');
  };

  const handleBackOfficeClick = () => {
    setPinDialogOpen(true);
  };

  const handlePinSuccess = (manager: any) => {
    setManagerAuth(manager, 'main');
    setPinDialogOpen(false);
    router.push('/manager');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-10 bg-muted/40 relative">
      <div className="absolute top-4 left-4 text-sm text-muted-foreground" suppressHydrationWarning>
        {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        <br />
        {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
      </div>

      <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold">FASTPOS</h1>
          <p className="text-xl text-muted-foreground">Point of Sale System</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          {/* Sales Card */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            onClick={handleSalesClick}
          >
            <CardHeader className="space-y-4 pb-6">
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center mx-auto">
                <ShoppingCart className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl text-center">Sales</CardTitle>
              <CardDescription className="text-center text-base">
                Process transactions and manage sales
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Back Office Card */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            onClick={handleBackOfficeClick}
          >
            <CardHeader className="space-y-4 pb-6">
              <div className="w-20 h-20 rounded-full bg-purple-500 flex items-center justify-center mx-auto">
                <Settings className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl text-center">Back Office</CardTitle>
              <CardDescription className="text-center text-base">
                Manager access and system administration
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <ManagerPinDialog
        open={pinDialogOpen}
        onOpenChange={setPinDialogOpen}
        onSuccess={handlePinSuccess}
      />
    </div>
  );
}
