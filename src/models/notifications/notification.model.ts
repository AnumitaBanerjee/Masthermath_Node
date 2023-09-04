import { INotification, ITrackNotification } from '@schema/entity.types'
import {
	announcementUserType,
	classLevel,
	classTypes,
	notificationType,
	trackStatus,
	userType,
} from '@utils/const'
import mongoose, { Schema } from 'mongoose'

const notificationSchema = new Schema({
	selectNotificationType: {
		type: String,
		required: true,
		enum: notificationType,
	},

	selectTheUser: { type: String, default:userType[0], required: true, enum:userType },
	selectClassLevel: { type: String, required: true, enum: classLevel },
	selectClassType: { type: String, required: false, enum: classTypes },
	selectClassCode: { type: String, required: false },
	addDescription: { type: String, required: true },
	sesions: [{ type: String, required: false }],
	insertLink: { type: String, required: true },
	created_at: { type: Date, default: Date.now },
})

const trackNotificationSchema = new Schema(
	{
		coachId: { type: Schema.Types.ObjectId, ref: 'Coach'},
		studentId: { type: Schema.Types.ObjectId, ref: 'Students'},
		statusType: { type: String, required: true, enum: trackStatus },
		notificationType: { type: String, required: true, default:'Notification', enum: notificationType },
		created_at: { type: Date, default: Date.now },
		updated_at: { type: Date, default: Date.now },
	},
	{ timestamps: true }
)

const notificationModel = mongoose.model<INotification>(
	'Notification',
	notificationSchema
)
export const trackNotificationModel = mongoose.model<ITrackNotification>(
	'TrackNotification',
	trackNotificationSchema
)

export default notificationModel
