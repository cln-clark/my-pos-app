    'use client';

    import React, { useState, useEffect } from 'react';
    import { usePOS } from "@/lib/context";
    import { useRouter } from 'next/navigation';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
    import { Alert, AlertAction,AlertDescription, AlertTitle } from "@/components/ui/alert"
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import {
      Select,
      SelectContent,
      SelectGroup,
      SelectItem,
      SelectLabel,
      SelectTrigger,
      SelectValue,
    } from "@/components/ui/select"
    import { getUsers } from '@/lib/data';
    import { AlertCircle } from 'lucide-react';
    import { User } from '@/lib/types';
    import { Numpad } from '@/components/ui/numpad';

    export default function LoginPage() {
      
      const router = useRouter();
      const [error, setError] = useState<string>('');
      const [selectedUser, setSelectedUser] = useState<string>('');
      const [pin, setPin] = useState<string>('');
      const {login} = usePOS();
      const [loading, setLoading] = useState<boolean>(false);
      const [users, setUsers] = useState<User[]>([]);
 
      useEffect(() => {
        getUsers().then(setUsers);
      }, []);

      const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if(!selectedUser || !pin) {
          setError('Please select username and enter PIN');
          setLoading(false);
          return;
        }

        const success = await login(parseInt(selectedUser), pin);

        if(success) {
          router.push('/cashier');
        } else {
          setError('Invalid PIN. Please try again.');
        }

        setLoading(false);

      };

      const handlePinPadClick = (value: string) => {
        if (pin.length < 4) {
          setPin(pin + value);
        }
      };

      const handlePinPadClear = () => {
        setPin('');
      };

      const handlePinPadBackspace = () => {
        setPin(pin.slice(0, -1));
      };


    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-10 bg-muted/40">
        <div className="flex w-full max-w-6xl flex-col lg:flex-row gap-6">
          {/* Login Form - Left Side */}
          <Card className="flex-1">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold">POS</CardTitle>
              <CardDescription>Point of Sale System</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                { error && (
                <Alert variant="destructive">
                  <AlertCircle className='w-4 h-4'></AlertCircle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                )}

                <div className='space-y-2'>
                  <label htmlFor="user" className='text-sm font-medium'>Select Cashier</label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger className="flex mt-2 h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <SelectValue placeholder="Select Cashier" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectGroup>
                        <SelectLabel>Select Cashier</SelectLabel>
                        { users.filter((user) => user.role.id === 1 || user.role.id === 2)
                                .map((user) => (
                                <SelectItem key={user.id} 
                                            value={user.id.toString()}
                                            className="w-full cursor-pointer">
                                  {user.name}
                                </SelectItem>
                        ))}
                      </SelectGroup>

                    </SelectContent>
                  </Select>
                  
                </div>

                <div className='space-y-2'>
                  <label htmlFor="pin" className='text-sm rounded-lg font-medium'>Enter PIN</label>
                  <Input id="pin"
                        type="password"
                        placeholder='Enter PIN'
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        maxLength={4}
                        className="mt-2 h-12 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                </div>

                <Button type="submit" disabled={loading} className='h-16 w-full text-base tracking-wider font-bold md:text-lg'>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>

              </form>
            </CardContent>
          </Card>

          {/* PIN Pad - Right Side */}
          <Numpad
            onDigitClick={handlePinPadClick}
            onClear={handlePinPadClear}
            onBackspace={handlePinPadBackspace}
            disabled={!selectedUser}
          />
        </div>
      </div>
    );
  }
