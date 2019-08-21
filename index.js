const { GraphQLServer } = require('graphql-yoga');
const { prisma } = require('./generated/prisma-client');
const { ApolloServer } = require('apollo-server');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const cookie = require('cookie');

// moving from graphql-yoga to apollo server


// const authenticate = async (resolve, root, args, context, info) => {
//   const email = context.request.get("authorization");
//   // console.log(email);
//   const user = await prisma.user({ email });
//   context.user = user.email
//   context.prisma = prisma
//   const result = await resolve(root, args, context, info);
//   // console.log(user.name);
//   return result

// }

// const server = new GraphQLServer({
//   typeDefs,
//   resolvers,
//   context: req => ({ ...req }),
//   middlewares: [authenticate]
// })

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    var user = null;
    // console.log(req.headers.cookie);
    const email = req.headers.authorization || '';
    user = await prisma.user({ email });
    // console.log("User found", user);
    // console.log(user ? user.email : "No email")
    return { user, prisma }

    // console.log(email);
  },
})



server.listen().then(({ url }) => console.log(`Server running on ${url}`));