// References and Resources
// https://www.npmjs.com/package/apollo-server-koa
// https://www.apollographql.com/docs/apollo-server/example.html
// http://graphql.org/learn/queries/

import Koa from 'koa';
import KoaRouter from 'koa-router';
import koaBody from 'koa-bodyparser';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { makeExecutableSchema } from 'graphql-tools';

const app = new Koa();
const router = new KoaRouter();
const PORT = 3000;

// Some fake data
const books = [
  {
    title: "Harry Potter and the Sorcerer's stone",
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

// The GraphQL schema in string form
const typeDefs = `
  type Query { books: [Book] }
  type Book { title: String, author: String }
`;

// The resolvers
const resolvers = {
  Query: { books: () => books },
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
