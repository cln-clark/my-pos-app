'use client';

import { Sidebar } from "@/components/navigation/sidebar";
import { usePOS } from "@/lib/context";



export function AppLayout({ children }: { children: React.ReactNode }) {
    
    const { currentUser } = usePOS();

    if (!currentUser) {
        return <>{children}</>;
    }
    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 h-full bg-gray-50 p-6 overflow-auto">
                {children}
            </main>
        </div>
    );

}