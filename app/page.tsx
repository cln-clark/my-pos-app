  'use client';

  import React, { useState } from 'react';
  import { usePOS } from "@/lib/context";
  import { useRouter } from 'next/navigation';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
  import { Alert, AlertAction,AlertDescription, AlertTitle } from "@/components/ui/alert"
  import { Input } from '@/components/ui/input';
  import { Button } from '@/components/ui/button';
  import { MOCK_USERS } from '@/lib/data';
  import { AlertCircle } from 'lucide-react';



  export default function LoginPage() {

      const router = useRouter();
      const [error, setError] = useState<string>('');
      const [selectedUser, setSelectedUser] = useState<string>('');
      const [pin, setPin] = useState<string>('');
      const {login} = usePOS();
      const [loading, setLoading] = useState<boolean>(false);

      const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if(!selectedUser || !pin) {
          setError('Please select username and enter PIN');
          setLoading(false);
          return;
        }

        const success = login(selectedUser, pin);[]

        if(success) {
          router.push('/cashier');
        } else {
          setError('Invalid PIN. Please try again.');
        }

        setLoading(false);

      };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-medium">
      <Card className="bg-white w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="font-bold text-3xl">RetailPOS</CardTitle>
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

            <div className='flex flex-col gap-2'>
              <label htmlFor="user" className='font-bold'>Select Cashier</label>
              <select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"> 
                    <option value="">Choose Cashier...</option>           
                    { MOCK_USERS.filter((user) => user.role === 'cashier' || user.role === 'manager')
                                .map((user) => (
                                    <option key={user.id} value={user.id}>
                                      {user.name} ({user.role})
                                    </option>
                    ))}                                   
              </select>
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor="pin" className='font-bold'>Enter PIN</label>
              <Input id="pin"
                     type="password" 
                     placeholder='Enter PIN'
                     value={pin}
                     onChange={(e) => setPin(e.target.value)}
                     maxLength={4}
                     className="[&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
              />
            </div>

            <Button type="submit" disabled={loading} className='w-full'>
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="mt-6 pt-6 border-t space-y-2">
              <p className="text-sm font-semibold text-foreground">Demo Credentials:</p>
              {MOCK_USERS.filter((u) => u.role === 'cashier' || u.role === 'manager').map((user) => (
                <p key={user.id} className="text-xs text-muted-foreground">
                  {user.name}: PIN <span className="font-mono font-bold">{user.pin}</span>
                </p>
              ))}
            </div>

          </form>
        </CardContent>
        

      </Card>
      
    </div>
  );
}
