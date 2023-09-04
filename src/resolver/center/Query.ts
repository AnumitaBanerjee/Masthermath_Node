import centerModel from '@models/center.model'
import centerService from './module.service'
import usermodel from '@models/users.modal'
import classModel from '@models/schedule/classes.models'
import { Mongoose } from 'mongoose'

const getAllCenter = async () => {
	const services = new centerService()
	return await services.fetchAll()
}

const getCenter = async (_: any, args: { _id: string }) => {
	const services = new centerService()
	return await services.fetchById(args._id)
}


export const getCenterListPagination = async (
	_: any,
	options: { page: number; perPage: number; id: string; search: string }
) => {
	const { page, perPage, search, id } = options
	const skip = (page - 1) * perPage
	let query = {}

	if (id) {
		query = { _id: id }
	} else {
		query = {
			$or: [
				{ centerName: { $regex: search, $options: 'i' } },
				{ centerAddress: { $regex: search, $options: 'i' } },
				{ centerCode: { $regex: search, $options: 'i' } },
			],
		}
	}

	
	
	const totalCount = await centerModel.countDocuments(query)
	const centerList = await centerModel
		.find(query)
		.skip(skip)
		.limit(perPage)
		.populate('class', '_id')
		.lean()

	const centerIds = centerList.map((center: any) => center._id)

	const staffCounts = await usermodel.aggregate([
		{
			$match: { staffCenter: { $in: centerIds } },
		},
		{
			$group: {
				_id: '$staffCenter',
				staffCount: { $sum: 1 },
			},
		},
	])
	
	const classCounts = await classModel.aggregate([
		{
			$match: { center: { $in: centerIds } },
		},
		{
			$group: {
				_id: '$center',
				classCount: { $sum: 1 },
			},
		},
	])

	const centerListWithCounts = centerList.map((center: any) => {
		const staffCount = staffCounts.find(
			(count: any) => count._id.toString() === center._id.toString()
		)
		const classCount = classCounts.find(
			(count: any) => count._id.toString() === center._id.toString()
		)
		return {
			...center,
			status: true,
			totalClasses: classCount ? classCount.classCount : 0,
			totalStaffs: staffCount ? staffCount.staffCount : 0,
		}
	})

	return {
		data: centerListWithCounts,
		totalentries: totalCount,
	}
}

export { getAllCenter, getCenter }
