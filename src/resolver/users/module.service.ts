import BaseService from '@resolvers/BaseService'
import PasswordHasher from '@utils/passwordHasher'
import { IUser, IStudents } from '@schema/entity.types'
import StudentsService from '@resolvers/students/module.service'
// import mongoose from 'mongoose'
// import { v4 as uuidv4 } from 'uuid'
// import sharp from 'sharp'
import usermodel from '@models/users.modal'
import { adminRoles, prebuidlRoles } from '@resolvers/utils'

type ReqChild = Omit<IStudents, '_id' | 'parentId'>

export interface UsersRRExtraFields {
  password: string
  children: ReqChild[]
}

export default class UserService
implements BaseService<UsersRR.Request, UsersRR.Response>
{
	constructor(private readonly studentsService?: StudentsService) {}

	async create(data: UsersRR.Request & UsersRRExtraFields): Promise<IUser> {
		const hashPassword = await PasswordHasher.hash(
			data.password,
      process.env.SALT!
		)
		const newData = await usermodel.create({ ...data, password: hashPassword })
		newData.save()
		return newData
	}

	async fetchAll(): Promise<UsersRR.Response[]> {
		const response = await usermodel.find()
		console.log({
			data: response,
		})
		return response
	}

	async fetchById(id: string): Promise<UsersRR.Response> {

		const user:any =  await usermodel.findOne({ _id: id }).populate('staffRole').lean();
		if (user?.email === 'admin@gmail.com') {
			user.staffRole = adminRoles
		}
		return user
	}

	async fetchByEmail(email: string): Promise<UsersRR.Response> {
		return await usermodel.findOne({ email: email })
	}

	async deleteById(id: string): Promise<any> {
		return await usermodel.deleteOne({ _id: id })
	}

	async update(
		data: UsersRR.Request & { _id: string }
	): Promise<UsersRR.Response> {
		
		const updatedData: { [key: string]: any } = {}
		const s = await usermodel.findOne({ _id: data._id })
		if (!s) {
			throw new Error('User not found')
		}
		
		s.staffRole = data.staffRole,
		s.idProof = data.idProof,
		s.address = data.address,
		s.phoneNumber = data.phoneNumber,
		s.save()
		updatedData.staffRole = data.staffRole  
		// Object.entries(data)?.map((entry) => {
		// 	const key = entry[0]
		// 	const value = entry[1]
		// 	if (key !== '_id') {
		// 		updatedData[key] = value
		// 	}

		// })

		return s
	}

	async resetPassword(
		_id: string,
		currentPassword: string,
		password: string
	): Promise<boolean> {
		const user = await usermodel.findOne({ _id: _id })

		if (password.length < 8) {
			throw new Error('Password must be atleast 8 char long')
		}

		if (!user) {
			throw new Error('User not found')
		}

		// const dehasedPassword = await PasswordHasher.verify(parent.password,process.env.SALT!)
		const rehash = await PasswordHasher.hash(currentPassword, process.env.SALT!)

		// if(rehash !== currentPassword){
		// 	throw new Error('Invalid current password')
		// }

		const hashPassword = await PasswordHasher.hash(password, process.env.SALT!)
		await usermodel.findOneAndUpdate({ _id: _id }, { password: hashPassword })
		return true
	}
}

export namespace UsersRR {
  export type Request = Omit<IUser, '_id' | 'password'>
  export type Response = IUser | null
}
