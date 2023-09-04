import SessionsFeedBackService, { sessionsFeedBackRR } from './module.service'

const getAllSessionFeedBack = async(_:any,args:{sessionId:string,studentId:string}):Promise<sessionsFeedBackRR.Response[]>=>{
	const service = new SessionsFeedBackService()
	return await service.getAllSessionFeedBacks(args.sessionId,args.studentId)
}

const getSessionFeedBack = async(_:any,args:{_id:string}):Promise<sessionsFeedBackRR.Response>=>{
	const service = new SessionsFeedBackService()
	return await service.fetchById(args._id)
}

export {getAllSessionFeedBack,getSessionFeedBack}