const mongoose = require('mongoose')

const buildSchema = new mongoose.Schema({
  discord_id: {type: String, required: true},
  weapon: {type: String, required: true},
  title: {type: String},
  headgear: {type: [String], required: true},
  clothing: {type: [String], required: true},
  shoes: {type: [String], required: true}
}, { timestamps: true })

module.exports = mongoose.model('Build', buildSchema)