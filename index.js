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

import HabitModel from './models/habit';

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || 'localhost';

// Mongoose
mongoose.connect('mongodb://localhost/habit');

// The GraphQL schema in string form
const typeDefs = `
  type Query {
    habits: [Habit]
  }
  type Habit {
    _id: String!
    user: String
    title: String!
  }
  input HabitInput {
    title: String!
  }
  type Mutation {
    createHabit(input: HabitInput!): Habit
    updateHabit(id: String!, input: HabitInput!): Habit
    deleteHabit(id: String!): Habit
  }
`;

// The resolvers
const resolvers = {
  Query: {
    habits: () => HabitModel.find(),
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

// bodyParser is needed just for POST.
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' })); // if you want GraphiQL enabled

app.listen(PORT, HOST, () => console.log(`Now browse to ${HOST}:${PORT}/graphiql`));
