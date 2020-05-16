const Product = require('../models/product');

module.exports.fetchAllProducts = (pageNo, cb) => {

    const PROD_PER_PAGE = 6;
    let pageCount;

    Product.find().countDocuments().then(length => {
          pageCount = Math.ceil(length/PROD_PER_PAGE);
          return Product.find().skip((pageNo-1)*PROD_PER_PAGE).limit(PROD_PER_PAGE);
      })
      .then(res => {
          cb(res, pageCount, pageNo ? pageNo : 1);
      }).catch(err => {
          console.log(err);
      });
};

module.exports.fetchProduct = (id, cb) => {
    Product.findOne({_id: id}).then(res => {
        cb(res);
    }).catch(err => {
        console.log(err);
    });
};