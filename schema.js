const { gql } = require('@apollo/server');
// Définir le schéma GraphQL
const typeDefs = `#graphql
    type Game {
        id: String!
        name: String!
        description: String!
    }
    type Player {
        id: String!
        nom: String!
        prenom: String!
        age: String!
    }
    type Query {
        game(id: String!): Game
        games: [Game]
        player(id: String!): Player
        players: [Player]
    }
    type Mutation {
        createGame(name: String!, description: String!): Game
        createPlayer(nom: String!, prenom: String!,age: String!): Player
    }
`;
module.exports = typeDefs