const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
  name: {type: String, required: true },
  unique_id: { type: String, unique: true, required: true },
  alias: String,
  twitter: String,
  weapons: [String],
  weaponsCount: { type: Number, required: true },
  topTotal: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topTotalScore: Number,
  topShooter: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topShooterScore: Number,
  topBlaster: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topBlasterScore: Number,
  topRoller: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topRollerScore: Number,
  topCharger: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topChargerScore: Number,
  topSlosher: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topSlosherScore: Number,
  topSplatling: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topSplatlingScore: Number,
  topDualies: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topDualiesScore: Number,
  topBrella: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement'
    }
  ], validate: [arrayLimit, '{PATH} exceeds the limit of 4']},
  topBrellaScore: Number
})

function arrayLimit(val) {
  return val.length <= 4
}

module.exports = mongoose.model('Player', playerSchema)