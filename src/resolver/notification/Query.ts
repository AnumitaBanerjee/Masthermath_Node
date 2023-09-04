import notificationModel, {
	trackNotificationModel,
} from '@models/notifications/notification.model'
import notificationService from './module.service'

const getAllNotification = async () => {
	const services = new notificationService()
	return await services.fetchAll()
}

const getNotification = async (_: any, args: { _id: string }) => {
	const services = new notificationService()
	return await services.fetchById(args._id)
}

const getUserAnnouncements = async (
	_: any,
	args: { studentId: string },
	ctx: any
) => {
	const services = new notificationService()
	const status = await services.fetchUserAnnouncements(args.studentId)
	console.log(status, 'xsuh')
	return status
}

const getNotificationsByStudentId = async (
	_: any,
	args: { studentId: string; notificationType: string }
) => {
	if (!args.notificationType) {
		throw new Error('Provide Notification Type')
	}

	const services = await notificationModel.find({
		selectNotificationType: args.notificationType,
	})

	const latestDoc = await trackNotificationModel
		.find(
			{ studentId: args.studentId, statusType: 'isCleared' }
			// { sort: { updated_at: -1 } }
		)
		.sort({ $natural: -1 })
		.limit(1)

	const latestDocIsMarked = await trackNotificationModel
		.find(
			{ studentId: args.studentId, statusType: 'isMarked' }
			// { sort: { updated_at: -1 } }
		)
		.sort({ $natural: -1 })
		.limit(1)

	if (latestDoc.length > 0) {
		const filtered = services.filter((item) => {
			return item.created_at > latestDoc[0]?.updated_at
		})

		const newData = {
			notifications: filtered,
			isCleardDate: latestDocIsMarked[0],
		}
		// console.log(newData,'newData')

		return await newData
	}

	const newData = {
		notifications: services,
		isCleardDate: latestDocIsMarked[0],
	}
	return await newData
}

const deleteAllNotifications = async (_: any, args: any, ctx: any) => {
	const latestDoc = await notificationModel.deleteMany()
	return true
}

const getNotificationsByCoachId = async (
	_: any,
	args: { coachId: string; notificationType: string }
) => {
	if (!args.notificationType) {
		throw new Error('Provide Notification Type')
	}

	const services = await notificationModel.find({
		selectNotificationType: args.notificationType,
	})

	const latestDoc = await trackNotificationModel
		.find(
			{ coachId: args.coachId, statusType: 'isCleared' }
			// { sort: { updated_at: -1 } }
		)
		.sort({ $natural: -1 })
		.limit(1)

	const latestDocIsMarked = await trackNotificationModel
		.find(
			{ coachId: args.coachId, statusType: 'isMarked' }
			// { sort: { updated_at: -1 } }
		)
		.sort({ $natural: -1 })
		.limit(1)

	if (latestDoc.length > 0) {
		const filtered = services.filter((item) => {
			return item.created_at > latestDoc[0]?.updated_at
		})
		const newData = {
			notifications: filtered,
			isCleardDate: latestDocIsMarked[0],
		}

		return await newData
	}

	const newData = {
		notifications: services,
		isCleardDate: latestDocIsMarked[0],
	}

	return await newData
}


export const getNotificationsPagination = async (
	_: any,
	options: {
    search: string
    userType: string
    notificationType: string
    classCode: string
    page: number
    perPage: number
  }
) => {
	const { classCode, notificationType, page, perPage, search, userType } =
    options
	const query: any = {}

	// Add search parameter to query
	if (search) {
		query.$or = [
			{ selectClassLevel: { $regex: search, $options: 'i' } },
			{ selectClassType: { $regex: search, $options: 'i' } },
			{ selectClassCode: { $regex: search, $options: 'i' } },
			{ addDescription: { $regex: search, $options: 'i' } },
			{ 'sesions.$': { $regex: search, $options: 'i' } },
			{ insertLink: { $regex: search, $options: 'i' } },
		]
	}

	if (notificationType) {
		query.selectNotificationType = { $regex: notificationType, $options: 'i' }
	}
	// Add userType parameter to query
	if (userType) {
		query.selectTheUser = userType
	}

	// Add classCode parameter to query
	if (classCode) {
		query.selectClassCode = classCode
	}

	// Fetch total entries count
	const totalentries = await notificationModel.countDocuments(query)


	// Fetch data based on query, page, and perPage
	const data = await notificationModel
		.find(query)
		.sort({ _id: -1 })
		.skip((page - 1) * perPage)
		.limit(perPage)
		.exec()
	console.log(data,'data')
	return {
		data,
		totalentries,
	}
}



export {
	getAllNotification,
	getNotification,
	getNotificationsByStudentId,
	getUserAnnouncements,
	getNotificationsByCoachId,
	deleteAllNotifications,
}
