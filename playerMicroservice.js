const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
require('dotenv').config()
const mongoose = require('mongoose')
const Player = require('./models/player')
mongoose.connect(process.env.URI).then(() => console.log('db connected'))
const playerProtoPath = 'player.proto';
const playerProtoDefinition = protoLoader.loadSync(playerProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const playerProto = grpc.loadPackageDefinition(playerProtoDefinition).player;


const playerService = {
    getPlayer: async (call, callback) => {

        const { player_id } = call.request;
        
        console.log(call.request);
        const id= new mongoose.Types.ObjectId(player_id)
        console.log(id);
        try {
            const player = await Player.findOne({"_id":id})
            console.log(player);
            callback(null, {player });
        } catch (error) {
            callback(error);
        }
    },
    searchPlayers: async (call, callback) => {
        try {
            const playerdb = await Player.find({})
            const players = playerdb.map((item) => {
                const convertedItem = { "nom":item.nom,"prenom":item.prenom,"id":"", "age":item.age };
                convertedItem.id = item._id.toString();
                return convertedItem;
              });

            callback(null, {players});
        } catch (error) {
            callback(error);
        }
    },
    createPlayer: (call, callback) => {
        console.log(call.request);
        const { nom, prenom, age } = call.request;
        try {
            const x = new Player({  nom, prenom, age  })
            console.log(x);
            x.save().then((test) => {
                console.log(test);
                const player = {"id":test._id,"nom":test.nom,"prenom":test.prenom,"age":test.age}
                callback(null, { player });
              })
        } catch (error) {
            callback(error);
        }
    },
};

const server = new grpc.Server();
server.addService(playerProto.PlayerService.service, playerService);
const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Failed to bind the server:', err);
        return;
    }
    console.log(`The server is running on port ${port}`);
    server.start();
});

console.log(`playermicroservice is running on port ${port}`);
