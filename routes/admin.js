const express = require('express');
const router = express.Router();

const prodController = require('../controllers/product');
const adminController = require('../controllers/admin');
const isAuthMiddleware = require('../middlewares/is-auth');

router.get('/add-product/:id', isAuthMiddleware,(req, res, next) => {
    adminController.fetchProduct(req.params.id, req.user,(product) => {
        res.render('admin/add-product', {product: product, successMsg: req.flash('success'), errorMsg: req.flash('error')});
    });
});

router.get('/add-product', isAuthMiddleware,(req, res, next) => {
    res.render('admin/add-product', {product: null, successMsg: req.flash('success'), errorMsg: req.flash('error')});
});

router.post('/add-product', isAuthMiddleware,(req, res, next) => {
    if(!req.file) {
        req.flash('error', 'Invalid file uploaded');
        return res.redirect('/admin/add-product');
    }
    adminController.saveProduct(req.body, req.file, req.user, () => {
        res.redirect('/admin/products');
    });
});

router.post('/update-product', isAuthMiddleware,(req, res, next) => {
    adminController.updateProduct(req.body, req.file, req.user, () => {
        res.redirect('/admin/products');
    });
});

router.post('/delete-product', isAuthMiddleware,(req, res, next) => {
    adminController.deleteProduct(req.body.id, req.user, () => {
        res.redirect('/admin/products');
    });
});

router.get('/products', isAuthMiddleware,(req, res, next) => {
    adminController.fetchAllProducts(req.user, (products) => {
        res.render('admin/admin-product-list', {products: products});
    });
});

module.exports = router;