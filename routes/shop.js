const express = require('express');
const router = express.Router();

const prodController = require('../controllers/product');
const cartController = require('../controllers/cart');
const orderController = require('../controllers/order');
const isAuthMiddleware = require('../middlewares/is-auth');

router.get('/', (req, res, next) => {
    res.redirect('/products');
});

router.get('/products', (req, res, next) => {
    prodController.fetchAllProducts(req.query.page, (products, pageCount, currentPage) => {
        res.render('shop/product-list', {
            products: products,
            pageCount: pageCount,
            currentPage: currentPage
        });
    });
});

router.get('/product/:id', (req, res, next) => {
    prodController.fetchProduct(req.params.id, (product) => {
        res.render('shop/product-detail', {product: product});
    });
});

router.get('/cart', isAuthMiddleware, (req, res, next) => {
    cartController.fetchCart(req.user, (items, totalPrice) => {
        res.render('shop/cart', {items: items, totalPrice: totalPrice});
    });
});

router.post('/cart/add-item', isAuthMiddleware,(req, res, next) => {
    cartController.addCartItem(req.user, req.body.id, req.body.price, () => {
        res.redirect('/cart');
    });
});

router.post('/cart/delete-item', isAuthMiddleware,(req, res, next) => {
    cartController.deleteCartItem(req.user, req.body.id, req.body.price, () => {
        res.redirect('/cart');
    });
});

router.get('/orders', isAuthMiddleware,(req, res, next) => {
    orderController.fetchOrders(req.user, (orders) => {
        res.render('shop/orders', {orders: orders});
    });
});

router.post('/orders', isAuthMiddleware,(req, res, next) => {
    orderController.placeOrder(req.user, () => {
        res.redirect('/orders',);
    });
});

router.get('/order/invoice/:id', isAuthMiddleware, (req, res, next) => {
    orderController.generateInvoice(req, res);
});

module.exports = router;