'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import JsBarcode from 'jsbarcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, X } from 'lucide-react';

interface Order {
  id: string;
  name: string;
  phone: string;
  address: string;
  division: string;
  notes: string;
  quantity: number;
  status: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface BulkPrintDialogProps {
  orders: Order[];
  open: boolean;
  onClose: () => void;
}

type LabelsPerPage = 4 | 6;

export default function BulkPrintDialog({ orders, open, onClose }: BulkPrintDialogProps) {
  const [labelsPerPage, setLabelsPerPage] = useState<LabelsPerPage>(6);
  const [printing, setPrinting] = useState(false);
  const printWindowRef = useRef<Window | null>(null);

  const formatDatePrint = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const generateBarcode = useCallback((orderId: string): string => {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, orderId.slice(0, 12).toUpperCase(), {
        width: 2,
        height: 45,
        displayValue: true,
        fontSize: 12,
        font: 'monospace',
        margin: 0,
        background: 'transparent',
        lineColor: '#000000',
      });
      return canvas.toDataURL('image/png');
    } catch {
      return '';
    }
  }, []);

  const handlePrint = useCallback(() => {
    if (orders.length === 0) return;
    setPrinting(true);

    try {
      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (!printWindow) {
        alert('Popup blocked! Please allow popups for this site.');
        setPrinting(false);
        return;
      }
      printWindowRef.current = printWindow;

      const cols = 2;
      const rows = labelsPerPage === 6 ? 3 : 2;

      // Generate barcode data URLs
      const barcodeMap: Record<string, string> = {};
      orders.forEach((order) => {
        barcodeMap[order.id] = generateBarcode(order.id);
      });

      // Paginate orders
      const pages: Order[][] = [];
      for (let i = 0; i < orders.length; i += labelsPerPage) {
        pages.push(orders.slice(i, i + labelsPerPage));
      }

      // Build labels HTML per page
      const buildLabelsHTML = (pageOrders: Order[], pageIndex: number) => {
        const labels = pageOrders.map((order, idx) => {
          const barcode = barcodeMap[order.id] || '';
          return `
            <div class="label" style="
              width: calc((210mm - ${cols + 1} * 5mm) / ${cols});
              height: calc((297mm - ${(rows + 1)} * 5mm) / ${rows});
              border: 1.5px solid #333;
              border-radius: 4px;
              padding: 3mm 4mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
              background: #fff;
              font-family: 'Helvetica Neue', Arial, sans-serif;
            ">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <div style="font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">VAJRAFORCE</div>
                  <div style="font-size: 11px; font-weight: 700; color: #111; margin-top: 2px;">${order.name}</div>
                </div>
                <div style="text-align: right; font-size: 9px; color: #666;">
                  <div style="font-weight: 600;">${labelsPerPage === 6 ? formatTaka(order.amount) : formatTaka(order.amount)}</div>
                  <div>Qty: ${order.quantity}</div>
                </div>
              </div>

              <div style="margin-top: 1.5mm;">
                <div style="font-size: ${labelsPerPage === 6 ? '8px' : '9px'}; color: #555; display: flex; align-items: center; gap: 3px;">
                  <span style="font-weight: 600; color: #333;">📱</span> ${order.phone}
                </div>
                <div style="font-size: ${labelsPerPage === 6 ? '7px' : '8px'}; color: #777; margin-top: 1mm; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;">
                  📍 ${order.address}, ${order.division}
                </div>
              </div>

              <div style="margin-top: auto; padding-top: 1.5mm; text-align: center;">
                ${barcode ? `<img src="${barcode}" style="width: 100%; max-width: 160px; height: auto; display: block; margin: 0 auto;" />` : `<div style="font-family: monospace; font-size: 10px; color: #333; letter-spacing: 2px; border: 1px dashed #ccc; padding: 4px; border-radius: 3px;">${order.id.slice(0, 12).toUpperCase()}</div>`}
                <div style="font-size: 7px; color: #999; margin-top: 1mm;">${formatDatePrint(order.createdAt)}</div>
              </div>
            </div>
          `;
        }).join('');

        // Fill empty slots with placeholder labels
        const emptySlots = labelsPerPage - pageOrders.length;
        for (let i = 0; i < emptySlots; i++) {
          // Don't add empty placeholders - just skip
        }

        return labels;
      };

      const allLabelsHTML = pages.map((pageOrders, pageIndex) => {
        const isLastPage = pageIndex === pages.length - 1;
        const labelsHTML = buildLabelsHTML(pageOrders, pageIndex);
        return `
          <div class="a4-page" style="
            width: 210mm;
            min-height: 297mm;
            padding: 5mm;
            box-sizing: border-box;
            page-break-after: ${isLastPage ? 'auto' : 'always'};
            display: grid;
            grid-template-columns: repeat(${cols}, 1fr);
            grid-template-rows: repeat(${rows}, 1fr);
            gap: 5mm;
            align-content: start;
          ">
            ${labelsHTML}
          </div>
        `;
      }).join('');

      const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>VajraForce - Print Labels</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 0;
    }

    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .a4-page {
        page-break-after: always;
      }
      .a4-page:last-child {
        page-break-after: auto;
      }
      .no-print {
        display: none !important;
      }
    }

    body {
      margin: 0;
      padding: 0;
      background: #f0f0f0;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }

    .a4-page {
      width: 210mm;
      min-height: 297mm;
      margin: 10px auto;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    @media print {
      .a4-page {
        margin: 0;
        box-shadow: none;
      }
      body {
        background: white;
      }
    }

    .print-header {
      padding: 5mm;
      text-align: center;
      border-bottom: 1px solid #eee;
    }

    .label {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="no-print" style="
    position: fixed;
    top: 10px;
    right: 20px;
    z-index: 1000;
    display: flex;
    gap: 10px;
    align-items: center;
  ">
    <span style="font-size: 13px; color: #555;">Total: ${orders.length} labels | Pages: ${pages.length}</span>
    <button onclick="window.print()" style="
      padding: 8px 20px;
      background: #C9A84C;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    ">🖨️ Print</button>
    <button onclick="window.close()" style="
      padding: 8px 16px;
      background: #eee;
      color: #333;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
    ">✕ Close</button>
  </div>

  ${allLabelsHTML}

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>`;

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      // Clean up ref after print window closes
      const checkClosed = setInterval(() => {
        if (printWindow.closed) {
          clearInterval(checkClosed);
          printWindowRef.current = null;
          setPrinting(false);
        }
      }, 1000);

    } catch (err) {
      console.error('Print error:', err);
      setPrinting(false);
    }
  }, [orders, labelsPerPage, generateBarcode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (printWindowRef.current && !printWindowRef.current.closed) {
        printWindowRef.current.close();
      }
    };
  }, []);

  if (orders.length === 0) return null;

  const totalPages = Math.ceil(orders.length / labelsPerPage);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-vf-dark4 border-[#2A2A25] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-vf-gold font-display text-lg flex items-center gap-2">
            <Printer className="w-5 h-5" />
            বাল্ক প্রিন্ট
          </DialogTitle>
          <DialogDescription className="text-vf-text-muted">
            {orders.length} টি অর্ডার নির্বাচিত — লেবেল প্রিন্ট করুন
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Layout Selection */}
          <div className="bg-vf-dark3 rounded-xl p-4 border border-[#2A2A25] space-y-3">
            <h4 className="text-vf-gold-dim text-xs font-semibold uppercase tracking-wider">প্রিন্ট লেআউট</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLabelsPerPage(4)}
                className={`relative p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  labelsPerPage === 4
                    ? 'border-vf-gold bg-vf-gold/10'
                    : 'border-[#2A2A25] hover:border-[#3A3A35]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    labelsPerPage === 4 ? 'border-vf-gold' : 'border-[#3A3A35]'
                  }`}>
                    {labelsPerPage === 4 && <div className="w-2 h-2 rounded-full bg-vf-gold" />}
                  </div>
                  <span className="text-vf-cream text-sm font-semibold">৪টি/পৃষ্ঠা</span>
                </div>
                <div className="grid grid-cols-2 gap-1 ml-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`h-4 rounded-sm ${labelsPerPage === 4 ? 'bg-vf-gold/30' : 'bg-[#2A2A25]'}`} />
                  ))}
                </div>
                <p className="text-vf-text-muted text-[10px] ml-6 mt-1">2 × 2 গ্রিড</p>
              </button>

              <button
                onClick={() => setLabelsPerPage(6)}
                className={`relative p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  labelsPerPage === 6
                    ? 'border-vf-gold bg-vf-gold/10'
                    : 'border-[#2A2A25] hover:border-[#3A3A35]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    labelsPerPage === 6 ? 'border-vf-gold' : 'border-[#3A3A35]'
                  }`}>
                    {labelsPerPage === 6 && <div className="w-2 h-2 rounded-full bg-vf-gold" />}
                  </div>
                  <span className="text-vf-cream text-sm font-semibold">৬টি/পৃষ্ঠা</span>
                </div>
                <div className="grid grid-cols-2 gap-1 ml-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`h-3 rounded-sm ${labelsPerPage === 6 ? 'bg-vf-gold/30' : 'bg-[#2A2A25]'}`} />
                  ))}
                </div>
                <p className="text-vf-text-muted text-[10px] ml-6 mt-1">2 × 3 গ্রিড</p>
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-vf-dark3 rounded-xl p-3 border border-[#2A2A25]">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-vf-gold text-lg font-bold font-display">{orders.length}</p>
                <p className="text-vf-text-muted text-[10px]">মোট লেবেল</p>
              </div>
              <div>
                <p className="text-vf-cream text-lg font-bold font-display">{totalPages}</p>
                <p className="text-vf-text-muted text-[10px]">মোট পৃষ্ঠা</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2 mt-2">
          <Button variant="ghost" onClick={onClose} className="text-vf-text-muted hover:text-vf-cream hover:bg-[#2A2A25] flex-1">
            বাতিল
          </Button>
          <Button
            onClick={handlePrint}
            disabled={printing}
            className="bg-vf-gold hover:bg-vf-gold-light text-vf-dark font-semibold flex-1 gap-2"
          >
            {printing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
            প্রিন্ট করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatTaka(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`;
}
