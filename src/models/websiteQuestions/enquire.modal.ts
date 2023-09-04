import { IEnquire, IQuestionOptions } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'


const questionOptions = new Schema<IQuestionOptions>({
	question:{type:String},
	answer:{type:String}
})

const enquireSchema = new Schema({
	classLevel: { type: String, required: true },
	classCode: { type: String, required: true },
	classType: { type: String, required: true },
	courseId: { type: String, required: true },
	session: { type: String, required: false },
	emailAddress: { type: String, required: true },
	phoneNumber: { type: String, required: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	childFirstName: { type: String, required: true },
	childLastName: { type: String, required: true },
	state: { type: String, required: true },
	country: { type: String, required: true },
	address: { type: String, required: true },
	city: { type: String, required: true },
	zipCode: { type: Number, required: true },
	source: { type: String, required: false },
	friendsName: { type: String, required: false },
	friendsNumber: { type: String, required: false },
	options:[{type:questionOptions,default:[]}]

})

const enquireModel = mongoose.model<IEnquire>('Enquire', enquireSchema)

export default enquireModel
