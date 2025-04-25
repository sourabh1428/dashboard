import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function InventoryManagement() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProductsFromLocalStorage = () => {
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts);
        // If products are retrieved from localStorage, add a default quantity if not already set
        const productsWithQuantity = parsedProducts.map(product => ({
          ...product,
          quantity: product.quantity || 10, // Use stored quantity or default to 10
        }));
        setProducts(productsWithQuantity);
      }
    };

    loadProductsFromLocalStorage();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.title}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>
                  {product.quantity > 10 ? (
                    <Badge variant="success">In Stock</Badge>
                  ) : product.quantity > 0 ? (
                    <Badge variant="warning">Low Stock</Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
