import {
	IEnquire,
	IFormQuestions,
	INewWebsiteContent,
	IWebsiteCenter,
	IWebsiteContent,
	IWebsiteCourse,
	IWebsiteCourseAmount,
	IWebsitePoints,
	IWebsiteSchudle,
} from '@schema/entity.types'
import formQuestionsModel from '@models/websiteQuestions/formQuestions.model'
import WebsiteSchudleModel from '@models/websiteQuestions/websiteSchudle.model'
import WebsiteContentModel from '@models/websiteQuestions/content.model'
import WebsiteCourseModel from '@models/websiteQuestions/websiteCourse.model'
import enquireModel from '@models/websiteQuestions/enquire.modal'
import {
	websiteCenterModel,
	websiteContentModel,
	websiteCourseAmountModel,
	websitePointsModel,
} from '@models/websiteQuestions/websiteContent.modal'

export const getFormQuestions = async (_: any): Promise<IFormQuestions[]> => {
	try {
		const newData = await formQuestionsModel.find().sort({ order: 1} )
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getFormQuestionById = async (
	_: any,
	id: string
): Promise<IFormQuestions | null> => {
	try {
		const newData = await formQuestionsModel.findById({ _id: id })
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const adminFormQuestions = async (
	page: number,
	perPage: number,
	search: string
): Promise<{ data: IFormQuestions[]; total: number }> => {
	try {
		const query: any = {}
		if (search) {
			// Add search condition to query using regular expressions
			query['$or'] = [
				{ question: { $regex: search, $options: 'i' } }, // Replace 'field1' with the actual field names in your data model
				{ type: { $regex: search, $options: 'i' } },
				// Add more fields as needed
			]
		}

		const total = await formQuestionsModel.countDocuments(query)

		const newData = await formQuestionsModel
			.find(query)
			.skip((page - 1) * perPage)
			.limit(perPage)

		return { data: newData, total }
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getWebsiteSchudle = async (_: any): Promise<IWebsiteSchudle[]> => {
	try {
		const newData = await WebsiteSchudleModel.find().sort({ _id: -1 })
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getWebsiteSchudleById = async (
	_: any,
	id: string
): Promise<IWebsiteSchudle | null> => {
	try {
		const newData = await WebsiteSchudleModel.findById({ _id: id })
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const adminWebsiteSchudle = async (
	page: number,
	perPage: number,
	search: string,
	classLevel: string,
	classCode: string,
	className: string
): Promise<{ data: IWebsiteSchudle[]; total: number }> => {
	try {
		const query: any = {}
		if (search) {
			// Add search condition to query using regular expressions
			query['$or'] = [
				{ classLevel: { $regex: search, $options: 'i' } },
				{ classCode: { $regex: search, $options: 'i' } },
				{ className: { $regex: search, $options: 'i' } },
				{ location: { $regex: search, $options: 'i' } },
				{ mode: { $regex: search, $options: 'i' } },
				{ year: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
				// Add more fields as needed
			]
		}

		if (classLevel) {
			query.classLevel = { $regex: classLevel, $options: 'i' }
		}
		if (classCode) {
			query.classCode = { $regex: classCode, $options: 'i' }
		}
		if (className) {
			query.className = { $regex: className, $options: 'i' }
		}

		const total = await WebsiteSchudleModel.countDocuments(query)

		const newData = await WebsiteSchudleModel.find(query)
			.skip((page - 1) * perPage)
			.limit(perPage)

		return { data: newData, total }
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getWebsiteContent = async (_: any): Promise<IWebsiteContent[]> => {
	try {
		const newData = await WebsiteContentModel.find()

		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getWebsiteContentById = async (
	_: any,
	id: string
): Promise<IWebsiteContent | null> => {
	try {
		const newData = await WebsiteContentModel.findById({ _id: id })
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const adminWebsiteContent = async (
	page: number,
	perPage: number,
	search: string
): Promise<{ data: IWebsiteContent[]; total: number }> => {
	try {
		const query: any = {}
		if (search) {
			// Add search condition to query using regular expressions
			query['$or'] = [
				{ contentType: { $regex: search, $options: 'i' } }, // Replace 'field1' with the actual field names in your data model
				{ contentValue: { $regex: search, $options: 'i' } },
				// Add more fields as needed
			]
		}

		const total = await WebsiteContentModel.countDocuments(query)

		const newData = await WebsiteContentModel.find(query)
			.skip((page - 1) * perPage)
			.limit(perPage)

		return { data: newData, total }
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getWebsiteCourseModel = async (
	_: any
): Promise<IWebsiteCourse[]> => {
	try {
		const newData = await WebsiteCourseModel.find().sort({ _id: -1 })
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getActiveWebsiteCourseModel = async (
	_: any
): Promise<IWebsiteCourse[]> => {
	try {
		const query: any = {
			$or: [
				{
					fromDate: {
						$lte: new Date().toISOString(),
					},
					toDate: {
						$gte: new Date().toISOString(),
					},
				},
				{
					fromDate: {
						$gte: new Date().toISOString(),
					},
					toDate: {
						$gte: new Date().toISOString(),
					},
				},
			],
		}
		const newData = await WebsiteCourseModel.find(query)
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getWebsiteCourseModelById = async (
	_: any,
	id: string
): Promise<IWebsiteCourse | null> => {
	try {
		const newData = await WebsiteCourseModel.findById({ _id: id })
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getEnquire = async (_: any): Promise<IEnquire[]> => {
	try {
		const newData = await enquireModel.find()
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}
export const getEnquireById = async (
	_: any,
	id: string
): Promise<IEnquire | null> => {
	try {
		const newData = await enquireModel.findById({ _id: id })
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const adminEnquire = async (
	page: number,
	perPage: number,
	search: string
): Promise<{ data: IEnquire[]; total: number }> => {
	try {
		const query: any = {}
		if (search) {
			// Add search condition to query using regular expressions
			query['$or'] = [
				{ emailAddress: { $regex: search, $options: 'i' } }, // Replace 'field1' with the actual field names in your data model
				{ firstName: { $regex: search, $options: 'i' } },
				{ lastName: { $regex: search, $options: 'i' } },
				{ childFirstName: { $regex: search, $options: 'i' } },
				{ childLastName: { $regex: search, $options: 'i' } },
				// Add more fields as needed
			]
		}

		const total = await enquireModel.countDocuments(query)

		const newData = await enquireModel
			.find(query)
			.skip((page - 1) * perPage)
			.limit(perPage)

		return { data: newData, total }
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getNewWebsiteContent = async (
	_: any
): Promise<INewWebsiteContent[]> => {
	try {
		const newData = await websiteContentModel.find()
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getNewWebsiteContentById = async (
	_: any,
	id: string
): Promise<INewWebsiteContent | null> => {
	try {
		const newData = await websiteContentModel.findById({ _id: id })
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getWebsiteCourseAmountModel = async (
	_: any
): Promise<IWebsiteCourseAmount[]> => {
	try {
		const newData = await websiteCourseAmountModel.find()
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getWebsiteCourseAmountModelById = async (
	_: any,
	id: string
): Promise<IWebsiteCourseAmount | null> => {
	try {
		const newData = await websiteCourseAmountModel.findById({ _id: id })
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}
export const getWebsitePointsModel = async (
	_: any
): Promise<IWebsitePoints[]> => {
	try {
		const newData = await websitePointsModel.find()
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getWebsitePointsModelById = async (
	_: any,
	id: string
): Promise<IWebsitePoints | null> => {
	try {
		const newData = await websitePointsModel.findById({ _id: id })
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getWebsiteCenterModel = async (
	_: any
): Promise<IWebsiteCenter[]> => {
	try {
		const newData = await websiteCenterModel.find()
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getWebsiteCenterModelById = async (
	_: any,
	id: string
): Promise<IWebsiteCenter | null> => {
	try {
		const newData = await websiteCenterModel.findById({ _id: id })
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const websiteScheduleResolver = async (): Promise<any[] | null> => {
	try {
		const result = await WebsiteSchudleModel.aggregate([
			{
				$group: {
					_id: '$className',
					data: { $push: '$$ROOT' },
				},
			},
			{
				$project: {
					_id: 0,
					className: '$_id',
					data: 1,
				},
			},
		])

		return result
	} catch (error) {
		// Handle error
		console.error(error)
		throw new Error('An error occurred while fetching the website schedule.')
	}
}
