const mongoose = require('mongoose')

const maplistSchema = new mongoose.Schema({
  name: {type: String, required: true},
  sz: {type: [String], required: true},
  tc: {type: [String], required: true},
  rm: {type: [String], required: true},
  cb: {type: [String], required: true}
})

module.exports = mongoose.model('Maplist', maplistSchema)