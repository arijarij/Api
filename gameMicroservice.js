const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
require('dotenv').config()
const mongoose = require('mongoose')
const Freelancers = require('./models/game')
mongoose.connect(process.env.URI).then(() => console.log('db connected'))
const gameProtoPath = 'game.proto';
const gameProtoDefinition = protoLoader.loadSync(gameProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const gameProto = grpc.loadPackageDefinition(gameProtoDefinition).game;

const gameService = {
    getGame: async (call, callback) => {
        const { game_id } = call.request;
        const id= new mongoose.Types.ObjectId(game_id)
        try {
            const game = await Freelancers.findOne({"_id":id})
            console.log(game);
            callback(null, {game });
        } catch (error) {
            callback(error);
        }
    },
    deleteGame: async (call, callback) => {
        const { game_id } = call.request;
        const id= new mongoose.Types.ObjectId(game_id)
        try {
            const game = await Freelancers.deleteOne({"_id":id}).then((result) => {
                if (result.deletedCount > 0) {
                  console.log('game deleted successfully.');
                  const deleted = "game deleted successfully."
                  callback(null, {deleted });
                } else {
                  console.log(result);
                  const deleted = "game not found"
                  callback(null, {deleted});
                }
              })
        } catch (error) {
            callback(error);
        }
    },
    searchGames: async (call, callback) => {
        try {
            const gamesDB = await Freelancers.find({})
            const games = gamesDB.map((item) => {
                const convertedItem = { "name":item.name,"description":item.description,"id":"" };
                convertedItem.id = item._id.toString();
                return convertedItem;
              });
            callback(null, {games});
        } catch (error) {
            callback(error);
        }
    },
    createGame: async(call, callback) => {
        const { name, description } = call.request;
        try {
            const x = new Freelancers({ name, description })
            x.save().then((test) => {
                console.log(test);
                const game = {"id":test._id,"name":test.name,"description":test.description}
                callback(null, { game });
              })
        } catch (error) {
            callback(error);
        }
    },
    updateGame: async(call, callback) => {
        console.log( call.request);
        const { id,name, description  } = call.request;
        const _id= new mongoose.Types.ObjectId(id)
        try {
            const game = await Freelancers.findOne({"_id":_id})
            game.name=name ;
            game.description=description;
            await game.save();
            callback(null, { game });
        } catch (error) {
            callback(error);
        }
    },
};

const server = new grpc.Server();
server.addService(gameProto.GameService.service, gameService);
const port = 5000;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Failed to bind the server:', err);
        return;
    }
    console.log(`The server is running on port ${port}`);
    server.start();
});

console.log(`game microservice is running on port ${port}`);
