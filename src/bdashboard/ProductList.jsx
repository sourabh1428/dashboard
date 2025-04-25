import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from 'lucide-react';
import { Switch } from "@/components/ui/switch"; // Ensure you have a Switch component
import { Loader } from "@/components/ui/loader"; // Loader component from ShadCN
import { motion } from 'framer-motion'; // Import Framer Motion

export function ProductManagement({ addProduct }) {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });

  // State to manage search filters
  const [searchNameEnabled, setSearchNameEnabled] = useState(true);
  const [searchPriceEnabled, setSearchPriceEnabled] = useState(false);
  const [searchQuantityEnabled, setSearchQuantityEnabled] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue); // for debouncing
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    // Simulating fetching products from local storage
    const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
    setProducts(storedProducts);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productToAdd = {
      ...newProduct,
      quantity: parseInt(newProduct.quantity) || 10, // Default quantity is 10
    };

    // Save the new product to local storage
    const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
    localStorage.setItem('products', JSON.stringify([...storedProducts, productToAdd]));
    addProduct(productToAdd);
    setNewProduct({ name: '', price: '', quantity: '' });
  };

  const filterProducts = (searchValue) => {
    let filteredProducts = JSON.parse(localStorage.getItem('products')) || [];

    if (searchNameEnabled) {
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(searchValue.toLowerCase())
      );
    } 
    if (searchPriceEnabled) {
      const priceValue = parseFloat(searchValue);
      filteredProducts = filteredProducts.filter(product => product.price < priceValue);
    } 
    if (searchQuantityEnabled) {
      const quantityValue = parseInt(searchValue);
      filteredProducts = filteredProducts.filter(product => product.quantity === quantityValue);
    }

    setProducts(filteredProducts);
    setLoading(false); // Stop loading when filtering is done
  };

  // Custom debounce function
  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      const context = this;
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  // Effect to watch for searchValue changes and trigger the search
  useEffect(() => {
    const handleDebounce = debounce((value) => {
      setDebouncedSearchValue(value);
    }, 2000);

    handleDebounce(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (debouncedSearchValue) {
      setLoading(true); // Start loading
      filterProducts(debouncedSearchValue);
    } else {
      setLoading(false);
    }
  }, [debouncedSearchValue]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              placeholder="Product Name"
              required
            />
            <Input
              type="number"
              name="price"
              value={newProduct.price}
              onChange={handleInputChange}
              placeholder="Price"
              required
            />
            <Input
              type="number"
              name="quantity"
              value={newProduct.quantity}
              onChange={handleInputChange}
              placeholder="Quantity"
              required
            />
            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <div className="flex items-center">
              <Switch checked={searchNameEnabled} onCheckedChange={setSearchNameEnabled} />
              <label className="ml-2">Search by Name</label>
            </div>
           
          </div>
          { (searchNameEnabled || searchPriceEnabled || searchQuantityEnabled) && (
            <div className="mb-4">
              <Input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Enter search value"
              />
            </div>
          )}
          <motion.div layout>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader /> {/* ShadCN loader component */}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.title}</TableCell>
                      <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
