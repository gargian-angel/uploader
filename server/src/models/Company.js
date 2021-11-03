const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String
    },
    pitchDeck: {
        type: String
    }
}, {
    collection: 'companies'
})

module.exports = mongoose.model('Company', companySchema);