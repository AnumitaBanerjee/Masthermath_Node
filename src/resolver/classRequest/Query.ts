import classRequests from '@models/classRequests.model'
import classModel from '@models/schedule/classes.models'
import { Console } from 'console'

interface FilterOptions {
  page: number
  perPage: number
  search?: string
  fromDate?: Date
  toDate?: Date
  classCode?: string[]
  requestType?: string
  status?: string
}

const getClassRequestListByStudentId = async (
	_: any,
	args: { studentId: string }
) => {
	return await classRequests
		.find({
			student: args.studentId,
			isClear: false,
		})
		.populate('sessions')
		.populate('class')
		.populate('student')
}
const getClassRequestList = async (_: any) => {
	const data = await classRequests
		.find()
		.populate('sessions')
		.populate('class')
		.populate('student')
	return await data
}

const getAdminAllClassRequests = async (
	_: any,
	options: FilterOptions
): Promise<{ totalEntries: number; data: any[] }> => {
	try {
		const {
			page,
			perPage,
			search,
			fromDate,
			toDate,
			classCode,
			requestType,
			status,
		} = options
		if (page <= 0 || perPage <= 0) {
			throw new Error(
				'Invalid page or perPage value. Both must be greater than zero.'
			)
		}

		const filters: Record<string, any> = {}

		if (search) {
			filters.$or = [
				{ requestType: { $regex: search, $options: 'i' } },
				{ preseason: { $regex: search, $options: 'i' } },
				{ status: { $regex: search, $options: 'i' } },
			]
		}

		if (fromDate && toDate) {
			filters.created_at = { $gte: fromDate, $lte: toDate }
		}

		if (requestType) {
			filters.requestType = requestType
		}

		if (status === 'Pending') {
			filters.status = status
		}

		if (status === 'All') {
			filters.status = { $ne: 'Pending' }
		}

		const query = await classRequests
			.find(filters)
			.populate('student')
			.populate('class')
			.sort({ _id: -1 })
			.exec()
	
		// Apply JavaScript filters on the retrieved data
		let filteredData = query

		if (classCode && classCode.length > 0) {
			filteredData = filteredData.filter((item: any) =>
				classCode.includes(item.class?.classCode)
			)
		}

		// Apply additional filters as needed using JavaScript filtering

		const totalEntries = filteredData.length

		const startIndex = (page - 1) * perPage

		const paginatedData = filteredData.slice(startIndex, startIndex + perPage)

		return { totalEntries, data: paginatedData }
	} catch (error: any) {
		console.log(error, 'error')

		throw new Error(`Failed to retrieve paginated: ${error.message}`)
	}
}

export {
	getAdminAllClassRequests,
	getClassRequestListByStudentId,
	getClassRequestList,
}
