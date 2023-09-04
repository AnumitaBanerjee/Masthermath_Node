import AuthServices from '@resolvers/auth/module.service'
import centerService, { feeConfigRR } from './module.service'
import mongoose, { Types } from 'mongoose'

export const createFeeConfig = async (
	_: any,
	args: feeConfigRR.Request,ctx:any
): Promise<feeConfigRR.Response> => {
	
	// const authService = new AuthServices()
	// const _id = await authService.CheckAuth(ctx.headers['authorization'])
	// console.log(_id)
	const _id  = ''
	const services = new centerService()
	const newFee = await services.create({...args, createdBy: _id})
	return newFee
}

