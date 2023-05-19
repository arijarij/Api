const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger les fichiers proto pour les films et les séries TV
const gameProtoPath = 'game.proto';
const playerProtoPath = 'player.proto';

const gameProtoDefinition = protoLoader.loadSync(gameProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const playerProtoDefinition = protoLoader.loadSync(playerProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const gameProto = grpc.loadPackageDefinition(gameProtoDefinition).game;
const playerProto = grpc.loadPackageDefinition(playerProtoDefinition).player;

const clientGames = new gameProto.GameService('localhost:5000', grpc.credentials.createInsecure());
const clientPlayers = new playerProto.PlayerService('localhost:50052', grpc.credentials.createInsecure());

// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
    Query: {
        game: (_, { id }) => {
            // Effectuer un appel gRPC au microservice de films
            const client = new gameProto.GameService('localhost:5000',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getGame({ game_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.game);
                    }
                });
            });
        },
        games: () => {
            // Effectuer un appel gRPC au microservice de films
            const client = new gameProto.GameService('localhost:5000',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchGames({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.games);
                    }
                });
            });
        },

        player: (_, { id }) => {
            // Effectuer un appel gRPC au microservice de séries TV
            const client = new playerProto.PlayerService('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getPlayer({ player_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.player);
                    }
                });
            });
        },

        players: () => {
            // Effectuer un appel gRPC au microservice de séries TV
            const client = new playerProto.PlayerService('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchPlayers({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.players);
                    }
                });
            });
        },
    },
    Mutation: {
        createGame: (_, { id, name, description }) => {
            return new Promise((resolve, reject) => {
                clientGames.createGame({ game_id: id, name: name, description: description }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.game);
                    }
                });
            });
        },
        createPlayer: (_, { id, title, description }) => {
            return new Promise((resolve, reject) => {
                clientPlayers.createPlayer({ player_id: id, title: title, description: description }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.player);
                    }
                });
            });
        },
    }
};

module.exports = resolvers;