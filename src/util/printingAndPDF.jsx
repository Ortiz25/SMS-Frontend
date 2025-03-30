import jsPDF from 'jspdf';


export const printReceipt = (payment) => {
    // Create a new window for the receipt
    const receiptWindow = window.open('', '_blank');
    
    // Get the current date and time for receipt generation timestamp
    const generatedDate = new Date().toLocaleString();
    
    // Format the payment date
    const paymentDate = new Date(payment.payment_date).toLocaleDateString();
    
    // Format the amount with commas for thousands
    const formattedAmount = parseFloat(payment.amount).toLocaleString();
    
    // Create the receipt HTML content with clean styling
    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${payment.receipt_number}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 20px;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .school-name {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }
          .receipt-title {
            font-size: 18px;
            margin: 10px 0;
            color: #555;
          }
          .receipt-number {
            font-weight: bold;
          }
          .receipt-body {
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            border-bottom: 1px dotted #eee;
            padding-bottom: 5px;
          }
          .info-label {
            font-weight: bold;
            color: #555;
          }
          .amount {
            font-size: 18px;
            font-weight: bold;
          }
          .receipt-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #777;
          }
          .status-success {
            color: #22c55e;
            font-weight: bold;
          }
          .payment-method {
            text-transform: capitalize;
            background-color: #f3f4f6;
            display: inline-block;
            padding: 5px 10px;
            border-radius: 4px;
          }
          .print-button {
            display: block;
            margin: 20px auto;
            padding: 10px 20px;
            background-color: #4f46e5;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
          }
          .timestamp {
            margin-top: 10px;
            font-size: 11px;
            color: #999;
          }
          @media print {
            .print-button, .no-print {
              display: none;
            }
            body {
              padding: 0;
            }
            .receipt {
              border: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="receipt-header">
            <div class="school-name">School Management System</div>
            <div class="receipt-title">OFFICIAL PAYMENT RECEIPT</div>
            <div class="receipt-number">Receipt No: ${payment.receipt_number}</div>
          </div>
          
          <div class="receipt-body">
            <div class="info-row">
              <div class="info-label">Student Name:</div>
              <div>${payment.first_name} ${payment.last_name}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Admission Number:</div>
              <div>${payment.admission_number}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Class & Stream:</div>
              <div>${payment.current_class} ${payment.stream}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Academic Term:</div>
              <div>Term ${payment.term} - ${payment.year}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Payment Date:</div>
              <div>${paymentDate}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Payment Method:</div>
              <div class="payment-method">${payment.payment_method === 'mpesa' ? 'M-Pesa' : payment.payment_method}</div>
            </div>
            
            ${payment.payment_method === 'mpesa' ? `
            <div class="info-row">
              <div class="info-label">M-Pesa Code:</div>
              <div>${payment.mpesa_code || 'N/A'}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Phone Number:</div>
              <div>${payment.mpesa_phone || 'N/A'}</div>
            </div>
            ` : ''}
            
            ${payment.payment_method === 'bank' ? `
            <div class="info-row">
              <div class="info-label">Bank Name:</div>
              <div>${payment.bank_name || 'N/A'}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Bank Branch:</div>
              <div>${payment.bank_branch || 'N/A'}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Reference Number:</div>
              <div>${payment.transaction_reference || 'N/A'}</div>
            </div>
            ` : ''}
            
            <div class="info-row">
              <div class="info-label">Status:</div>
              <div class="status-success">${payment.payment_status === 'success' ? 'Successful' : 'Failed'}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Amount Paid:</div>
              <div class="amount">KES ${formattedAmount}</div>
            </div>
            
            ${payment.notes ? `
            <div class="info-row">
              <div class="info-label">Notes:</div>
              <div>${payment.notes}</div>
            </div>
            ` : ''}
          </div>
          
          <div class="receipt-footer">
            <div>This is an electronically generated receipt and does not require a signature.</div>
            <div>Thank you for your payment.</div>
            <div class="timestamp">Generated on: ${generatedDate}</div>
          </div>
        </div>
        
        <button class="print-button" onclick="window.print(); return false;">Print Receipt</button>
      </body>
      </html>
    `);
    
    // Close the document for writing
    receiptWindow.document.close();
    receiptWindow.focus();
  };

  // Add this function near the top of your FinanceDashboard component;

// Since jsPDF is already imported at the top:
// import jsPDF from 'jspdf';

export const downloadPdfReceipt = (payment) => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Format the payment date
  const paymentDate = new Date(payment.payment_date).toLocaleDateString();
  
  // Format the amount with commas for thousands
  const formattedAmount = parseFloat(payment.amount).toLocaleString();
  
  // PDF Content configuration
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Professional color palette for financial documents
  const primaryColor = [0, 47, 108]; // Dark blue - professional, trustworthy
  const accentColor = [0, 84, 159]; // Medium blue - complementary
  const highlightColor = [0, 112, 60]; // Deep green - financial, secure
  const textColor = [33, 37, 41]; // Near black - easy to read
  const subtleColor = [108, 117, 125]; // Medium gray - professional
  const bgColor = [248, 249, 250]; // Off-white - clean, crisp
  const errorColor = [220, 53, 69]; // Refined red - clear but not alarming
  
  // Font options - keep Helvetica but use it more intentionally
  const fonts = {
    heading: { size: 16, style: 'bold' },
    subheading: { size: 12, style: 'bold' },
    body: { size: 10, style: 'normal' },
    small: { size: 8, style: 'normal' }
  };
  
  // Helper function to add text with advanced styling
  const addText = (text, x, y, options = {}) => {
    const { 
      fontSize = fonts.body.size, 
      fontStyle = fonts.body.style,
      color = textColor,
      align = 'left',
      maxWidth = null
    } = options;
    
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(color[0], color[1], color[2]);
    
    if (align === 'center' && !maxWidth) {
      const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
      x = (pageWidth - textWidth) / 2;
    } else if (align === 'right' && !maxWidth) {
      const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
      x = pageWidth - margin - textWidth;
    }
    
    if (maxWidth) {
      return doc.splitTextToSize(text, maxWidth);
    } else {
      doc.text(text, x, y);
      return [text];
    }
  };
  
  // Add styled box with text
  const addBox = (x, y, width, height, options = {}) => {
    const { 
      fillColor = bgColor,
      borderColor = null,
      borderWidth = 0,
      borderRadius = 3,
      title = null,
      titleColor = primaryColor,
      content = [],
      padding = 5
    } = options;
    
    // Draw box with rounded corners
    doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
    
    // Using roundedRect if borderRadius > 0, otherwise use regular rect
    if (borderRadius > 0) {
      doc.roundedRect(x, y, width, height, borderRadius, borderRadius, 'F');
    } else {
      doc.rect(x, y, width, height, 'F');
    }
    
    // Add border if specified
    if (borderColor && borderWidth > 0) {
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(borderWidth);
      
      if (borderRadius > 0) {
        doc.roundedRect(x, y, width, height, borderRadius, borderRadius, 'S');
      } else {
        doc.rect(x, y, width, height, 'S');
      }
    }
    
    // Add title if provided
    let contentY = y + padding;
    if (title) {
      addText(title, x + padding, contentY + 5, {
        fontSize: fonts.subheading.size,
        fontStyle: fonts.subheading.style,
        color: titleColor
      });
      contentY += 10;
    }
    
    // Add content
    content.forEach(item => {
      const { label, value, options = {} } = item;
      contentY += 8;
      
      if (label && value) {
        // Label
        addText(label, x + padding, contentY, {
          fontSize: options.fontSize || fonts.body.size,
          fontStyle: options.labelStyle || 'bold',
          color: options.labelColor || subtleColor
        });
        
        // Value
        addText(value, x + padding + 45, contentY, {
          fontSize: options.fontSize || fonts.body.size,
          fontStyle: options.valueStyle || 'normal',
          color: options.valueColor || textColor
        });
      } else if (label) {
        // Just a label (for notes or single line items)
        addText(label, x + padding, contentY, {
          fontSize: options.fontSize || fonts.body.size,
          fontStyle: options.fontStyle || 'normal',
          color: options.color || textColor
        });
      }
    });
    
    return contentY + padding; // Return the new Y position
  };
  
  // Create modern header with professional gradient and logo placeholder
  const addHeader = () => {
    // Create a subtle gradient effect for the header
    const gradientSteps = 35;
    for (let i = 0; i < gradientSteps; i++) {
      // Calculate gradient color from primary to slightly darker
      const ratio = i / gradientSteps;
      const r = primaryColor[0] - (ratio * 20);
      const g = primaryColor[1] - (ratio * 20);
      const b = primaryColor[2] - (ratio * 20);
      
      doc.setFillColor(r, g, b);
      doc.rect(0, i * (35/gradientSteps), pageWidth, 35/gradientSteps, 'F');
    }
    
    // Sleek accent line instead of thick strip
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(margin, 36, pageWidth - margin, 36);
    
    // Logo placeholder (left aligned)
    doc.setFillColor(255, 255, 255, 0.9);
    doc.roundedRect(margin, 10, 15, 15, 2, 2, 'F');
    
    // Title text - better positioning and sizing
    addText('SCHOOL MANAGEMENT SYSTEM', margin + 20, 18, {
      fontSize: fonts.heading.size,
      fontStyle: fonts.heading.style,
      color: [255, 255, 255],
      align: 'left'
    });
    
    addText('OFFICIAL PAYMENT RECEIPT', margin + 20, 25, {
      fontSize: fonts.subheading.size - 1, // Slightly smaller
      fontStyle: 'normal',
      color: [255, 255, 255, 0.9], // Slightly transparent for hierarchy
      align: 'left'
    });
  };
  
  // Start building the PDF
  addHeader();
  
  // Professional receipt number with secure-looking styling
  let y = 50;
  
  // Right-aligned receipt number in a more secure/official looking format
  doc.setFillColor(245, 247, 250); // Very light background
  doc.roundedRect(pageWidth - margin - 100, y - 8, 100, 16, 2, 2, 'F');
  
  // Subtle border
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.roundedRect(pageWidth - margin - 100, y - 8, 100, 16, 2, 2, 'S');
  
  // Small "secure document" icon placeholder
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.circle(pageWidth - margin - 95, y, 2, 'F');
  
  // Receipt label
  addText('Receipt No:', pageWidth - margin - 90, y, {
    fontSize: fonts.small.size + 1,
    fontStyle: 'normal',
    color: subtleColor
  });
  
  // Receipt value with monospace-like styling for official look
  addText(payment.receipt_number, pageWidth - margin - 50, y, {
    fontSize: fonts.body.size,
    fontStyle: 'bold',
    color: textColor
  });
  
  y += 15;
  
  // Payment amount styled as a premium, secure-looking box
  // Create a professional, receipt-like amount display
  doc.setFillColor(252, 252, 252); // Almost white background
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
  
  // Subtle patterned background for security (small dots pattern)
  for (let i = margin + 5; i < pageWidth - margin; i += 5) {
    for (let j = y + 5; j < y + 30; j += 5) {
      doc.setFillColor(240, 240, 240);
      doc.circle(i, j, 0.2, 'F');
    }
  }
  
  // Decorative border with slight shadow effect
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'S');
  
  // Separating line between label and amount
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.7);
  doc.line(margin + 60, y + 5, margin + 60, y + 30);
  
  // Label with improved styling
  addText('AMOUNT PAID', margin + 10, y + 15, {
    fontSize: fonts.body.size,
    fontStyle: 'bold',
    color: subtleColor
  });
  
  // Currency code with subtle styling
  addText('KES', margin + 70, y + 15, {
    fontSize: fonts.body.size,
    fontStyle: 'normal',
    color: subtleColor
  });
  
  // Amount with larger, bold styling
  addText(formattedAmount, margin + 90, y + 22, {
    fontSize: fonts.heading.size,
    fontStyle: 'bold',
    color: highlightColor
  });
  
  // Adding subtle watermark-like text for authenticity
  doc.setTextColor(245, 245, 245);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PAID', pageWidth - margin - 40, y + 23);
  
  const amountBoxY = y + 35;
  
  y = amountBoxY + 10;
  
  // Student info section with modern card-like styling
  const studentBoxY = addBox(margin, y, contentWidth, 40, {
    fillColor: bgColor,
    borderRadius: 4,
    title: 'STUDENT INFORMATION',
    content: [
      {
        label: 'Student Name:',
        value: `${payment.first_name} ${payment.last_name}`
      },
      {
        label: 'Admission No:',
        value: payment.admission_number
      },
      {
        label: 'Class & Stream:',
        value: `${payment.current_class} ${payment.stream}`
      }
    ]
  });
  
  y = studentBoxY + 10;
  
  // Payment info section with modern card-like styling
  const paymentContent = [
    {
      label: 'Academic Term:',
      value: `Term ${payment.term} - ${payment.year}`
    },
    {
      label: 'Payment Date:',
      value: paymentDate
    }
  ];
  
  // Add payment method information
  const methodDisplay = payment.payment_method === 'mpesa' ? 'M-Pesa' : 
                     payment.payment_method === 'bank' ? 'Bank Transfer' : 
                     payment.payment_method;
  
  paymentContent.push({
    label: 'Payment Method:',
    value: methodDisplay
  });
  
  // Method-specific fields
  if (payment.payment_method === 'mpesa') {
    paymentContent.push({
      label: 'M-Pesa Code:',
      value: payment.mpesa_code || 'N/A'
    });
    
    paymentContent.push({
      label: 'Phone Number:',
      value: payment.mpesa_phone || 'N/A'
    });
  } else if (payment.payment_method === 'bank') {
    paymentContent.push({
      label: 'Bank Name:',
      value: payment.bank_name || 'N/A'
    });
    
    paymentContent.push({
      label: 'Bank Branch:',
      value: payment.bank_branch || 'N/A'
    });
    
    paymentContent.push({
      label: 'Reference No:',
      value: payment.transaction_reference || 'N/A'
    });
  }
  
  // Add payment status with appropriate color
  const statusColor = payment.payment_status === 'success' ? highlightColor : errorColor;
  paymentContent.push({
    label: 'Status:',
    value: payment.payment_status === 'success' ? 'Successful' : 'Failed',
    options: {
      valueColor: statusColor,
      valueStyle: 'bold'
    }
  });
  
  const paymentBoxY = addBox(margin, y, contentWidth, 60 + 
    (payment.payment_method === 'mpesa' || payment.payment_method === 'bank' ? 16 : 0), {
    fillColor: bgColor,
    borderRadius: 4,
    title: 'PAYMENT DETAILS',
    content: paymentContent
  });
  
  y = paymentBoxY + 10;
  
  // Add notes if available
  if (payment.notes) {
    const notesBoxY = addBox(margin, y, contentWidth, 30, {
      fillColor: bgColor,
      borderRadius: 4,
      title: 'ADDITIONAL NOTES',
      content: [{
        label: payment.notes,
        options: {
          fontSize: fonts.body.size,
          color: textColor
        }
      }]
    });
    
    y = notesBoxY + 10;
  }
  
  // Modern footer with subtle design
  y = pageHeight - 30;
  
  // Footer background
  doc.setFillColor(248, 250, 252); // Slightly lighter than bgColor
  doc.rect(0, y, pageWidth, 30, 'F');
  
  // Accent line
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  
  // Footer text
  y += 10;
  addText('This is an electronically generated receipt and does not require a signature.', 0, y, {
    fontSize: fonts.small.size,
    color: subtleColor,
    align: 'center'
  });
  
  y += 5;
  addText('Thank you for your payment.', 0, y, {
    fontSize: fonts.small.size,
    color: subtleColor,
    align: 'center'
  });
  
  // Add verification QR code placeholder with modern styling
  const qrSize = 20;
  const qrX = pageWidth - margin - qrSize;
  const qrY = pageHeight - 25;
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX, qrY, qrSize, qrSize, 2, 2, 'F');
  
  doc.setDrawColor(subtleColor[0], subtleColor[1], subtleColor[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(qrX, qrY, qrSize, qrSize, 2, 2, 'S');
  
  // QR code label
  addText('VERIFY', qrX + qrSize/2, qrY + qrSize + 5, {
    fontSize: 6,
    color: subtleColor,
    align: 'center'
  });
  
  // Generation timestamp with icon-like element
  doc.setFillColor(subtleColor[0], subtleColor[1], subtleColor[2]);
  doc.circle(margin + 3, pageHeight - 15, 1.5, 'F');
  
  addText(`Generated: ${new Date().toLocaleString()}`, margin + 7, pageHeight - 13, {
    fontSize: fonts.small.size,
    color: subtleColor
  });
  
  // Save the PDF with a name based on receipt number
  const filename = `Receipt-${payment.receipt_number}.pdf`;
  doc.save(filename);
};