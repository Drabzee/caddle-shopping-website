const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    token: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        expires: '60m',
        default: Date.now
    }
});

module.exports = mongoose.model('Token', tokenSchema);