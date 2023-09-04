import BaseService from '@resolvers/BaseService'
import students from '@models/students.model'
import { IBankAccountInfo, ICreditCardInfo, IStudents } from '@schema/entity.types'
import { v4 as uuidv4 } from 'uuid'
import parentmodel from '@models/parents.model'
import { Schema } from 'mongoose'
import { createStripeAccount, updateCustomerWithBankAccountToken, updateCustomerWithCardToken } from '@resolvers/formQuestions/utils/Payment'
import Stripe from 'stripe'

interface IStudentsServiceExtendedFunctions{
	addBankDetails(_id:string,data:StudentBankDetailsRR.Request):StudentBankDetailsRR.Response
	deleteBankDetails(studentId:string,_id:string):Promise<StudentBankDetailsRR.Response>
	addCardDetails(_id:string,data:StudentCardDetailsRR.Request):StudentCardDetailsRR.Response
	deleteCardDetails(studentId:string,_id:string):StudentCardDetailsRR.Response
}

class StudentsService extends BaseService<StudentsRR.Request,StudentsRR.Response> implements IStudentsServiceExtendedFunctions {
  
	async create(data: Omit<StudentsRR.Request,'classId'|'cardDetails'|'image'|'BankAccountDetails'>): Promise<IStudents> {
		const checkParent = await parentmodel.findOne({_id:data.parentId})

		if(!checkParent){
			throw new Error('could not find parent')
		}

		const newStudent = await students.create({...data})
		
		checkParent.children.push(newStudent.id)

		console.log(checkParent)
		checkParent.save()
		return newStudent
	}

	async fetchAll(): Promise<StudentsRR.Response[]> {
		const all = await students.find().populate('parentId').populate('classId')
		console.log(all,'all')
		return all
	}

	async fetchById(id: string): Promise<StudentsRR.Response> {
		return await students.findOne({_id:id}).populate('parentId').populate('classId')
	}

	async deleteById(id: string): Promise<any> {
		return await students.deleteOne({_id:id})
	}

	async update(data: StudentsRR.Request & {_id:string}): Promise<StudentsRR.Response> {
		const updatedData:{[key:string]:any} = {}

		
		

		Object.entries(data)?.map((entry)=>{
			const key = entry[0]
			const value = entry[1]
			if(key!=='_id'){
				updatedData[key] = value
			}
		})

		return await students.findOneAndUpdate({_id:data._id},updatedData)
	}

	async addBankDetails(_id:string,data:Omit<IBankAccountInfo,'id'>):Promise<IBankAccountInfo|null>{
		const existingStudent =  await students.findOne({_id:_id}).populate('parentId')
		const checkParent = await parentmodel.findOne({_id:existingStudent?.parentId._id})

		if(existingStudent === null){
			return null
		}
		if(checkParent === null){
			return null
		}
		if (!checkParent.paymentCusId) {
			const account: Stripe.Customer = await createStripeAccount({
				email: checkParent.email
			})
			checkParent.paymentCusId = account.id
			checkParent.save()
		}
		const bankData =  await updateCustomerWithBankAccountToken(checkParent.paymentCusId,data)
		// data.payToken = bankData.id
		data.paymentCusId = checkParent.paymentCusId
		existingStudent.BankAccountDetails?.push(data)
		existingStudent.save()
		return data
	}

	async deleteBankDetails(studentId:string,_id:string):Promise<StudentBankDetailsRR.Response>{
		const existingStudent =  await students.findOne({_id:studentId})

		if(existingStudent === null){
			return null
		}
		
		let deletedData:IBankAccountInfo | null = null

		existingStudent['BankAccountDetails']  = existingStudent.BankAccountDetails?.filter((detail:IBankAccountInfo)=>{
			if(detail._id?.toString() === _id){
				deletedData = detail
			}
			return detail._id?.toString() !== _id
		})
		
		existingStudent.save()

		return deletedData
	}

	async addCardDetails(_id:string,data:StudentCardDetailsRR.Request):StudentCardDetailsRR.Response{
		const existingStudent =  await students.findOne({_id:_id})
		const checkParent = await parentmodel.findOne({_id:existingStudent?.parentId._id})

		if(existingStudent === null){
			return null
		}
		if(checkParent === null){
			return null
		}
		if (!checkParent.paymentCusId) {
			const account: Stripe.Customer = await createStripeAccount({
				email: checkParent.email
			})
			checkParent.paymentCusId = account.id
			checkParent.save()
		}
		const cardData =  await updateCustomerWithCardToken(checkParent.paymentCusId,data)
		data.payToken = cardData.id
		data.paymentCusId = checkParent.paymentCusId
		existingStudent.cardDetails?.push(data)
		existingStudent.save()
		return data
	}

	async deleteCardDetails(studentId:string,_id:string):StudentCardDetailsRR.Response{
		const existingStudent =  await students.findOne({_id:studentId})

		if(existingStudent === null){
			return null
		}

		let deletedData:ICreditCardInfo | null = null

		existingStudent['cardDetails']  = existingStudent.cardDetails?.filter((detail:ICreditCardInfo)=>{
			if(detail._id?.toString() === _id){
				deletedData = detail
			}
			
			return detail._id?.toString() !== _id
		})
		
		console.log(existingStudent._id,_id,'😒\n')
		existingStudent.save()

		return deletedData
	}
	
}


export namespace StudentsRR {
  export type Request = Omit<IStudents, '_id'>;
  export type Response = IStudents | null;
}

export namespace StudentBankDetailsRR {
	export type Request = Omit<IBankAccountInfo,'id'>;
	export type Response = Promise<IBankAccountInfo|null>;
}

export namespace StudentCardDetailsRR {
	export type Request = Omit<ICreditCardInfo,'_id'>;
	export type Response = Promise<ICreditCardInfo|null>;
}

export default StudentsService