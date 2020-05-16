const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require('path');

function generateHeader(doc) {
    doc
        .image("public/images/logo.jpg", 50, 45, { width: 70 })
        .fillColor("#444444")
        .fontSize(10)
        .font('Helvetica-Bold')
        .text("Caddle Pvt. Ltd.", 0, 70, { align: "right" })
        .font('Helvetica')
        .text("123 Main Street", 0, 85, { align: "right" })
        .text("New York, NY, 10025", 0, 100, { align: "right" })
        .moveDown();
    }

function generateCustomerInformation(doc, order, customer) {
    doc
      .fontSize(30)
      .text('Invoice', 50, 200, {align: "left"})
      .moveTo(50, 240)
      .lineTo(doc.page.width-50, 240)
      .stroke("#888")
      .fontSize(10)
      .text('Order Id: ', 50, 260)
      .text(`#${order._id}`, 120, 260)
      .text('Order Date: ', 50, 280)
      .text(`${order.orderDate.toDateString()}`, 120, 280)
      .text('Total Price: ', 50, 300)
      .text(`$ ${order.totalPrice}`, 120, 300)
      .font('Helvetica-Bold')
      .text(customer.name, 350, 260)
      .font('Helvetica')
      .text(order.billingAddress, 350, 280, {lineGap: 8})
      .moveTo(50, 327)
      .lineTo(doc.page.width-50, 327)
      .stroke("#888");
}

function generateInvoiceTable(doc, items, totalPrice) {
    let i;
    for (i = 0; i < items.length; i++) {
      const item = items[i];
      const position = 410 + (i)*30;

      doc
        .font('Helvetica-Bold')
        .text('SNo.', 50, 370, {lineBreak: false})
        .text('Title',100, 370, {lineBreak: false})
        .text('Unit Cost', doc.page.width-230, 370, {lineBreak: false})
        .text('Qty', doc.page.width-150, 370, {lineBreak: false})
        .text('Total Cost', doc.page.width-100, 370, {lineBreak: false})
        .moveTo(50, 390)
        .lineTo(doc.page.width-50, 390)
        .stroke("#888");

      generateTableRow(
        doc,
        position,
        i+1,
        item.title,
        item.price,
        item.qty,
        ((item.price*item.qty+Number.EPSILON)*100)/100
      );
    }

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Total: ', doc.page.width-230, 410 + (i)*30 + 5, {lineBreak: false})
      .text(`$${totalPrice}`, doc.page.width-105, 410 + (i)*30 + 5, {lineBreak: false});
}

function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
    doc
      .font('Helvetica')
      .text(c1, 55, y)
      .text(c2, 100, y)
      .text(c3, doc.page.width-225, y)
      .text(c4, doc.page.width-145, y)
      .text(c5, doc.page.width-95, y)
      .moveTo(50, y+20)
      .lineTo(doc.page.width-50, y+20)
      .stroke("#aaa")
      .moveDown();
}

module.exports = (order, customer,res) => {
    let doc = new PDFDocument({ margin: 50 });
  
    generateHeader(doc);
    generateCustomerInformation(doc, order, customer);
    generateInvoiceTable(doc, order.items, order.totalPrice);
  
    doc.end();
    // doc.pipe(fs.createWriteStream(path.join('invoices','invoice-' + order._id + '.pdf')));
    doc.pipe(res);
}

