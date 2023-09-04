import { trackNotificationModel } from '@models/notifications/notification.model'
import notificationService , { notificationRR } from './module.service'
import { trackStatus } from '@utils/const'


export const createNotification = async (_:any,args:notificationRR.Request ):Promise<notificationRR.Response>=>{
	const services = new notificationService()
	const newParent =  await services.create(args)
	return newParent
}

export const editNotification = async (_:any,args:notificationRR.Request & {_id:string}):Promise<notificationRR.Response>=>{
	const services = new notificationService()
	return await services.update(args)
}

export const deleteNotification = async (_:any,args:{_id:string})=>{
	const services = new notificationService()
	const status =  await services.deleteById(args._id)
	return status.deletedCount === 1
}

export const clearUserAnnouncements = async (_:any,args:{studentId:string})=>{
	const services = new notificationService()
	const status =  await services.clearUserAnnouncements(args.studentId)
	return status
}

export const updateNotifications = async (_:any,args:{studentId:string, statusType:string,notificationType:string,coachId:string})=>{
	if (!trackStatus.includes(args.statusType)) {
		throw new Error(`
		following options allowed,
		${trackStatus.toLocaleString()}
	`)
	}

	if(!args.studentId && !args.coachId){
		throw new Error('student or coach id needs to be passed in')
	}

	const now = new Date()

	let data
	if(args.studentId){
		data = {
			studentId:args.studentId,
			statusType:args.statusType,
			updated_at:now,
			notificationType:args.notificationType,
		}
	}

	if(args.coachId){
		data = {
			coachId:args.coachId,
			statusType:args.statusType,
			updated_at:now,
			notificationType:args.notificationType,
		}
	}

	const statusUpdate =  await trackNotificationModel.create(data)
	
	return statusUpdate
}