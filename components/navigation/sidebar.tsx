'use client'

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { usePOS } from "@/lib/context";
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Menu, X, ShoppingCart, Package, LogOut, BarChart3 } from 'lucide-react';

export function Sidebar() {

    const [ isOpen, setIsOpen ] = useState(false);
    const router = useRouter();
    const { currentUser, logout } = usePOS();
    const pathname = usePathname();
    
    const handleLogout = () => {
        logout();
        router.push('/');
    }

    if(!currentUser) {
        return null;
    }

    const menuItems = [
    {
      label: 'Cashier',
      href: '/cashier',
      icon: ShoppingCart,
    },
    ...(currentUser.role === 'manager'
      ? [
          {
            label: 'Inventory',
            href: '/inventory',
            icon: Package,
          },
          {
            label: 'Analytics',
            href: '/analytics',
            icon: BarChart3,
          },
        ]
      : []),
  ];


 return (
    <>
        {/* Mobile Menu Button */}
        <div className='md:hidden fixed top-4 left-4 z-50'>
            <Button variant="outline"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
            >
                        { isOpen ? <X className='w-4 h-4' /> : <Menu className='w-4 h-4' /> }
            </Button>
        </div>

        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white p-6 transform transition-transform duration-300
                        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                        md:translate-x-0 md:relative md:h-auto z-40`}
        >
            <div className='flex flex-col h-full'>
                {/* Logo */}
                <div className="mb-8 pt-8 md:pt-0">
                    <h1 className="text-2xl font-bold">RetailPOS</h1>
                    <p className="text-sm text-slate-400">Point of Sale</p>
                </div>

                {/* User Info */}
                <div className="bg-slate-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-slate-400">Logged in as</p>
                    <p className="font-semibold text-white">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
                </div>

                <nav className='flex-1 space-y-2'>
                    { menuItems.map((item) => {
                        const Icon = item.icon; 
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors 
                                            ${ isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}
                                `}>
                                <Icon className='w-4 h-4' />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <Button variant="outline"
                        onClick={ handleLogout}
                        className='w-full mt-auto text-black border-slate-600 hover:text-white hover:bg-slate-800'
                >
                    <LogOut className='h-4 w-4 mr-2'></LogOut>
                    Logout
                </Button>

            </div>
            
        </aside>

        {/* Mobile Overlay */}
        {isOpen && (
            <div
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
            onClick={() => setIsOpen(false)}
            />
        )}

    
    </>

 );


   


}