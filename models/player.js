const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
  name: {type: String, required: true, unique: true },
  alias: String,
  twitter: String,
  weapons: [String],
  topTotal: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topShooter: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topBlaster: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topRoller: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topCharger: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topSlosher: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topSplatling: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topDualies: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topBrella: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
})

function arrayLimit(val) {
  return val.length <= 4
}

module.exports = mongoose.model('Player', playerSchema)