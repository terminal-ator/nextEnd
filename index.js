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
	},
	engine: {
		apiKey: 'service:nuxtBackend:r__63WWxlw39ez6UHvtoWw'
	},
	formatError: error => {
		console.log(error);
		return error;
	},
	formatResponse: resp => {
		console.log(JSON.stringify(resp));
		return resp;
	}
});
server.listen().then(({ url }) => console.log(`Server running on ${url}`));
