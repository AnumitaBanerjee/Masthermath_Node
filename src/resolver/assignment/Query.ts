import MediaService, { AssignmentServiceRR } from './module.service'
import assignmentModel from '@models/assignment.model'

const getClassAssignment = async (
	_: any,
	args: { classId: string }
): Promise<AssignmentServiceRR.Response[]> => {
	const mediaService = new MediaService()
	const data = await mediaService.fetchByClass(args.classId)
	console.log(data)
	return data
}

const getClassAssignmentBySession = async (
	_: any,
	args: { sessionId: string }
): Promise<AssignmentServiceRR.Response[]> => {
	const data = await assignmentModel.find({sessionId:args.sessionId})
	console.log(data)
	return data
}

export { getClassAssignment,getClassAssignmentBySession }
