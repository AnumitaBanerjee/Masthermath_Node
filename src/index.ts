import 'module-alias/register'
import Schema from '@schema/index'
import Resolvers from '@resolvers/index'
import startApolloServer from './server'
import mongoose from 'mongoose'

mongoose.connect(process.env.DB_URL!)
	.then(async ()=>{
		console.log('😁 DB connection established')
		startApolloServer(Schema, Resolvers)
	}).catch((err:Error) => {
		console.log('😑 could not connect to DB \n \n')
		console.error(err)
	})