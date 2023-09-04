import express from 'express'
import http from 'http'
import { ApolloServer } from 'apollo-server-express'
import { 
	ApolloServerPluginDrainHttpServer,
	ApolloServerPluginLandingPageProductionDefault,
	ApolloServerPluginLandingPageLocalDefault 
} from 'apollo-server-core'
import serverConfig from '@config/server.json'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import * as dotenv from 'dotenv'
import applyRoute from './routes/applyRoute'
import { PubSub } from 'graphql-subscriptions'
import cors from 'cors'
import path from 'path'

const rootFolderPath = path.resolve(__dirname, '../../landing-page', 'index.html')

console.log('Root folder path:', rootFolderPath)
const pubsub = new PubSub()
dotenv.config()

async function startApolloServer(schema: any, resolvers: any) {
	const app = express()
	
	app.use(cors())
	
	const newSchema = makeExecutableSchema({ typeDefs: schema, resolvers })

	const httpServer = http.createServer(app)
	
	app.use('/uploads', express.static('uploads'))
	
	
	applyRoute(app)

	
	const wsServer = new WebSocketServer({
		server: httpServer,
		path: '/graphql',
	})
	const serverCleanup = useServer({ schema:newSchema }, wsServer)

	const server = new ApolloServer({
		typeDefs: newSchema,
		resolvers,
		plugins: [
			ApolloServerPluginDrainHttpServer({ httpServer }), // used to shut down apollo server 
			ApolloPreventRedirectPlugin,
			{
				async serverWillStart() {
					return {
						async drainServer() {
							await serverCleanup.dispose()
						},
					}
				},
			},
		],
		// global ctx
		context: ({ req }) => {
			const headers = req.headers
			return { headers, pubsub }
		},
		introspection:true
	}) as any

	await server.start() //start the GraphQL server.
	server.applyMiddleware({ app })

	await new Promise<void>((resolve) =>
		httpServer.listen({ port: serverConfig.port }, resolve) //run the server on port 4000
	)

	console.log(`🚀 Server ready at http://localhost:${serverConfig.port}${server.graphqlPath}`)
}



// Plugins to use apollo graphql studio on host domain
const ApolloProductionExplorerPlugin = ApolloServerPluginLandingPageProductionDefault({
	embed: true,
	graphRef: 'plaid-gufzoj@current'
})

const ApolloLocalExplorerPlugin = ApolloServerPluginLandingPageLocalDefault({ embed: true })

const ApolloPreventRedirectPlugin = process.env.NODE_ENV === 'production'
	? ApolloProductionExplorerPlugin
	: ApolloLocalExplorerPlugin




export default startApolloServer
