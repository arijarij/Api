const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Game = new Schema({
  id: {
    type: String,  
  },
  name: {
    type: String,  
  },
  description: {
    type: String,  
  },
})
const game = mongoose.model('game', Game)

module.exports = game