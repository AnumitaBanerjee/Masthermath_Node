import centerService, { commentsRR, questionRR } from './module.service'
import { Types } from 'mongoose'

export const createQuestion = async (
	_: any,
	args: questionRR.Request
): Promise<questionRR.Response> => {
	const services = new centerService()
	const newParent = await services.create(args)
	return newParent
}

export const addComment = async (
	_: any,
	args: {
    commentText: string
    questionId: Types.ObjectId
    coachId: Types.ObjectId
    studentId: Types.ObjectId
    userType: string
  }
): Promise<commentsRR.Response> => {
	const services = new centerService()
	const newParent = await services.addComment(args)
	return newParent
}

export const editQuestion = async (
	_: any,
	args: questionRR.Request & { _id: string }
): Promise<questionRR.Response> => {
	const services = new centerService()
	return await services.update(args)
}

export const deleteQuestion = async (_: any, args: { _id: string }) => {
	const services = new centerService()
	const status = await services.deleteById(args._id)
	return status.deletedCount === 1
}

export const coachRemainder = async (_: any, args: { coach_id: string, message:string }) => {
	return true
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
