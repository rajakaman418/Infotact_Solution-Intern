const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const Store = require('../models/Store');
const Product = require('../models/Product');
const asyncHandler = require('../middlewares/asyncHandler');

async function buildInvoice(orderId) {
  const order = await Order.findById(orderId).lean();

  if (!order) {
    return null;
  }

  const store = await Store.findById(order.storeId).lean();

  const enrichedItems = [];

  for (const item of order.items || []) {
    const product = await Product.findById(item.productId).lean();

    enrichedItems.push({
      productId: item.productId,
      variantId: item.variantId,
      sku: item.sku,
      productTitle: product ? product.title : 'Unknown Product',
      quantity: item.quantity,
      unitPrice: item.price,
      lineTotal: item.quantity * item.price,
    });
  }

  return {
    invoiceNumber: `INV-${order.orderNumber}`,
    orderId: order._id,
    orderNumber: order.orderNumber,
    issuedAt: order.createdAt,
    channel: order.channel,
    status: order.status,

    store: store
      ? {
          id: store._id,
          name: store.name,
          code: store.code,
          type: store.type,
          address: store.address,
        }
      : null,

    cashierId: order.cashierId,
    customerId: order.customerId,

    items: enrichedItems,

    totals: {
      subtotal: order.subtotal,
      discountTotal: order.discountTotal,
      taxTotal: order.taxTotal,
      grandTotal: order.grandTotal,
    },

    payments: order.payments || [],
    promotionCode: order.promotionCode || '',
  };
}

exports.getInvoiceByOrderId = asyncHandler(async (req, res) => {
  const invoice = await buildInvoice(req.params.orderId);

  if (!invoice) {
    return res.status(404).json({ message: 'Order not found' });
  }

  res.json({
    message: 'Invoice fetched successfully',
    invoice,
  });
});

exports.downloadInvoicePdf = asyncHandler(async (req, res) => {
  const invoice = await buildInvoice(req.params.orderId);

  if (!invoice) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
  });

  const safeStoreName = (invoice.store?.name || 'store')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');

  const safeInvoiceNumber = String(invoice.invoiceNumber).replace(/[^\w-]/g, '_');
  const filename = `${safeStoreName}_${safeInvoiceNumber}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);

  // Header
  doc.fontSize(22).text('Retail POS Invoice', { align: 'center' });
  doc.moveDown(0.8);

  doc.fontSize(11);
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
  doc.text(`Order Number: ${invoice.orderNumber}`);
  doc.text(`Issued At: ${new Date(invoice.issuedAt).toLocaleString()}`);
  doc.text(`Channel: ${invoice.channel}`);
  doc.text(`Status: ${invoice.status}`);
  doc.moveDown();

  // Store details
  doc.fontSize(14).text('Store Details');
  doc.moveDown(0.4);
  doc.fontSize(11);

  if (invoice.store) {
    doc.text(`Name: ${invoice.store.name}`);
    doc.text(`Code: ${invoice.store.code}`);
    doc.text(`Type: ${invoice.store.type}`);
    doc.text(`Address: ${invoice.store.address}`);
  } else {
    doc.text('Store information not available');
  }

  doc.moveDown();

  // Items
  doc.fontSize(14).text('Items');
  doc.moveDown(0.5);

  let y = doc.y;
  const col1 = 40;
  const col2 = 230;
  const col3 = 320;
  const col4 = 380;
  const col5 = 460;

  doc.fontSize(10);
  doc.text('Product', col1, y);
  doc.text('SKU', col2, y);
  doc.text('Qty', col3, y);
  doc.text('Price', col4, y);
  doc.text('Total', col5, y);

  y += 18;
  doc.moveTo(40, y).lineTo(555, y).stroke();
  y += 8;

  for (const item of invoice.items) {
    if (y > 730) {
      doc.addPage();
      y = 50;
    }

    doc.text(item.productTitle, col1, y, { width: 170 });
    doc.text(item.sku, col2, y, { width: 70 });
    doc.text(String(item.quantity), col3, y, { width: 40 });
    doc.text(String(item.unitPrice), col4, y, { width: 60 });
    doc.text(String(item.lineTotal), col5, y, { width: 70 });

    y += 22;
  }

  doc.y = y + 8;
  doc.moveDown();

  // Totals
  doc.fontSize(14).text('Totals');
  doc.moveDown(0.4);
  doc.fontSize(11);
  doc.text(`Subtotal: ${invoice.totals.subtotal}`);
  doc.text(`Discount: ${invoice.totals.discountTotal}`);
  doc.text(`Tax: ${invoice.totals.taxTotal}`);
  doc.text(`Grand Total: ${invoice.totals.grandTotal}`);

  doc.moveDown();

  // Payments
  doc.fontSize(14).text('Payment Details');
  doc.moveDown(0.4);
  doc.fontSize(11);

  if (invoice.payments.length) {
    invoice.payments.forEach((payment, index) => {
      doc.text(
        `${index + 1}. Method: ${payment.method}, Amount: ${payment.amount}, Reference: ${payment.reference || '-'}`
      );
    });
  } else {
    doc.text('No payment records available');
  }

  if (invoice.promotionCode) {
    doc.moveDown();
    doc.text(`Promotion Code: ${invoice.promotionCode}`);
  }

  doc.moveDown(2);
  doc.fontSize(10).text('Thank you for your purchase.', { align: 'center' });

  doc.end();
});