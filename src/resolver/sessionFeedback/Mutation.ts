import SessionsFeedBackService, { sessionsFeedBackRR } from './module.service'

const createSessionFeedBack = async (_:any,args:sessionsFeedBackRR.Request):Promise<sessionsFeedBackRR.Response>=>{
	const service = new SessionsFeedBackService()
	return await service.create(args)
}

const editSessionFeedBack = async(_:any,args:sessionsFeedBackRR.Request & {_id:string}):Promise<sessionsFeedBackRR.Response>=>{
	const service = new SessionsFeedBackService()
	return await service.update(args)   
}

export {createSessionFeedBack,editSessionFeedBack}