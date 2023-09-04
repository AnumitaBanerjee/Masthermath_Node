import BaseService from '@resolvers/BaseService'
import  feeConfigModel  from '@models/feeConfig.model'
import { IFeeConfig } from '@schema/entity.types'
import mongoose, { Types } from 'mongoose'
import { PubSub } from 'graphql-subscriptions'

export const pubsub = new PubSub()

export default class feeConfigService
implements BaseService<feeConfigRR.Request, feeConfigRR.Response>
{
	fetchAll(): Promise<feeConfigRR.Response[]> {
		return  feeConfigModel.find()
	}
	fetchById(id: string): Promise<feeConfigRR.Response> {
		return  feeConfigModel.findOne({ _id: id })
	}
	fetchActiveFee(): Promise<feeConfigRR.Response> {
		return  feeConfigModel.findOne({ isActive: true })
	}
	deleteById(id: string): Promise<feeConfigRR.Response> {
		throw new Error('Method not implemented.')
	}
	update(data: feeConfigRR.Request): Promise<feeConfigRR.Response> {
		throw new Error('Method not implemented.')
	}

	async create(data: {
		planTax: number,
		setupFee: number
		setupTax: number
		discount: number,
		createdBy?: string 
  }): Promise<IFeeConfig> {
		console.log('Created ', data.createdBy)
		await feeConfigModel.findOneAndUpdate({ isActive: true }, { isActive: false })
		const newData = await feeConfigModel.create({ ...data })
		newData.save()
		return newData
	}

	// async fetchAll(): Promise<questionRR.Response[]> {
	// 	const response = await questionModel
	// 		.find()
	// 		.populate('class_id')
	// 		.populate('comments')
	// 		.populate('student_id')
	// 		.populate({
	// 			path: 'comments',
	// 			populate: 'studentId',
	// 		})
	// 	return response
	// }

}
export namespace feeConfigRR {
	export type Request = Omit<IFeeConfig, '_id' | 'password'>
	export type Response = IFeeConfig | null
  }
  