import mongoose, { FilterQuery } from 'mongoose'
import ParentsService from './module.service'
import parentmodel from '@models/parents.model'
import { IWhatsappGetMessages } from '@schema/entity.types'
import whatsappMessage from '@utils/whatsappMessage'

const getAllParents = async () => {
	const services = new ParentsService()
	return await services.fetchAll()
}

const getParent = async (_: any, args: { _id: string }) => {
	const services = new ParentsService()
	return await services.fetchById(args._id)
}

const getAdminAllParents = async (
	_: any,
	{ page, perPage, search }: { page: number; perPage: number; search?: string }
): Promise<{ totalEntries: number; data: any[] }> => {
	try {
		if (page <= 0 || perPage <= 0) {
			throw new Error(
				'Invalid page or perPage value. Both must be greater than zero.'
			)
		}

		// Construct the filter query for search filtering
		const filterQuery: FilterQuery<any> = {}
		if (search) {
			filterQuery.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
				{ address: { $regex: search, $options: 'i' } },
				{ phone: { $regex: search, $options: 'i' } },
			]
		}

		// Fetch total count from the data source
		const totalEntries = await parentmodel.countDocuments(filterQuery)

		// Calculate start and end indices for pagination
		const startIndex = (page - 1) * perPage
		// const endIndex = startIndex + perPage

		// Fetch paginated data with search filter from the data source
		const data = await parentmodel
			.find(filterQuery)
			.populate('children')
			.sort({ _id: -1 })
			.skip(startIndex)
			.limit(perPage)

		return { totalEntries, data }
	} catch (error: any) {
		throw new Error(`Failed to retrieve paginated books: ${error.message}`)
	}
}

const getWhatsappMessages = async (
	_: any,
	{
		offset,
		limit,
		studentId,
	}: { offset: number; limit: number; studentId: string }
): Promise<{ data: IWhatsappGetMessages[] }> => {
	try {
		// if (offset <= 0 || limit <= 0) {
		// 	throw new Error('Invalid offset or limit value. Both must be greater than zero.')
		// }
		const parentInfo =  await parentmodel.aggregate([{
			$match: {
				children: new mongoose.Types.ObjectId(studentId)
			},
		},{ $project: { wid: '$wid' } }])
		let getMessages = []
		if(parentInfo.length > 0 && parentInfo[0].wid){
			getMessages = await whatsappMessage.getSentMessage({
				wid: parentInfo[0].wid,
				limit: limit,
				page: offset,
			})
		}
		
		const messages: IWhatsappGetMessages[] = []
		for (let index = 0; index < getMessages.length; index++) {
			const element = getMessages[index]
			messages.push({
				id: element.id,
				type: element.type,
				ack: element.ack,
				isAdminMessage: element.from != parentInfo[0].wid ? true : false,
				date: element.date,
				timestamp: element.timestamp,
				body: element.body,
			})
		}
		return { data: messages }
	} catch (error: any) {
		throw new Error(`Failed to retrieve paginated books: ${error.message}`)
	}
}

export { getAllParents, getParent, getAdminAllParents, getWhatsappMessages }
