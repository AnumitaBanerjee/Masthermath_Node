import { IBankAccountInfo } from '@schema/entity.types'
import StudentsService, { StudentBankDetailsRR, StudentCardDetailsRR, StudentsRR } from './module.service'
import AuthServices from '@resolvers/auth/module.service'

const createStudent = async (_:any,args:StudentsRR.Request):Promise<StudentsRR.Response>=>{
	const services = new StudentsService()
	console.log('dfbsdbfisdfidsuh')
	return await services.create(args)
}


const editStudent = async (_:any,args:StudentsRR.Request & {_id:string}):Promise<StudentsRR.Response>=>{
	const services = new StudentsService()
	return await services.update(args)
}

const deleteStudent = async (_:any,args:{_id:string})=>{
	const services = new StudentsService()
	return await services.deleteById(args._id)
}

const addBankDetails = async (_:any,args:StudentBankDetailsRR.Request & {studentId:string},ctx:any):StudentBankDetailsRR.Response=>{
	const authService = new AuthServices()
	// await authService.CheckAuth(ctx.headers['authorization'])

	const services = new StudentsService()
	return await services.addBankDetails(args.studentId,{...args})
}

const addCardDetails = async (_:any,args:StudentCardDetailsRR.Request & {studentId:string},ctx:any):StudentCardDetailsRR.Response=>{
	const authService = new AuthServices()
	// await authService.CheckAuth(ctx.headers['authorization'])

	const services = new StudentsService()
	return await services.addCardDetails(args.studentId,args)
}

const deleteCardDetails = async(_:any,args:{studentId:string,_id:string},ctx:any)=>{
	const authService = new AuthServices()
	await authService.CheckAuth(ctx.headers['authorization'])

	const services = new StudentsService()
	return await services.deleteCardDetails(args.studentId,args._id)
}

const deleteBankDetails = async(_:any,args:{studentId:string,_id:string},ctx:any)=>{
	const authService = new AuthServices()
	await authService.CheckAuth(ctx.headers['authorization'])

	const services = new StudentsService()
	return await services.deleteBankDetails(args.studentId,args._id)
}

const editStudentWithImage = async(_:any,args:StudentsRR.Request & {_id:string},ctx:any):Promise<StudentsRR.Response>=>{
	const authService = new AuthServices()
	await authService.CheckAuth(ctx.headers['authorization'])

	const services = new StudentsService()
	return await services.update(args)
}





export {createStudent,editStudent,deleteStudent,editStudentWithImage}
// payment info apis
export {addBankDetails,addCardDetails,deleteCardDetails,deleteBankDetails}