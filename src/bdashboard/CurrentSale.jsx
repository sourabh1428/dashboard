import React, { useEffect } from "react";
import Handlebars from "handlebars";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Trash2, Printer } from "lucide-react";
import html2pdf from "html2pdf.js";
import { getApiKey } from "@/configApi";

export function CurrentSale({setUserEvents, setCustomer, userId, userInfo, cart, setCart, settings }) {
  // Default receipt template - will use the custom one from settings if available
  const defaultReceiptTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
      <style>
          .receipt { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; border: 2px solid #000; padding: 1rem; border-radius: 8px; background: #f9f9f9; }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 1rem; }
          .details { margin: 1rem 0; }
          .table { width: 100%; border-collapse: collapse; }
          .table th, .table td { padding: 0.5rem; border-bottom: 1px solid #ddd; text-align: left; }
          .table th { background: #ddd; }
          .total { font-weight: bold; margin-top: 1rem; text-align: right; }
          .footer { text-align: center; font-size: 12px; margin-top: 1rem; }
      </style>
  </head>
  <body>
      <div class="receipt">
          <div class="header">
              <h2>{{company.name}}</h2>
              <p>{{company.address}}</p>
              <p>GSTIN: {{company.gstin}}</p>
          </div>
          
          <div class="details">
              <p><strong>Date:</strong> {{date}}</p>
              <p><strong>Customer:</strong> {{customer.name}}</p>
              <p><strong>Mobile:</strong> {{customer.mobile}}</p>
          </div>

          <table class="table">
              <thead>
                  <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                  </tr>
              </thead>
              <tbody>
                  {{#each items}}
                  <tr>
                      <td>{{this.title}}</td>
                      <td>{{this.quantity}}</td>
                      <td>₹{{this.price}}</td>
                      <td>₹{{multiply this.price this.quantity}}</td>
                  </tr>
                  {{/each}}
              </tbody>
          </table>

          <div class="total">
              <p>Subtotal: ₹{{subtotal}}</p>
              <p>GST (18%): ₹{{gst}}</p>
              <p>Total: ₹{{total}}</p>
          </div>

          <div class="footer">
              <p>Thank you for your purchase!</p>
              <p>Visit Again</p>
          </div>
      </div>
  </body>
  </html>
  `;
  
  async function saveSale(eventDetails) {
    try {
      const response = await fetch('http://localhost:8080/events/saveSale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key':getApiKey()
        },
        body: JSON.stringify(eventDetails)
      });
  
      if (!response.ok) {
        throw new Error(`Failed to save sale: ${response.statusText}`);
      }
  
      const result = await response.json();
      console.log('Sale saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error saving sale:', error);
      throw error;
    }
  }
  
  useEffect(() => {
    if (userId) {
      console.log("Updated userId:", userId);
    }
  }, [userId]); // React to changes in userId
  
  // Register Handlebars helper
  Handlebars.registerHelper("multiply", (a, b) => (a * b).toFixed(2));

  const handleRemoveFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };
  
  const downloadReceipt = () => {
    const receiptHTML = generateReceiptHTML();
    const element = document.createElement("div");
    element.innerHTML = receiptHTML;
    
    // Configure pdf options
    const pdfOptions = {
      margin: 10,
      filename: `receipt-${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Generate and download PDF
    html2pdf()
      .set(pdfOptions)
      .from(element)
      .save()
      .then(() => {
        console.log('PDF generated successfully');
      })
      .catch(err => {
        console.error('Error generating PDF:', err);
      });
  };

  const printReceipt = () => {
    const receiptHTML = generateReceiptHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = function() {
      printWindow.print();
      // printWindow.close();
    };
  };

  const handleUpdateDescription = (index, description) => {
    const updatedCart = [...cart];
    updatedCart[index].description = description;
    setCart(updatedCart);
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const gst = subtotal * 0.18;
    return { subtotal, gst, total: subtotal + gst };
  };

  const generateReceiptHTML = () => {
    // Check if custom template is available in settings
    let templateSource = defaultReceiptTemplate;
    
    // First check if there are saved templates in localStorage
    const savedTemplates = localStorage.getItem('receiptTemplates');
    if (savedTemplates) {
      try {
        const templates = JSON.parse(savedTemplates);
        // Find the default template
        const defaultTemplate = templates.find(t => t.isDefault);
        
        if (defaultTemplate && defaultTemplate.elements) {
          // Convert the template structure to HTML
          let html = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .receipt { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; border-radius: 5px; }
                table { width: 100%; border-collapse: collapse; }
                table th, table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                table th { background-color: #f2f2f2; }
                .divider { border-top: 1px dashed #ccc; margin: 15px 0; }
              </style>
            </head>
            <body>
              <div class="receipt">
          `;
          
          // Add elements to HTML
          defaultTemplate.elements.forEach(element => {
            switch (element.type) {
              case 'header':
                html += `<div style="${styleToString(element.style)}">${element.content}</div>`;
                break;
              case 'company-info':
                html += `
                  <div style="${styleToString(element.style)}">
                    <div>${element.content?.name || settings?.brandName || 'Your Company'}</div>
                    <div>${element.content?.address || '123 Business Street, City'}</div>
                    <div>GSTIN: ${element.content?.gstin || settings?.gstinNumber || 'GSTIN12345'}</div>
                  </div>
                `;
                break;
              case 'customer-info':
                html += `
                  <div style="${styleToString(element.style)}">
                    <p><strong>Customer:</strong> {{customer.name}}</p>
                    <p><strong>Mobile:</strong> {{customer.mobile}}</p>
                    <p><strong>Date:</strong> {{date}}</p>
                  </div>
                `;
                break;
              case 'product-table':
                html += `
                  <table style="${styleToString(element.style)}">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {{#each items}}
                      <tr>
                        <td>{{this.title}}</td>
                        <td>{{this.quantity}}</td>
                        <td>₹{{this.price}}</td>
                        <td>₹{{multiply this.price this.quantity}}</td>
                      </tr>
                      {{/each}}
                    </tbody>
                  </table>
                `;
                break;
              case 'total':
                html += `
                  <div style="${styleToString(element.style)}">
                    <p>Subtotal: ₹{{subtotal}}</p>
                    <p>GST (18%): ₹{{gst}}</p>
                    <p>Total: ₹{{total}}</p>
                  </div>
                `;
                break;
              case 'text':
                html += `<div style="${styleToString(element.style)}">${element.content}</div>`;
                break;
              case 'image':
                html += `<img src="${element.content}" alt="Receipt Image" style="${styleToString(element.style)}" />`;
                break;
              case 'divider':
                html += `<div class="divider"></div>`;
                break;
              case 'footer':
                html += `<div style="${styleToString(element.style)}">${element.content}</div>`;
                break;
              default:
                break;
            }
          });
          
          html += `
              </div>
            </body>
            </html>
          `;
          
          templateSource = html;
        }
      } catch (error) {
        console.error('Error parsing saved templates:', error);
        // Fall back to checking settings templates
      }
    }
    
    // If no templates found in localStorage, fall back to settings.receiptTemplate
    if (templateSource === defaultReceiptTemplate && settings && settings.receiptTemplate) {
      try {
        // Convert the template structure to HTML
        let html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .receipt { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; border-radius: 5px; }
              table { width: 100%; border-collapse: collapse; }
              table th, table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              table th { background-color: #f2f2f2; }
              .divider { border-top: 1px dashed #ccc; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="receipt">
        `;
        
        // Add elements to HTML
        settings.receiptTemplate.forEach(element => {
          switch (element.type) {
            case 'header':
              html += `<div style="${styleToString(element.style)}">${element.content}</div>`;
              break;
            case 'company-info':
              html += `
                <div style="${styleToString(element.style)}">
                  <div>${element.content?.name || settings?.brandName || 'Your Company'}</div>
                  <div>${element.content?.address || '123 Business Street, City'}</div>
                  <div>GSTIN: ${element.content?.gstin || settings?.gstinNumber || 'GSTIN12345'}</div>
                </div>
              `;
              break;
            case 'customer-info':
              html += `
                <div style="${styleToString(element.style)}">
                  <p><strong>Customer:</strong> {{customer.name}}</p>
                  <p><strong>Mobile:</strong> {{customer.mobile}}</p>
                  <p><strong>Date:</strong> {{date}}</p>
                </div>
              `;
              break;
            case 'product-table':
              html += `
                <table style="${styleToString(element.style)}">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {{#each items}}
                    <tr>
                      <td>{{this.title}}</td>
                      <td>{{this.quantity}}</td>
                      <td>₹{{this.price}}</td>
                      <td>₹{{multiply this.price this.quantity}}</td>
                    </tr>
                    {{/each}}
                  </tbody>
                </table>
              `;
              break;
            case 'total':
              html += `
                <div style="${styleToString(element.style)}">
                  <p>Subtotal: ₹{{subtotal}}</p>
                  <p>GST (18%): ₹{{gst}}</p>
                  <p>Total: ₹{{total}}</p>
                </div>
              `;
              break;
            case 'text':
              html += `<div style="${styleToString(element.style)}">${element.content}</div>`;
              break;
            case 'image':
              html += `<img src="${element.content}" alt="Receipt Image" style="${styleToString(element.style)}" />`;
              break;
            case 'divider':
              html += `<div class="divider"></div>`;
              break;
            case 'footer':
              html += `<div style="${styleToString(element.style)}">${element.content}</div>`;
              break;
            default:
              break;
          }
        });
        
        html += `
            </div>
          </body>
          </html>
        `;
        
        templateSource = html;
      } catch (error) {
        console.error('Error generating custom template:', error);
        // Fall back to default template
      }
    }
    
    const template = Handlebars.compile(templateSource);
    const { subtotal, gst, total } = calculateTotal();

    return template({
      company: {
        name: settings?.brandName || "MarketMe",
        address: "123 Business Street, Mumbai",
        gstin: settings?.gstinNumber || "GSTIN1234567890",
      },
      date: new Date().toLocaleDateString(),
      customer: userInfo,
      items: cart,
      subtotal: subtotal.toFixed(2),
      gst: gst.toFixed(2),
      total: total.toFixed(2),
    });
  };
  
  // Helper function to convert style object to inline CSS string
  const styleToString = (style) => {
    if (!style) return '';
    return Object.entries(style).map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    }).join('; ');
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    
    try {
      // Generate receipt PDF
      const totalAmount = calculateTotal().total;
      const productNames = cart.map(item => item.title).join(', ');
      
      // Create a unique receipt ID
      const receiptId = `receipt-${Date.now()}`;
      const receiptLink = `${window.location.origin}/receipts/${receiptId}`;
      
      // Call downloadReceipt to generate the PDF
      downloadReceipt();
      
      // Also trigger printing
      printReceipt();
  
      // Sale details for sending WhatsApp template
      const saleDetails = {
        templateID: "27c036bd-2390-4b7c-ab5f-436db569ca8c",
        destinationPhone: userInfo.mobile,
        params: [userInfo.name, totalAmount, productNames, "Marketme"],
        type: "text",
        fileLink: "",
        cta_url: true,
        ctaUrlText: "View Receipt",
        ctaUrl: receiptLink,
      };
  
      // Send WhatsApp template message
      const response = await fetch(
        "http://localhost:8080/whatsapp/sendWhatsappTemplateMessage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": getApiKey(),
          },
          body: JSON.stringify(saleDetails),
        }
      );
  
      const data = await response.json();
      if (response.ok) {
        // Add an event to MongoDB using addEvent API
        const eventDetails = {
          MMID: userId,
          eventName: "Purchased",
          event: {
            receiptLink: receiptLink,
            amount: totalAmount,
            productNames: cart
          }
        };
        
        await saveSale(eventDetails);
        
        await fetch("http://localhost:8080/events/addEvent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'x-api-key': getApiKey()
          },
          body: JSON.stringify(eventDetails)
        });
  
        console.log("Event added to MongoDB:", eventDetails);
        
        // Reset the form
        setCart([]);
        setCustomer({name:"", mobile:"", email:""});
        setUserEvents([]);
        
        alert("Sale completed and receipt sent via WhatsApp!");
      } else {
        alert("Failed to complete sale: " + data.error);
      }
    } catch (error) {
      console.error("Error completing sale:", error);
      alert("An error occurred while completing the sale.");
    }
  };
  

  const { subtotal, gst, total } = calculateTotal();

  return (
    <Card className="bg- shadow-lg rounded-lg overflow-hidden">
      <CardHeader className=" border-b border-amber-100">
        <CardTitle className="text-xl font-semibold ">
          Current Sale
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No items in cart</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <Textarea
                          placeholder="Add notes..."
                          value={item.description || ""}
                          onChange={(e) => handleUpdateDescription(index, e.target.value)}
                          className="mt-2 h-8 min-h-[32px] resize-none"
                        />
                      </div>
                    </TableCell>
                    <TableCell>₹{item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFromCart(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GST (18%)</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-base border-t pt-2">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between bg-muted/20 px-6 py-4">
        <Button variant="outline" onClick={downloadReceipt} disabled={cart.length === 0} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Preview
        </Button>
        <Button onClick={completeSale} disabled={cart.length === 0} className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Complete Sale
        </Button>
      </CardFooter>
    </Card>
  );
}
