const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Player = new Schema({
  id: {
    type: String,  
  },
  nom: {
    type: String,  
  },
  prenom: {
    type: String,  
  },
  age: {
    type: String,  
  },
})
const player = mongoose.model('player', Player)

module.exports = player