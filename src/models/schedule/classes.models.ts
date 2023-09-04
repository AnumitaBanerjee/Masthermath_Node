import { IClass } from '@schema/entity.types'
import { classLevel, classMode, classTypes } from '@utils/const'
import mongoose, { Schema } from 'mongoose'

const classSchema = new Schema({
	classCode: { type: String, required: true },
	classType: { type: String, required: true,enum:classTypes },
	classLevel: { type: String, required: true,enum:classLevel },
	mode: { type: String, required: true,enum:classMode },
	center : [{ type: Schema.Types.ObjectId, ref: 'Center' }],
	fromDate: { type: Date, required: true },
	toDate: { type: Date, required: true },
	status: { type: String, required: false },
	sessions : [{ type: Schema.Types.ObjectId, ref: 'Session' }],
	students : [{ type: Schema.Types.ObjectId, ref: 'Students' }],
})

const classModel = mongoose.model<IClass>('Class', classSchema)

export default classModel
