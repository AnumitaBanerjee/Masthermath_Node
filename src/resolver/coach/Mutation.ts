import globalValidators from '@utils/globalValidators'
import CoachService , { CoachRR } from './module.service'
import AuthServices from '@resolvers/auth/module.service'


export const createCoach = async (_:any,args:CoachRR.Request ):Promise<CoachRR.Response>=>{
	const isEmail = globalValidators.validateEmail(args.emailAddress)
	if(isEmail === null){
		throw new Error('Invalid email format')
	}

	const services = new CoachService()

	const newParent =  await services.create(args)

	return newParent
}

export const editCoach = async (_:any,args:CoachRR.Request & {_id:string}):Promise<CoachRR.Response>=>{
	const services = new CoachService()
	return await services.update(args)
}

export const deleteCoach = async (_:any,args:{_id:string})=>{
	const services = new CoachService()
	const status =  await services.deleteById(args._id)
	return status.deletedCount === 1
}

export const resetCoachPassword = async (_:any,args:{currentPassword:string,password:string},ctx:any):Promise<string>=>{
	const authService = new AuthServices()
	const _id= await authService.CheckAuthCoach(ctx.headers['authorization'])

	const services = new CoachService()
	const res = await services.resetPassword(_id,args.password,args.currentPassword)
	
	if(!res){
		throw new Error('Failed to reset password')
	}

	return 'reset successful'
}
