import sessionModel from '@models/schedule/session/sessions.model'
import sessionFeedBackModel from '@models/schedule/session/sessionsFeedback.models'
import studentModel from '@models/students.model'
import BaseService from '@resolvers/BaseService'
import { ISessionFeedBack } from '@schema/entity.types'

export default class SessionsFeedBackService
implements BaseService<sessionsFeedBackRR.Request, sessionsFeedBackRR.Response>
{
	async create(data: sessionsFeedBackRR.Request): Promise<sessionsFeedBackRR.Response> {
        
		const sessionCheck = await sessionModel.findOne({_id:data.sessionId})
        
		if(!sessionCheck){
			throw new Error('Session not found')
		}

		const studentCheck = await studentModel.findOne({_id:data.studentId})

		if(!studentCheck){
			throw new Error('Student not found')
		}

		if(data.feedback === ''){
			throw new Error('feedback cant be null')
		}

		return await sessionFeedBackModel.create(data)
	}

	async update(data: sessionsFeedBackRR.Request & {_id:string}): Promise<sessionsFeedBackRR.Response> {
		const updatedData: { [key: string]: any } = {}

		Object.entries(data)?.map((entry) => {
			const key = entry[0]
			const value = entry[1]
			if (key !== '_id') {
				updatedData[key] = value
			}
		})

		return await sessionFeedBackModel.findOneAndUpdate({ _id: data._id }, updatedData)

	}

	async fetchAll(): Promise<sessionsFeedBackRR.Response[]> {
		return await sessionFeedBackModel.find().populate('sessionId').populate('studentId')
	}

	async fetchById(id:string): Promise<sessionsFeedBackRR.Response> {
		return await sessionFeedBackModel.findOne({_id:id}).populate('sessionId').populate('studentId')
	}

	async deleteById(id: string): Promise<sessionsFeedBackRR.Response> {
		const sessionFeedBack = sessionFeedBackModel.findOne({_id:id})

		if(!sessionFeedBack){
			throw new Error('session not found')
		}

		await sessionFeedBackModel.deleteOne({_id:id})
		return sessionFeedBack
	}

	async getAllSessionFeedBacks(sessionId:string,studentId:string):Promise<sessionsFeedBackRR.Response[]>{
		const fetchFilter: { [key: string]: any } = {}

		if(sessionId){
			fetchFilter['sessionId'] = sessionId
		}

		if(studentId){
			fetchFilter['studentId'] = studentId
		}
        
		return await sessionFeedBackModel.find(fetchFilter).populate('sessionId').populate('studentId')
	}
}

export namespace sessionsFeedBackRR{
    export type Request = Omit<ISessionFeedBack,'_id'>
    export type Response = ISessionFeedBack|null
}