import mongoose, { Types } from 'mongoose'
import classService from './module.service'
import classes from '@models/schedule/classes.models'
import centerModel from '@models/center.model'
import parents from '@models/parents.model'
import classModel from '@models/schedule/classes.models'
import sessionModel from '@models/schedule/session/sessions.model'
import { IClass } from '@schema/entity.types'

const getAllClass = async () => {
	const services = new classService()
	return await services.fetchAll()
}

const getClass = async (_: any, args: { _id: string }) => {
	const services = new classService()
	return await services.fetchById(args._id)
}
const getClassListByStudentId = async (_: any, args: { studentId: string }) => {
	const services = new classService()
	return await services.getClassListByStudentId(args.studentId)
}
const getClassHistory = async (
	_: any,
	args: { studentId: string; classId: string; historyType: string }
) => {
	const services = new classService()
	return await services.getClassHistory(
		args.studentId,
		args.classId,
		args.historyType
	)
}

interface FilterOptions {
  page: number;
  perPage: number;
  search?: string;
  type?: string;
  classLevel?: string[];
  modes?: string[];
  statuses?: string[];
}

const getAdminAllClasses = async (
	_: any,
	options: FilterOptions
): Promise<{ totalEntries: number; data: any[]; centers: any[] }> => {
	try {
		const { page, perPage, type, search, classLevel, statuses, modes } =
      options
		let centerIds: any[] = []
		const newCenterIds: any[] = []

		if (page <= 0 || perPage <= 0) {
			throw new Error(
				'Invalid page or perPage value. Both must be greater than zero.'
			)
		}
		const allCentersData = await centerModel.find()

		const filter: Record<string, any> = {}

		if (search) {
			const centersData = await centerModel.find({
				centerName: { $regex: search, $options: 'i' },
			})
			centerIds = centersData.map((center) => center._id)
		}
		if (search) {
			filter.$or = [
				{ classType: { $regex: search, $options: 'i' } },
				{ classCode: { $regex: search, $options: 'i' } },
				{ classLevel: { $regex: search, $options: 'i' } },
			]
		}
		if (type) {
			filter.classType = type
		}
		if (classLevel && classLevel.length > 0) {
			filter.classLevel = { $in: classLevel }
		}

		if (modes && modes.length > 0) {
			if (modes.includes('Online')) {
				filter.mode = 'Online'
			} else {
				modes.forEach((center) => {
					if (centerIds.includes(center)) {
						newCenterIds.push(center)
					}
				})
				// centerIds = centerIds.map((center) => center.centerName === )
			}
		}

		if (statuses && statuses.length > 0) {
			const currentDate = new Date()
			const statusFilter = []

			for (const status of statuses) {
				if (status === 'past') {
					statusFilter.push({ toDate: { $lt: currentDate } })
				} else if (status === 'ongoing') {
					statusFilter.push({
						fromDate: { $lte: currentDate },
						toDate: { $gte: currentDate },
					})
				} else if (status === 'upcoming') {
					statusFilter.push({ fromDate: { $gt: currentDate } })
				}
			}

			filter.$or = statusFilter
		}

		if (centerIds.length > 0) filter.center = { $in: centerIds }

		if (newCenterIds.length > 0) filter.center = { $in: newCenterIds }

		// if (search) {
		// 	(filter['students.name'] = { $regex: search, $options: 'i' }),
		// 	(filter['center.name'] = { $regex: search, $options: 'i' })
		// }

		const totalEntries = await classes.countDocuments(filter)
		const startIndex = (page - 1) * perPage
		const data = await classes
			.find(filter)
			.populate('center')
			.populate('students')
			.sort({ _id: -1 })
			.skip(startIndex)
			.limit(perPage)
			.exec()

		const formattedClasses = data.map((classObj) => {
			const currentDate = new Date()
			let currentStatus

			if (classObj.toDate < currentDate) {
				currentStatus = 'PAST'
			} else if (
				classObj.fromDate <= currentDate &&
        classObj.toDate >= currentDate
			) {
				currentStatus = 'ONGOING'
			} else {
				currentStatus = 'UPCOMING'
			}

			return { ...classObj.toObject(), currentStatus }
		})

		return { totalEntries, data: formattedClasses, centers: allCentersData }
	} catch (error: any) {
		throw new Error(`Failed to retrieve paginated : ${error.message}`)
	}
}

