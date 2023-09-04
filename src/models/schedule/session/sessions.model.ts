import { ISession } from '@schema/entity.types'
import { sessionTypes } from '@utils/const'
import mongoose, { Schema } from 'mongoose'

const sessionSchema = new Schema<ISession>({
	sessionType: { type: String, required: true, enum: sessionTypes },
	sessionName: { type: String, required: true },
	totalSeats: { type: Number, required: true },
	permanentCoach: {
		type: Schema.Types.ObjectId,
		ref: 'Coach',
		required: false,
	},
	temporaryCoach: {
		type: Schema.Types.ObjectId,
		ref: 'Coach',
		required: false,
	},
	Date: { type: Date, required: false },
	fromTime: { type: Date, required: false },
	toTime: { type: Date, required: false },
	status: { type: String, required: false },
	class: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
	attendees: [{ type: Schema.Types.ObjectId, ref: 'Students', default: [] }],
	summary: { type: String, required: false },
	progressReport: { type: String, required: false },
	meeingLink: { default: '', type: String, required: false },
	start_url: { default: '', type: String, required: false },
	meeting_id: { default: '', type: String, required: false },
	meeting_passcode: { default: '', type: String, required: false },
})


const sessionModel = mongoose.model<ISession>('Session', sessionSchema)

export default sessionModel
