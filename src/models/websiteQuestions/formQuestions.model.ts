import { IFormOptionLists, IFormOptions, IFormQuestions } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'


const formOptions = new Schema<IFormOptionLists>({
	option:{type:String},
	label:{type:String},
	value:{type:String},
	code:{type:String}
})

const formQuestions = new Schema<IFormQuestions>({
	question:{type:String},
	type:{type:String},
	order:{type:Number},
	answerCode:{type:String},
	options:[{type:formOptions,default:[]}]
})

const model = mongoose.model<IFormQuestions>('FormQuestions',formQuestions)

export default model
