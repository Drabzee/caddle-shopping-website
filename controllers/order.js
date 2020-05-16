const Order = require('../models/order');
const Product = require('../models/product');
const invoice = require('../utils/invoice');

module.exports.placeOrder = (user, cb) => {
    const orderItems = [];
    user.cart.items.forEach(item => {
        orderItems.push(Product.findById(item.product).then(product => {
            return ({
                pid: product._id.toString(),
                title: product.title,
                price: product.price,
                qty: item.qty
            });
        }));
    });

    Promise.all(orderItems).then(items => {
        return Order({
            items: items,
            billingAddress: user.address,
            totalPrice: user.cart.totalPrice,
            user: user
        }).save();
    }).then(res => {
        user.cart.items = [];
        user.cart.totalPrice = 0;
        return user.save();
    }).then(res => {
        cb();
    }).catch(err => {
        console.log(err);
    });
}

module.exports.fetchOrders = (user, cb) => {
    Order.find({user: user}, null, {sort: {orderDate: -1}}).then(orders => {
        cb(orders);
    }).catch(err => {
        console.log(err);
    });
}

module.exports.generateInvoice = (req, res) => {
    const orderId = req.params.id;
    const user = req.user;

    Order.findById(orderId).then(order => {
        if(order.user.toString() !== user._id.toString()) return res.redirect('/orders');
        res.setHeader('Content-type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="invoice-' + orderId + '.pdf"');
        invoice(order, user, res);

    }).catch(err => {
        console.log(err);
    });
}