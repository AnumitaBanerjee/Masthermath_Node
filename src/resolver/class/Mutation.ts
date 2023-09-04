import classesService , { classesRR } from './module.service'


export const createClass = async (_:any,args:classesRR.Request ):Promise<classesRR.Response>=>{
	const services = new classesService()
	const newData  =  await services.create(args)
	return newData
}

export const editClass = async (_:any,args:classesRR.Request & {_id:string}):Promise<classesRR.Response>=>{
	const services = new classesService()
	return await services.update(args)
}

export const deleteClass = async (_:any,args:{_id:string})=>{
	const services = new classesService()
	const status =  await services.deleteById(args._id)
	return status.deletedCount === 1
}

export const addStudents = async (_:any,args: { classId: string; studentIds: [string] } & {_id:string}):Promise<classesRR.Response>=>{
	const services = new classesService()
	return await services.addStudents(args)
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
