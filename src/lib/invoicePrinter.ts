import { SaleRecord } from "../app/components/data/mockData";

export function generateInvoiceHTML(sale: SaleRecord): string {
  const dueAmount = sale.totalAmount - sale.paidAmount;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Invoice ${sale.invoiceNo}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Arial', sans-serif;
          background: white;
          color: #333;
          line-height: 1.6;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px;
          background: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 3px solid #B91C1C;
          padding-bottom: 20px;
        }
        .company-info h1 {
          color: #B91C1C;
          font-size: 28px;
          margin-bottom: 5px;
        }
        .company-info p {
          color: #666;
          font-size: 12px;
        }
        .invoice-details {
          text-align: right;
        }
        .invoice-details p {
          margin: 5px 0;
          font-size: 13px;
        }
        .invoice-details .label {
          font-weight: bold;
          color: #666;
        }
        .invoice-details .value {
          color: #333;
        }
        .parties {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          gap: 40px;
        }
        .party {
          flex: 1;
        }
        .party h3 {
          color: #B91C1C;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .party p {
          font-size: 13px;
          margin: 3px 0;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .table th {
          background-color: #B91C1C;
          color: white;
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: bold;
          border: 1px solid #999;
        }
        .table td {
          padding: 10px 12px;
          border: 1px solid #ddd;
          font-size: 13px;
        }
        .table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .table .text-right {
          text-align: right;
        }
        .table .text-center {
          text-align: center;
        }
        .summary {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 30px;
        }
        .summary-box {
          width: 300px;
          border: 2px solid #B91C1C;
          border-radius: 4px;
          padding: 15px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin: 8px 0;
          padding: 5px 0;
        }
        .summary-row.total {
          border-top: 2px solid #B91C1C;
          padding-top: 10px;
          margin-top: 10px;
          font-weight: bold;
          font-size: 14px;
          color: #B91C1C;
        }
        .summary-label {
          font-weight: 600;
        }
        .summary-value {
          text-align: right;
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: bold;
        }
        .badge.paid {
          background-color: #dcfce7;
          color: #166534;
        }
        .badge.partial {
          background-color: #fed7aa;
          color: #92400e;
        }
        .badge.pending {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .footer {
          border-top: 1px solid #ddd;
          padding-top: 20px;
          text-align: center;
          font-size: 11px;
          color: #666;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .container {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-info">
            <h1>🌶️ MIRCHI YARD</h1>
            <p>Premium Chili Supplier</p>
            <p>GST: 36ABCDE1234F2Z5</p>
          </div>
          <div class="invoice-details">
            <p><span class="label">Invoice No:</span> <span class="value">${sale.invoiceNo}</span></p>
            <p><span class="label">Date:</span> <span class="value">${new Date(sale.date).toLocaleDateString()}</span></p>
            <p><span class="label">Status:</span> <span class="value"><span class="badge ${sale.paymentStatus.toLowerCase()}">${sale.paymentStatus}</span></span></p>
          </div>
        </div>

        <div class="parties">
          <div class="party">
            <h3>Bill To:</h3>
            <p><strong>${sale.customerName}</strong></p>
            <p>Customer since: 2023</p>
          </div>
          <div class="party">
            <h3>Shipped From:</h3>
            <p><strong>MIRCHI YARD</strong></p>
            <p>Khammam, Telangana 507001</p>
            <p>Ph: +91-9848012345</p>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-center">Variety</th>
              <th class="text-center">Grade</th>
              <th class="text-right">Bags</th>
              <th class="text-right">Weight (kg)</th>
              <th class="text-right">Unit Price (₹)</th>
              <th class="text-right">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Premium Red Chili</td>
              <td class="text-center">${sale.variety}</td>
              <td class="text-center">${sale.grade}</td>
              <td class="text-right">${sale.bags}</td>
              <td class="text-right">${sale.weightKg.toLocaleString()}</td>
              <td class="text-right">₹${sale.salePrice.toLocaleString()}</td>
              <td class="text-right"><strong>₹${sale.totalAmount.toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-box">
            <div class="summary-row">
              <span class="summary-label">Subtotal:</span>
              <span class="summary-value">₹${sale.totalAmount.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Tax (0%):</span>
              <span class="summary-value">₹0</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Paid Amount:</span>
              <span class="summary-value">₹${sale.paidAmount.toLocaleString()}</span>
            </div>
            <div class="summary-row total">
              <span class="summary-label">Due Amount:</span>
              <span class="summary-value">₹${Math.max(0, sale.totalAmount - sale.paidAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business! This is a computer-generated invoice.</p>
          <p>For queries contact: support@mirchiyard.com | Ph: +91-9848012345</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function printInvoice(sale: SaleRecord) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to print invoices");
    return;
  }

  const html = generateInvoiceHTML(sale);
  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
  };

  // Alternative: print immediately (in case onload doesn't fire)
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

export function downloadInvoice(sale: SaleRecord) {
  const html = generateInvoiceHTML(sale);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Invoice_${sale.invoiceNo}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
