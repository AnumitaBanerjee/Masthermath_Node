import { IClassRequest } from '@schema/entity.types'
import classRequests from '@models/classRequests.model'

enum StatusTypes {
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Pending = 'Pending',
}
export const createClassRequest = async (
	_: any,
	args: {
    requestType: string
    classId: string
    studentId: string
    session: string[]
    preseason: string
  }
): Promise<IClassRequest> => {
	const newData = await classRequests.create({
		...args,
		status: StatusTypes.Pending,
		class: args.classId,
		student: args.studentId,
		sessions: args.session,
	})
	return newData
}


export const clearPaymentsHistory = async (
	_: any,
	args: { studentId: string }
): Promise<boolean> => {
	await classRequests.updateMany(
		{
			student: args.studentId,
		},
		{ isClear: true }
	)
	return true
}


export const deleteClassRequest = async (_: any, args: { _id: string }) => {
	const status = await classRequests.deleteOne({_id:args._id})
	return status.deletedCount === 1
}

export const updateStatusClassRequest = async (_: any, args: { _id: string,status:string,reason:string }) => {
	const filter = { _id: args._id }
	const update = { 
		status: args.status,
		statusReason: args.reason
	}
	const updatedDocument = await classRequests.findOneAndUpdate(filter, update, { new: true })
	if(updatedDocument?._id){
		return true
	}
	return false
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
