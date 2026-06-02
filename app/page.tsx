    'use client';

    import React, { useState, useEffect } from 'react';
    import { usePOS } from "@/lib/context";
    import { useRouter } from 'next/navigation';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
    import { Alert, AlertAction,AlertDescription, AlertTitle } from "@/components/ui/alert"
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { AlertCircle } from 'lucide-react';
    import { Numpad } from '@/components/ui/numpad';

    export default function LoginPage() {
      
      const router = useRouter();
      const [error, setError] = useState<string>('');
      const [userId, setUserId] = useState<string>('');
      const [pin, setPin] = useState<string>('');
      const {login} = usePOS();
      const [loading, setLoading] = useState<boolean>(false);
      const [currentTime, setCurrentTime] = useState<Date>(new Date());

      useEffect(() => {
        const timer = setInterval(() => {
          setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
      }, []);

      const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if(!userId || !pin) {
          setError('Please enter User ID and PIN');
          setLoading(false);
          return;
        }

        const success = await login(parseInt(userId), pin);

        if(success) {
          router.push('/cashier');
        } else {
          setError('Invalid User ID or PIN. Please try again.');
          setPin('');
        }

        setLoading(false);

      };

      const handlePinPadClick = (value: string) => {
        if (pin.length < 4) {
          setPin(pin + value);
        }
      };

      // Auto-submit when PIN reaches 4 digits
      useEffect(() => {
        if (pin.length === 4 && userId) {
          handleLogin(new Event('submit') as any);
        }
      }, [pin, userId]);

      const handleUserIdPadClick = (value: string) => {
        if (userId.length < 10) {
          setUserId(userId + value);
        }
      };

      const handlePinPadClear = () => {
        setPin('');
      };

      const handleUserIdPadClear = () => {
        setUserId('');
      };

      const handlePinPadBackspace = () => {
        setPin(pin.slice(0, -1));
      };

      const handleUserIdPadBackspace = () => {
        setUserId(userId.slice(0, -1));
      };


    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-10 bg-muted/40 relative">
        <div className="absolute top-4 left-4 text-sm text-muted-foreground" suppressHydrationWarning>
          {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          <br />
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
        </div>
        <div className="flex w-full max-w-6xl flex-col lg:flex-row gap-6">
          {/* Login Form - Left Side */}
          <Card className="flex-1">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-4xl font-bold">FASTPOS</CardTitle>
              <CardDescription className="text-base">Point of Sale System</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                { error && (
                <Alert variant="destructive">
                  <AlertCircle className='w-5 h-5'></AlertCircle>
                  <AlertDescription className="text-base">{error}</AlertDescription>
                </Alert>
                )}

                <div className='space-y-3'>
                  <label htmlFor="userId" className='text-base font-semibold'>User ID</label>
                  <Input id="userId"
                        type="text"
                        placeholder='Enter User ID'
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        maxLength={10}
                        className="mt-2 h-14 text-lg text-center [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                </div>

                <div className='space-y-3'>
                  <label htmlFor="pin" className='text-base font-semibold'>Enter PIN</label>
                  <Input id="pin"
                        type="password"
                        placeholder='Enter PIN'
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        className="mt-2 h-14 text-lg text-center [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                </div>

              </form>
            </CardContent>
          </Card>

          {/* PIN Pad - Right Side */}
          <Numpad
            onDigitClick={handlePinPadClick}
            onClear={handlePinPadClear}
            onBackspace={handlePinPadBackspace}
            disabled={!userId}
          />
        </div>
      </div>
    );
  }
