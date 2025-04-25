import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart } from 'lucide-react';

export function ProductSelection({ products, updateInventory, setCart }) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (product && product.quantity >= quantity) {
      setCart(prevCart => [...prevCart, { ...product, quantity, description: '' }]);
      updateInventory(product.id, quantity);
      setSelectedProduct('');
      setQuantity(1);
    }
  };

  return (
    <Card className=" shadow-lg rounded-lg overflow-hidden">
      <CardHeader className=" border-b border-purple-100">
        <CardTitle className="text-xl font-semibold ">Product Selection</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-full sm:w-[200px] border-purple-200 focus:border-purple-500 focus:ring-purple-500">
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <ScrollArea className="h-[200px]">
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.title}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            min="1"
            placeholder="Quantity"
            className="w-full sm:w-[100px] border-purple-200 focus:border-purple-500 focus:ring-purple-500"
          />
          <Button onClick={handleAddToCart} className="w-full sm:w-auto hover:bg-purple-700 ">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}