'use client';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface DiscountCode {
  id: number;
  name: string;
  percent: number;
}

interface DiscountSelectorProps {
  discountCodes: DiscountCode[];
  selectedDiscount: number | null;
  onSelectDiscount: (discountId: number | null) => void;
}

export function DiscountSelector({ discountCodes, selectedDiscount, onSelectDiscount }: DiscountSelectorProps) {
  return (
    <Card className="mb-3">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Discount</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedDiscount === null ? "default" : "outline"}
            size="default"
            onClick={() => onSelectDiscount(null)}
            className="flex-1 h-10 text-sm active:scale-95 transition-transform"
          >
            No Discount
          </Button>
          {discountCodes.map((discount) => (
            <Button
              key={discount.id}
              variant={selectedDiscount === discount.id ? "default" : "outline"}
              size="default"
              onClick={() => onSelectDiscount(discount.id)}
              className="flex-1 h-10 text-sm active:scale-95 transition-transform"
            >
              {discount.name} ({discount.percent}%)
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
