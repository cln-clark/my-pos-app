'use client';

import { AppLayout } from "@/components/layout/app-layout";
import { CartPanel } from "@/components/pos/cart";
import { ProductGrid} from "@/components/pos/product-grid";
import { Button } from "@/components/ui/button";
import { usePOS} from "@/lib/context";

export default function CashierPage() {

    const {currentUser, cart } = usePOS();

    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">New Transaction</h1>
                    <p className="text-muted-foreground">Welcome, {currentUser?.name}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Products Section */}
                    <div className="lg:col-span-2">
                        <ProductGrid/>
                    </div>

                    {/* Order Section */}
                    <div className="lg:col-span-1">
                        <div className="flex flex-col h-full gap-4">
                            <CartPanel/>
                            {/* Checkout Button */}                          
                            <Button onClick={() => setPaymentOpen(true)}
                                    disabled={cart.length === 0}
                                    size="lg"
                                    className="w-full bg-blue-600 hover:bg-blue-700">

                            </Button>
                        </div>
                    </div>


                </div>

            </div>

        </AppLayout>
    );
}