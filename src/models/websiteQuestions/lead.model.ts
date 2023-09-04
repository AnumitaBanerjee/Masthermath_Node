import { ILead, ILeadAttachments, ILeadFollowCmmments, ILeadHistory, IWebsiteContent } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'

const leadAttachments = new Schema<ILeadAttachments>({
	attachment: { type: String, required: true },
	staff: [{ type: Schema.Types.ObjectId, required: false, ref: 'Users' }],
	createdAt: { type: Date },
})

const leadFollowCmmments = new Schema<ILeadFollowCmmments>({
	comment: { type: String, required: true },
	commentAttachment: { type: String },
	staff: { type: Schema.Types.ObjectId, required: false, ref: 'Users' },
	createdAt: { type: Date },
})

const leadHistory = new Schema<ILeadHistory>({
	oldStatus: { type: String },
	newStatus: { type: String },
	createdAt: { type: Date },
})

const schema = new Schema<ILead>({ 
	leadStatus: { type: String },
	courseId: { type: String },
	sessionId: { type: String},
	leadDescription: { type: String },
	classType: { type: String },
	dueDate: { type: Date },
	leadAttachments: [{ type: leadAttachments }],
	leadHistory: [{ type: leadHistory }],
	leadFollowCmmments: [{ type: leadFollowCmmments }],
	staff: [{ type: Schema.Types.ObjectId, required: false, ref: 'Users' }],
	parent: { type: Schema.Types.ObjectId, required: false, ref: 'Parents' },
	student: { type: Schema.Types.ObjectId, required: false, ref: 'Students' },
	enquire: { type: Schema.Types.ObjectId, required: false, ref: 'Enquire' },
	createdAt: { type: Date  },
})

const leadModel = mongoose.model<ILead>(
	'Lead',
	schema
)
const leadHistoryModel = mongoose.model<ILeadHistory>(
	'ILeadHistory',
	leadHistory
)

export { leadModel,leadHistoryModel }
