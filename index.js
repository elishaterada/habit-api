// References and Resources
// https://www.npmjs.com/package/apollo-server-koa
// https://www.apollographql.com/docs/apollo-server/example.html
// http://graphql.org/learn/queries/
// http://mongoosejs.com/docs/index.html
// https://coursework.vschool.io/mongoose-crud/

import 'babel-core/register';
import 'babel-polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';
import cors from 'cors';

import HabitModel from './models/habit';

require('dotenv').config();

const {
  AUTH0_DOMAIN,
  AUTH0_AUDIENCE,
  PORT,
  HOST,
} = process.env;

if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE) {
  throw 'Make sure you have AUTH0_DOMAIN, and AUTH0_AUDIENCE in your .env file';
}

// Mongoose
mongoose.connect('mongodb://localhost/habit');

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
const jwtCheck = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and
  // the signing keys provided by the JWKS endpoint.
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),

  // Validate the audience and the issuer.
  audience: AUTH0_AUDIENCE,
  issuer: `https://${AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});

// The GraphQL schema in string form
const typeDefs = `
  type Query {
    habits(user: String!): [Habit]
  }
  type Habit {
    _id: String!
    user: String!
    title: String!
  }
  input HabitCreateInput {
    user: String!
    title: String!
  }
  input HabitUpdateInput {
    title: String!
  }
  type Mutation {
    createHabit(input: HabitCreateInput!): Habit
    updateHabit(id: String!, input: HabitUpdateInput!): Habit
    deleteHabit(id: String!): Habit
  }
`;

// The resolvers
const resolvers = {
  Query: {
    habits: (_, { user }) => {
      return HabitModel.find().where('user').eq(user).exec();
    },
  },
  Mutation: {
    createHabit: async (_, { input }) => {
      const newHabit = new HabitModel(input);
      return newHabit.save();
    },
    updateHabit: async (_, { id, input }) => (
      HabitModel.findByIdAndUpdate(
        id,
        input,
        { new: true },
        (err, habit) => {
          if (err) return err;
          return habit;
        },
      )
    ),
    deleteHabit: async (_, { id }) => (
      HabitModel.findByIdAndRemove(id)
    ),
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app = express();
app.use(cors());
app.use(jwtCheck);

// bodyParser is needed just for POST.
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' })); // if you want GraphiQL enabled

app.listen(PORT, HOST, () => console.log(`Now browse to ${HOST}:${PORT}/graphiql`));
