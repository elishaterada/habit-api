// References and Resources
// https://www.npmjs.com/package/apollo-server-koa
// https://www.apollographql.com/docs/apollo-server/example.html
// http://graphql.org/learn/queries/
// http://mongoosejs.com/docs/index.html
// https://coursework.vschool.io/mongoose-crud/

import 'babel-core/register';
import 'babel-polyfill';

import Koa from 'koa';
import KoaRouter from 'koa-router';
import koaBody from 'koa-bodyparser';
import mongoose from 'mongoose';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { makeExecutableSchema } from 'graphql-tools';

import HabitModel from './models/habit';

const app = new Koa();
const router = new KoaRouter();
const PORT = 3000;

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

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

app.use(koaBody());

router.post('/graphql', graphqlKoa({ schema }));

router.get('/graphql', graphqlKoa({ schema }));

router.get('/graphiql', graphiqlKoa({
  endpointURL: '/graphql',
}));

app.use(router.routes());

app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log('Go to http://localhost:3000/graphiql to run queries!');
});
