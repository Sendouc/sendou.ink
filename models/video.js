const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
  youtube_id: {type: String, required: true},
  video_title: {type: String, required: true},
  match_begin_timestamp: {type: Number, required: true},
  upload_timestamp: {type: Number, required: true},
  map: {type: String, required: true},
  mode: {type: String, required: true},
  weapon: {type: String, required: false},
  unique_id: {type: String, required: false},
  status: {type: String, required: true},
  submitter_id: {type: String, required: true},
  match_type: {type: String, required: true},
  top500: {type: Boolean, required: false},
  spec_pov: {type: Boolean, default: false, required: false}
})

module.exports = mongoose.model('Video', videoSchema)