import { IClassRequest } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'

const classRequestSchema = new Schema(
	{
		requestType: { type: String, required: true },
		preseason: { type: String, required: false },
		status: { type: String, required: false },
		statusReason: { type: String, default:'', required: false },
		isClear: { type: Boolean, required: false, default:false },
		created_at: { type: Date, default: Date.now },
		sessions: [{ type: Schema.Types.ObjectId, ref: 'Session' }],
		student: { type: Schema.Types.ObjectId, ref: 'Students' },
		class: { type: Schema.Types.ObjectId, ref: 'Class' },
	},
	{ timestamps: true }
)

const classRequestModel = mongoose.model<IClassRequest>('classReuest', classRequestSchema)

export default classRequestModel
