import { ICoach } from '@schema/entity.types'
import { askQuestionLevel, coachTypes } from '@utils/const'
import mongoose, { Schema } from 'mongoose'

const coachSchema = new Schema({
	coachName: { type: String, required: true },
	emailAddress: { type: String, required: true,unique:true },
	phoneNumber: { type: String, required: true },
	address: { type: String, required: true },
	coachType: [{ type: String, required: true,enum:coachTypes }],
	askQuestionLevel: [{ type: String, required: true,enum:askQuestionLevel }],
	idProof: { type: String, required: true },
	password:{type:String,required:true},
	profileImg:{type:String},
	resetToken:{type:String,required:false},
	resetTokenExpiry:{type:Number,required:false},
})

const coachModel = mongoose.model<ICoach>('Coach', coachSchema)

export default coachModel
