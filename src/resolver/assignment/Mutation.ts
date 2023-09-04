import MediaService, { AssignmentServiceRR } from './module.service'

const createAssignment = async (_:any,args:AssignmentServiceRR.Request):Promise<AssignmentServiceRR.Response>=>{
	const mediaService = new MediaService()
	return await mediaService.create(args)
}


const deleteAssignment = async (_:any,args:{_id:string}):Promise<AssignmentServiceRR.Response>=>{
	const mediaService = new MediaService()
	return await mediaService.deleteById(args._id)
}


const addStudentSubmission = async (_:any,args:{_id:string,studentId:string,answerUrl:string}):Promise<boolean>=>{
	const mediaService = new MediaService()
	return await mediaService.addStudentSubmition(args._id,args.studentId,args.answerUrl)
}

export {createAssignment,deleteAssignment,addStudentSubmission}