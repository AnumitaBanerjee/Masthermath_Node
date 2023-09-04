import { ICenter } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'

const centerSchema = new Schema({
	centerName: { type: String, required: true },
	centerCode: { type: String, required: false },
	status: { default:true, type: Boolean, required: false },
	centerAddress: { type: String, required: true },
	class : [{ type: Schema.Types.ObjectId, ref: 'Class' }],
})

const centerModel = mongoose.model<ICenter>('Center', centerSchema)

export default centerModel
