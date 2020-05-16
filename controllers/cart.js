
module.exports.fetchCart = (user, cb) => {
    user.populate('cart.items.product').execPopulate().then(res => {
        cb(res.cart.items, res.cart.totalPrice);
    });
}

module.exports.addCartItem = (user, id, price, cb) => {
    let flag = false;
    user.cart.items.forEach(item => {
        if(item.product == id) {
            item.qty += 1;
            flag = true;
        }
    });
    if(!flag) user.cart.items.push({product: id, qty: 1});

    user.cart.totalPrice += +price;
    user.cart.totalPrice = Math.round((user.cart.totalPrice+Number.EPSILON)*100)/100;
    user.save().then(res => {
        cb();
    }).catch(err => {
        console.log(err);
    });
}

module.exports.deleteCartItem = (user, id, price, cb) => {
    user.cart.items = user.cart.items.filter(prod => prod.product != id);
    user.cart.totalPrice -= +price;
    user.cart.totalPrice = Math.round((user.cart.totalPrice+Number.EPSILON)*100)/100;
    user.save().then(res => {
        cb();
    }).catch(err => {
        console.log(err);
    });
}