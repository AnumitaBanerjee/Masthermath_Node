import BaseService from '@resolvers/BaseService'
import center from '@models/center.model'
import { ICenter } from '@schema/entity.types'

export default class centerService
implements BaseService<centerRR.Request, centerRR.Response>
{
	// constructor(
	// 	private readonly studentsService?:StudentsService
	// ){}

	async create(data: centerRR.Request): Promise<ICenter> {
		const isExist = await center.findOne({ centerName: data.centerName })

		if (isExist) {
			throw new Error('center name already exists')
		}
		const newData = await center.create({ ...data })
		newData.save()

		return newData
	}

	async fetchAll(): Promise<centerRR.Response[]> {
		const response = await center.find()
		return response
	}

	async fetchById(id: string): Promise<centerRR.Response> {
		return await center.findOne({ _id: id }).populate('children')
	}

	async fetchByEmail(email: string): Promise<centerRR.Response> {
		return await center.findOne({ email: email })
	}

	async deleteById(id: string): Promise<any> {
		return await center.deleteOne({ _id: id })
	}

	async update(
		data: centerRR.Request & { _id: string }
	): Promise<centerRR.Response> {
		const updatedData: { [key: string]: any } = {}

		if (!data._id.match(/^[0-9a-fA-F]{24}$/)) {
			throw new Error('Invalid ID')
		}

		const existing = await center.findOne({ _id: data._id })
		if (!existing) {
			throw new Error('Center not found')
		}

		if (data.centerName) {
			const user = await center.findOne({ centerName: data.centerName })
			if (user && user._id.toString() !== data._id) {
				throw new Error('center name is already in use')
			}
		}

		Object.entries(data)?.map((entry) => {
			const key = entry[0]
			const value = entry[1]
			if (key !== '_id') {
				updatedData[key] = value
			}
		})

		return await center.findOneAndUpdate({ _id: data._id }, updatedData)
	}
}

export namespace centerRR {
  export type Request = Omit<ICenter, '_id' | 'password'>
  export type Response = ICenter | null
}
