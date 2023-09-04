import BaseService from '@resolvers/BaseService'
import parents from '@models/parents.model'
import PasswordHasher from '@utils/passwordHasher'
import { IParents, IStudents } from '@schema/entity.types'
import StudentsService from '@resolvers/students/module.service'
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'



type ReqChild = Omit<IStudents,'_id'|'parentId'>

export interface IParentsRRExtraFields{
	password:string;
	children:ReqChild[];
}

export default class ParentsService implements BaseService<ParentsRR.Request,ParentsRR.Response> {
	constructor(
		private readonly studentsService?:StudentsService
	){}

	async create(data: ParentsRR.Request & IParentsRRExtraFields): Promise<IParents> {
		const hashPassword = await PasswordHasher.hash(data.password,process.env.SALT!)
		const newParent = await parents.create({...data,password:hashPassword,children:[]})
		
		await Promise.all(data.children.map(async (student:ReqChild)=>{
			const newStudent = await this.studentsService!.create({
				name:student.name,
				studentType:student.studentType,
				parentId:new mongoose.Types.ObjectId(newParent._id)
			})	
			newParent.children.push(newStudent)
		}))
	
		newParent.save()

		return newParent
	}

	async fetchAll(): Promise<ParentsRR.Response[]> {

		const response = await parents.find().populate({
			path: 'children',
			populate: {
				path: 'classId',
				model: 'Class'
			}
		})
		console.log(JSON.stringify(response,null,3), 'response')
		
		return response
	}


	async fetchById(id: string): Promise<ParentsRR.Response> {
		return await parents.findOne({_id:id}).populate({
			path: 'children',
			populate: {
				path: 'classId',
				model: 'Class'
			}
		})
	}

	async fetchByEmail(email: string): Promise<ParentsRR.Response> {
		return await parents.findOne({email:email})
	}

	async deleteById(id: string): Promise<any> {
		return await parents.deleteOne({_id:id})
	}

	async update(data: ParentsRR.Request & {_id:string}): Promise<ParentsRR.Response> {
		const updatedData:{[key:string]:any} = {}
		
		// if(data.image){
		// 	const imageData:any = data.image.split(';base64,').pop()
		// 	const decodedImage = Buffer.from(imageData, 'base64')
		// 	const extension = data.image.substring('data:image/'.length, data.image.indexOf(';base64'))
		// 	const filename = `${uuidv4()}.${extension}`

		// 	const filePath = `uploads/parents/${filename}`
		// 	await sharp(decodedImage).toFile(filePath).catch((err) => {
		// 		console.error(`Error saving image: ${err}`)
		// 		throw new Error('Error saving image')
		// 	})
		// 	data.image = filePath
		// }
		
		Object.entries(data)?.map((entry)=>{
			const key = entry[0]
			const value = entry[1]
			if(key!=='_id'){
				updatedData[key] = value
			}
		})

		return await parents.findOneAndUpdate({_id:data._id},updatedData)
	}

	async resetPassword(_id:string,currentPassword:string,password:string):Promise<boolean>{
		const parent = await parents.findOne({_id:_id})


		if(password.length<8){
			throw new Error('Password must be atleast 8 char long')
		}

		if(!parent){
			throw new Error('User not found')
		}
		
		// const dehasedPassword = await PasswordHasher.verify(parent.password,process.env.SALT!)
		const rehash = await PasswordHasher.hash(currentPassword,process.env.SALT!)
		
		// if(rehash !== currentPassword){
		// 	throw new Error('Invalid current password')
		// }

		const hashPassword = await PasswordHasher.hash(password,process.env.SALT!)
		await parents.findOneAndUpdate({_id:_id},{password:hashPassword})
		return true
	}
}


export namespace ParentsRR {
  export type Request = Omit<IParents, '_id'|'password'>;
  export type Response = IParents | null;
}