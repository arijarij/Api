const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger les fichiers proto pour les films et les séries TV
const gameProtoPath = 'game.proto';
const playerProtoPath = 'player.proto';
const resolvers = require('./resolvers');
const typeDefs = require('./schema');

// Créer une nouvelle application Express
const app = express();
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

// Créer une instance ApolloServer avec le schéma et les résolveurs importés
const server = new ApolloServer({ typeDefs, resolvers });

// Appliquer le middleware ApolloServer à l'application Express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
server.start().then(() => {
    app.use(
        cors(),
        expressMiddleware(server),
    );
});

app.get('/games', (req, res) => {
    const client = new gameProto.GameService('localhost:5000',
        grpc.credentials.createInsecure());
    const { q } = req.query;
    client.searchGames({ query: q }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.games);
        }
    });
});


app.post('/game', (req, res) => {
    const { name, description } = req.body;
    clientGames.createGame({ name: name, description: description }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.game);
        }
    });
});
app.post('/updategame/:id', (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    clientGames.updateGame({ id: id, name: name, description: description }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            
            res.json({'id':id,"name":response.game.name,"description":response.game.description});
        }
    });
});

app.get('/games/:id', (req, res) => {
    const client = new gameProto.GameService('localhost:5000',
        grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getGame({ game_id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({"id":id,"name":response.game.name,"description":response.game.description});
        }
    });
});
app.delete('/deletegames/:id', (req, res) => {
    const client = new gameProto.GameService('localhost:5000',
        grpc.credentials.createInsecure());
    const id = req.params.id;
    client.deleteGame({ game_id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            console.log(response);
            res.json({'message':response});
        }
    });
});

app.get('/players', (req, res) => {
    const client = new playerProto.PlayerService('localhost:50052',
        grpc.credentials.createInsecure());
    const { q } = req.query;
    client.searchPlayers({ query: q }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.players);
        }
    });
});

app.post('/player', (req, res) => {
    const { nom, prenom ,age } = req.body;
    clientPlayers.createPlayer({ nom: nom, prenom: prenom , age:age }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.player);
        }
    });
});

app.get('/players/:id', (req, res) => {
    const client = new playerProto.PlayerService('localhost:50052',
        grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getPlayer({ player_id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.player);
        }
    });
});

// Démarrer l'application Express
const port = 3000;
app.listen(port, () => {
    console.log(`API Gateway en cours d'exécution sur le port ${port}`);
});