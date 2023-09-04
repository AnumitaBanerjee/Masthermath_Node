import { IAssignment, ISubmittion } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'


const submission = new Schema<ISubmittion>({
	studentId:{type:Schema.Types.ObjectId,ref:'Students',required:true},
	answerUrl:{type:String}
})

const assignmentSchema = new Schema<IAssignment>({
	classId:{type:Schema.Types.ObjectId,ref:'Class',required:true},
	sessionId:{type:Schema.Types.ObjectId,ref:'Session'},
	questionUrl:{type:String,required:true},
	docType:{type:String},
	submission:[{type:submission,default:[]}],
	createdAt: { type: Date },

})

const assignmentModel = mongoose.model<IAssignment>('Assignment',assignmentSchema)

export default assignmentModel

