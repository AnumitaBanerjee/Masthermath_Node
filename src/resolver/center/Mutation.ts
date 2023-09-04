import centerService , { centerRR } from './module.service'


export const createCenter = async (_:any,args:centerRR.Request ):Promise<centerRR.Response>=>{

	const services = new centerService()
	const newParent =  await services.create(args)
	return newParent
}

export const editCenter = async (_:any,args:centerRR.Request & {_id:string}):Promise<centerRR.Response>=>{
	const services = new centerService()
	return await services.update(args)
}

export const deleteCenter = async (_:any,args:{_id:string})=>{
	const services = new centerService()
	const status =  await services.deleteById(args._id)
	return status.deletedCount === 1
}

// const resetPassword = async (_:any,args:{password:string},ctx:any):Promise<string>=>{
// 	const authService = new AuthServices()
// 	const _id= await authService.CheckAuth(ctx.headers['authorization'])

// 	const services = new ParentsService()
// 	const res = await services.resetPassword(_id,args.password)
	
// 	if(!res){
// 		throw new Error('Failed to reset password')
// 	}

// 	return 'rest successful'
// }
