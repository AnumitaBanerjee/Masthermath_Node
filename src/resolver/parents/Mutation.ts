import globalValidators from '@utils/globalValidators'
import ParentsService, { IParentsRRExtraFields, ParentsRR } from './module.service'
import StudentsService from '@resolvers/students/module.service'
import AuthServices from '@resolvers/auth/module.service'
import parents from '@models/parents.model'
import passwordHasher from '@utils/passwordHasher'
import coachModel from '@models/coach.model'


const createParent = async (_:any,args:ParentsRR.Request & IParentsRRExtraFields ):Promise<ParentsRR.Response>=>{
	const isEmail = globalValidators.validateEmail(args.email)
	const passwordLength = args.password.length

	if(isEmail === null){
		throw new Error('Invalid email format')
	}

	if(passwordLength < 8){
		throw new Error('Password must be atleast 8 char long')
	}

	const studentServices = new StudentsService()
	const parentServices = new ParentsService(studentServices)

	const newParent =  await parentServices.create(args)

	return newParent
}

const editParent = async (_:any,args:ParentsRR.Request & {_id:string}):Promise<ParentsRR.Response>=>{
	const services = new ParentsService()
	return await services.update(args)
}

const deleteParent = async (_:any,args:{_id:string})=>{
	const services = new ParentsService()
	return await services.deleteById(args._id)
}

const resetPassword = async (_:any,args:{currentPassword:string,password:string},ctx:any):Promise<string>=>{
	const authService = new AuthServices()
	const _id= await authService.CheckAuth(ctx.headers['authorization'])

	const services = new ParentsService()
	const res = await services.resetPassword(_id,args.currentPassword,args.password)
	
	if(!res){
		throw new Error('Failed to reset password')
	}

	return 'rest successful'
}

export const resetPasswordWithId = async (_:any,args:{id:string,password:string},ctx:any):Promise<boolean>=>{
	const response = await parents.findById({_id:args.id})
	if(!response){
		throw new Error('No Parent Found')
	}
	let newPass = 'Parent'
	if(args.password){
		newPass = args.password
	}
	const hashPassword = await passwordHasher.hash(newPass,process.env.SALT!)

	response.password = hashPassword
	response.save()
	return true
}


export const resetPasswordWithIdCoach = async (_:any,args:{id:string,password:string},ctx:any):Promise<boolean>=>{
	const response = await coachModel.findById({_id:args.id})
	if(!response){
		throw new Error('No Coach Found')
	}
	let newPass = 'Coach'
	if(args.password){
		newPass = args.password
	}
	const hashPassword = await passwordHasher.hash(newPass,process.env.SALT!)

	response.password = hashPassword
	response.save()
	return true
}

export {createParent,editParent,deleteParent,resetPassword}