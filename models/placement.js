const mongoose = require('mongoose')

const placementSchema = new mongoose.Schema({
  name: {type: String, required: true},
  rank: {type: Number, min: 1, max: 500, required: true},
  x_power: {type: Number, required: true},
  unique_id: {type: Number, required: true},
  month: {type: Number, min: 1, max: 12, required: true},
  year: {type: Number, min: 2017, required: true}
})

module.exports = mongoose.model('Placement', placementSchema)