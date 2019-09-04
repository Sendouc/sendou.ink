const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
  youtube_id: {type: String, required: true},
  video_title: {type: String, required: true},
  match_begin_timestamp: {type: Number, required: true},
  upload_timestamp: {type: Number, required: true},
  map: {type: String, required: true},
  mode: {type: String, required: true},
  weapon: {type: String, required: false},
  spec_weapons: {type: [String], required: false},
  spec_unique_ids: {type: [String], required: false},
  unique_id: {type: String, required: false},
  status: {type: String, required: true},
  submitter_id: {type: String, required: true},
  match_type: {type: String, required: true},
  top500: {type: Boolean, required: false},
  alpha_team_name: {type: String, required: false},
  bravo_team_name: {type: String, required: false},
  tournament_name: {type: String, required: false},
})

module.exports = mongoose.model('Video', videoSchema)