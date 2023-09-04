import { ISessionFeedBack } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'

const sessionFeedBackSchema = new Schema<ISessionFeedBack>({
	sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
	studentId:{type:Schema.Types.ObjectId,ref: 'Students',default:[]},
	feedback:{type:String,required:false}
})

const sessionFeedBackModel = mongoose.model<ISessionFeedBack>('sessionFeedBack', sessionFeedBackSchema)

export default sessionFeedBackModel
