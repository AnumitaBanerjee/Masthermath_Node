import mediaModel from '@models/media.model'
import BaseService from '@resolvers/BaseService'
import { IMedia } from '@schema/entity.types'
import { mediaAccessType } from '@utils/const'
import { isValidObjectId } from 'mongoose'

interface IMediaService {
  fetchByClass(classId: string): Promise<MediaServiceRR.Response[]>
}

export default class MediaService extends BaseService implements IMediaService {
	async create(data: MediaServiceRR.Request): Promise<MediaServiceRR.Response> {
		if (!isValidObjectId(data.classId)) {
			throw new Error('Invalid class ID')
		}

		if (data.docType === null || data.docType === '') {
			throw new Error('Invalid DocType')
		}

		if (!mediaAccessType.includes(data.mediaAccess)) {
			throw new Error(`
            Only supported formats are
            ${mediaAccessType}
            `)
		}

		// if(!/^(ftp|http|https):\/\/[^ "]+$/.test(data.mediaUrl)){
		// 	throw new Error('Invalid url')
		// }

		if (
			data.mediaUrl === '' ||
      data.mediaUrl === null ||
      data.mediaUrl === undefined
		) {
			throw new Error('Invalid S3 Key')
		}

		return await mediaModel.create(data)
	}

	async fetchAll(): Promise<MediaServiceRR.Response[]> {
		return await mediaModel.find()
	}

	async fetchById(id: string): Promise<MediaServiceRR.Response> {
		return await mediaModel.findOne({ _id: id })
	}

	async update(
		data: MediaServiceRR.Request & { _id: string }
	): Promise<MediaServiceRR.Response> {
		const updatedData: { [key: string]: any } = {}

		Object.entries(data)?.map((entry) => {
			const key = entry[0]
			const value = entry[1]
			if (key !== '_id') {
				updatedData[key] = value
			}
		})

		return await mediaModel.findOneAndUpdate({ _id: data._id }, updatedData)
	}

	async deleteById(id: string): Promise<MediaServiceRR.Response> {
		const mediaId = await mediaModel.findOne({ _id: id })

		if (!mediaId) {
			throw new Error('No such media fille exists')
		}

		await mediaModel.deleteOne({ _id: id })

		return mediaId
	}

	async fetchByClass(classId: string): Promise<MediaServiceRR.Response[]> {
		const date = new Date()
		date.setDate(1)
		return await mediaModel.find({ classId: classId, forMonth: { $gte: date } })
	}

	async fetchAllForAdmin(
		mediaAccess: string,
		offset: number,
		limit: number,
		sortBy?: string,
		order?: string,
		classCode?: string,
		month?: number,
		search?: string
	) {
		const filter: any = { mediaAccess: mediaAccess }

		if (classCode && !!classCode) {
			filter['classId'] = classCode
		}

		if (search && !!search) {
			filter['$or'] = [
				{ mediaAccess: { $regex: search, $options: 'i' } },
				{ mediaUrl: { $regex: search, $options: 'i' } },
				{ docType: { $regex: search, $options: 'i' } },
			]
		}

		let data = await mediaModel
			.find(filter)
			.skip(offset)
			.limit(limit)
			.sort(!!sortBy && !!order ? { [sortBy]: order === 'ASC' ? 1 : -1 } : {})

		if (month) {
			if (month > 12 || month < 1)
				throw new Error('Month should be between 1 and 12')

			data = data?.filter(
				(value) => new Date(value?.forMonth).getMonth() === month - 1
			)
		}

		return data
	}
}

export namespace MediaServiceRR {
  export type Request = Omit<IMedia, '_id'>
  export type Response = IMedia | null
}




