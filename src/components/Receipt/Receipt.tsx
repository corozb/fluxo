import { useRef } from 'react';
import { formatNumber } from '@/lib/utils';
import { Sale } from '@/stores/posStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';

interface ReceiptProps {
  sale: Sale;
  onClose?: () => void;
}

export function Receipt({ sale, onClose }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!receiptRef.current) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Header
    pdf.setFontSize(20);
    pdf.text('ProPOS Receipt', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    pdf.setFontSize(12);
    pdf.text(`Receipt #: ${sale.id}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Date: ${new Date(sale.timestamp).toLocaleString()}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Cashier: ${sale.cashierId}`, margin, yPosition);
    yPosition += 20;

    // Items
    pdf.setFontSize(14);
    pdf.text('Items:', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    sale.items.forEach(item => {
      const itemText = `${item.name} x${item.quantity}`;
      const priceText = formatNumber(item.subtotal, '$');
      
      pdf.text(itemText, margin, yPosition);
      pdf.text(priceText, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 8;
    });

    yPosition += 10;

    // Totals
    pdf.text(`Subtotal: ${formatNumber(sale.total - sale.tax, '$')}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 8;
    pdf.text(`Tax: ${formatNumber(sale.tax, '$')}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 8;
    pdf.setFontSize(12);
    pdf.text(`Total: ${formatNumber(sale.total, '$')}`, pageWidth - margin, yPosition, { align: 'right' });

    pdf.save(`receipt-${sale.id}.pdf`);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg print:shadow-none print:max-w-none">
      <div ref={receiptRef}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">ProPOS</h1>
          <p className="text-sm text-gray-600">Professional Point of Sale</p>
          <div className="w-16 h-px bg-gray-300 mx-auto mt-2"></div>
        </div>

        <div className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Receipt #:</span>
            <span className="font-mono">{sale.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span>{new Date(sale.timestamp).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cashier:</span>
            <span>{sale.cashierId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment:</span>
            <Badge variant="outline" className="text-xs">
              {sale.paymentMethod.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mb-4">
          <h3 className="font-semibold mb-3">Items</h3>
          <div className="space-y-2">
            {sale.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-gray-600">
                    {formatNumber(item.price, '$')} × {item.quantity}
                  </div>
                </div>
                <div className="text-right font-medium">
                  {formatNumber(item.subtotal, '$')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatNumber(sale.total - sale.tax, '$')}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (9%):</span>
            <span>{formatNumber(sale.tax, '$')}</span>
          </div>
          {sale.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-{formatNumber(sale.discount, '$')}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatNumber(sale.total, '$')}</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">Thank you for your business!</p>
          <p className="text-xs text-gray-500">Visit us again soon</p>
        </div>
      </div>

      <div className="flex space-x-2 mt-6 print:hidden">
        <Button onClick={handlePrint} variant="outline" className="flex-1">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        {onClose && (
          <Button onClick={onClose} className="flex-1">
            Close
          </Button>
        )}
      </div>
    </div>
  );
}