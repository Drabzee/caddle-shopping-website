const Product = require('../models/product');
const deleteFile = require('../utils/file').deleteFile;

module.exports.fetchAllProducts = (user, cb) => {
    Product.find({user: user}).then(res => {
        cb(res);
    }).catch(err => {
        console.log(err);
    });
};

module.exports.fetchProduct = (id, user, cb) => {
    Product.findOne({_id: id, user: user}).then(res => {
        cb(res);
    }).catch(err => {
        console.log(err);
    });
};

module.exports.saveProduct =  (obj, file, user, cb) => {
    Product({
        title: obj.title,
        image: file.filename,
        price: obj.price,
        qty: obj.qty,
        description: obj.description,
        user: user
    }).save().then(res => {
        cb();
    }).catch(err => {
        console.log(err);
    });
};

module.exports.updateProduct = (obj, file, user, cb) => {
    Product.findOne({ _id: obj.id, user: user}).then(product => {
        product.title = obj.title;
        product.price = obj.price;
        if(file) {
            deleteFile('images/'+product.image);
            product.image = file.filename;
        }
        product.description = obj.description;
        product.qty = obj.qty;
        return product.save();
    }).then(res => {
        cb();
    }).catch(err => {
        console.log(err);
    });
};

module.exports.deleteProduct = (id, user, cb) => {
    Product.findByIdAndDelete({_id: id, user: user}).then(res => {
        deleteFile('images/'+res.image);
        cb();
    }).catch(err => {
        console.log(err);
    });
};