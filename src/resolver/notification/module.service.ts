import BaseService from '@resolvers/BaseService'
import notification from '@models/notifications/notification.model'
import { INotification } from '@schema/entity.types'
import { announcementUserType, askQuestionLevel, classLevel, classTypes, notificationType, userType } from '@utils/const'
import classModel from '@models/schedule/classes.models'
import userAnnouncementModel from '@models/notifications/userAnnouncement.model'
import studentmodel from '@models/students.model'

export default class notificationService
implements BaseService<notificationRR.Request, notificationRR.Response>
{

	async create(data: notificationRR.Request): Promise<INotification> {
		

		if (!notificationType.includes(data.selectNotificationType)) {
			throw new Error(`
			following options allowed,
			${notificationType.toLocaleString()}
		`)
		}
		
		if (!userType.includes(data.selectTheUser)) {
			throw new Error(`
			following options allowed,
			${announcementUserType.toLocaleString()}
		`)
		}

		if (!classLevel.includes(data.selectClassLevel)) {
			throw new Error(`
			following options allowed,
			${classLevel.toLocaleString()}
		`)
		}

		if (data.selectClassType && !classTypes.includes(data.selectClassType)) {
			throw new Error(`
			following options allowed,
			${classTypes.toLocaleString()}
		`)
		}
		
		const newData = await notification.create({ ...data }) 
		newData.save()

		// Add data to announcemnt table
		let announcementData
		if(newData._id){
			if(data.selectNotificationType === 'Notification'){
				const fetchClassByCode = await classModel.findOne({classCode:data.selectClassCode})
				announcementData = fetchClassByCode?.students?.map(v=>({studentId:'',notificationId:newData._id,global:true}))
			}else{
				const studentsData = await studentmodel.find()
				announcementData = studentsData?.map(v=>({studentId:v.id,notificationId:newData._id,global:false}))
			}
			console.log(announcementData)
			userAnnouncementModel.insertMany(announcementData) 
	
		}
		
		return newData
	}

	async fetchAll(): Promise<notificationRR.Response[]> {
		const response = await notification.find()
		return response
	}

	async fetchById(id: string): Promise<notificationRR.Response> {
		return await notification.findOne({ _id: id }).populate('children')
	}

	async fetchByEmail(email: string): Promise<notificationRR.Response> {
		return await notification.findOne({ email: email })
	}
	async deleteById(id: string): Promise<any> {
		return await notification.deleteOne({ _id: id })
	}

	async update(
		data: notificationRR.Request & { _id: string }
	): Promise<notificationRR.Response> {
		const updatedData: { [key: string]: any } = {}

		if (!data._id.match(/^[0-9a-fA-F]{24}$/)) {
			throw new Error('Invalid ID')
		}

		const existing = await notification.findOne({ _id: data._id })
		if (!existing) {
			throw new Error('notification not found')
		}
		if (!notificationType.includes(data.selectNotificationType)) {
			throw new Error(`
			following options allowed,
			${notificationType.toLocaleString()}
		`)
		}
		if (!announcementUserType.includes(data.selectTheUser)) {
			throw new Error(`
			following options allowed,
			${announcementUserType.toLocaleString()}
		`)
		}
		if (!classLevel.includes(data.selectClassLevel)) {
			throw new Error(`
			following options allowed,
			${classLevel.toLocaleString()}
		`)
		}
		if (!askQuestionLevel.includes(data.selectClassType)) {
			throw new Error(`
			following options allowed,
			${askQuestionLevel.toLocaleString()}
		`)
		}

		Object.entries(data)?.map((entry) => {
			const key = entry[0]
			const value = entry[1]
			if (key !== '_id') {
				updatedData[key] = value
			}
		})

		return await notification.findOneAndUpdate({ _id: data._id }, updatedData)
	}

	async fetchUserAnnouncements(_id:string):Promise<any>{
		const newData = await userAnnouncementModel.find({$or:[{studentId:_id},{global:true}]}).populate('notificationId')
		return newData
	}

	async clearUserAnnouncements(_id:string):Promise<boolean>{
		await userAnnouncementModel.deleteMany({studentId:_id})
		return true
	}
}

export namespace notificationRR {
  export type Request = Omit<INotification, '_id' | 'password'>
  export type Response = INotification | null
}
