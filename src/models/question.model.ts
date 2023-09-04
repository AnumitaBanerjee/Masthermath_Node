import { IComment, IQuestion } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'

const questionSchema = new Schema(
	{
		question_text: { type: String, required: true },
		class_id: { type: Schema.Types.ObjectId, ref: 'Class' },
		comments: [{ type: Schema.Types.ObjectId, ref: 'Comments' }],
		student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Students' },
		created_at: { type: Date, default: Date.now },
		image: { type: String },
		doc: { type: String },
		unseen_comments_count: { type: Number, default: 0 }, // new field
		comments_count: { type: Number, default: 0 } // new field
	},
	{ timestamps: true }
)


const commentSchema = new mongoose.Schema({
	commentText: { type: String, required: true },
	userType: { type: String, required: true },
	created_at: { type: Date, default: Date.now },
	studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Students' },
	coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach' },
	questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
})



const questionModel = mongoose.model<IQuestion>('Question', questionSchema)
const commentsModel = mongoose.model<IComment>('Comments', commentSchema)

export { questionModel, commentsModel }