const getAdminAllClassCode = async (_: any, options: { type: string, classCode: string}) => {
	try {
		const { type, classCode } = options
		const codes: any = []
		
		let match: any = {$match:{ classType: type ? type : { $ne: null } }}
		if(classCode){
			match = {$match:{ classCode: classCode ? classCode : null }}
		}
		const data = await classes.aggregate([match,{ $group: { _id: '$classCode' } }])
		for (let index = 0; index < data.length; index++) {
			const element = data[index]
			codes.push({label: element._id, value: element._id})
		}
		return codes
	} catch (error: any) {
		throw new Error(`Failed to retrieve paginated : ${error.message}`)
	}
}

const adminGetParentById = async (_: any, id: string): Promise<any> => {
	try {
		const parentData = await parents
			.findOne({ _id: new mongoose.Types.ObjectId(id) })
			.populate({
				path: 'children',
				populate: {
					path: 'classId',
					model: 'Class',
					populate: {
						path: 'center',
						model: 'Center',
					},
				},
			})
			.populate({
				path: 'children',
				populate: {
					path: 'classId',
					model: 'Class',
					populate: {
						path: 'sessions',
						model: 'Session',
						populate: {
							path: 'attendees',
							model: 'Students',
						},
					},
				},
			})
			.lean()

		// const result = []
		if (!parentData) {
			return null
		}
		const result = {
			parent: {
				_id: parentData._id,
				name: parentData.name,
				email: parentData.email,
				phone: parentData.phone,
				image: parentData.image,
				address: parentData.address,
			},

			children: parentData.children.map((child: any) => ({
				_id: child._id,
				name: child.name,
				image: child.image,
				classes: child.classId.map((classItem: any) => {
					const totalSessions = classItem.sessions.length

					const sessionsAttended = classItem.sessions.filter((session: any) =>
						session.attendees?.includes(child._id)
					)

					const sessionsMissed = totalSessions - sessionsAttended.length

					return {
						_id: classItem._id,
						classCode: classItem.classCode,
						level: classItem.classLevel,
						mode: classItem.mode,
						centerName: classItem.center[0]?.centerName,
						centerAddress: classItem.center[0]?.centerAddress,
						centerId: classItem.center[0]?._id,
						fromDate: classItem.fromDate,
						toDate: classItem.toDate,
						sessionsCount: totalSessions,
						sessionsAttended: sessionsAttended.length,
						sessionsMissed,
					}
				}),
			})),
		}
		return result
	} catch (error: any) {
		throw new Error(`Failed to retrieve paginated : ${error.message}`)
	}
}

const adminGetAllCoachClass = async (
	_: any,
	{
		coachId,
		offset,
		limit,
		search,
		sortBy,
		order,
	}: {
    coachId: string;
    offset: number;
    limit: number;
    search?: string;
    sortBy?: string;
    order?: string;
  }
) => {
	const services = new classService()
	return await services.getAllClassByCoachId(
		coachId,
		offset - 1,
		limit,
		search ? search : '',
		sortBy,
		order
	)
}

export const getClassListByCenterId = async (
	_: any,
	params: {
    centerId: string;
    page: number;
    perPage: number;
    search: string;
  }
): Promise<{ data: IClass[]; totalEntries: number }> => {
	const { centerId, page, perPage, search } = params
	const regex = new RegExp(search, 'i')

	const query = {
		center: centerId,
		$or: [
			{ classCode: regex },
			{ classType: regex },
			{ classLevel: regex },
			{ mode: regex },
		],
	}

	const totalEntries = await classModel.countDocuments(query)
	const data = await classModel
		.find(query)
		.skip((page - 1) * perPage)
		.limit(perPage)
		.populate('sessions')
		.populate('students')
		.exec()

	return { data, totalEntries }
}

export const changeClassCenter = async (
	_: any,
	options: { classIds: string[]; currentCenterId: string; newCenterId: string }
) => {
	const { classIds, currentCenterId, newCenterId } = options
	// Update classes with the new center
	const updatedClasses = await classModel.updateMany(
		{ _id: { $in: classIds } },
		{ center: newCenterId },
		{ new: true }
	)

	// Remove current center from classes
	const removedCenter = await centerModel.findByIdAndUpdate(
		currentCenterId,
		{ $pull: { class: { $in: classIds } } },
		{ new: true }
	)

	return updatedClasses && removedCenter ? true : false
}

export const getClassesByLevelAndType = async (
	_: any,
	options: { classLevel: string; classType: string }
) => {
	const { classLevel, classType } = options
	let query = {}

	if (classLevel) {
		query = { classLevel }
	}
	if (classType) {
		query = { classType }
	}

	// Fetch classes data based on query
	const classes = await classModel.find(query).populate('sessions').exec()

	return classes
}

export {
	getAdminAllClassCode,
	getAdminAllClasses,
	getAllClass,
	getClass,
	getClassListByStudentId,
	getClassHistory,
	adminGetParentById,
	adminGetAllCoachClass,
}
