const { prisma } = require('./generated/prisma-client');
const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: async ({ req }) => {
		var user = null;
		const email = req.headers.authorization || '';
		user = await prisma.user({ email });
		return { user, prisma };
	}
});
server.listen().then(({ url }) => console.log(`Server running on ${url}`));
