import { IMedia } from '@schema/entity.types'
import { mediaAccessType } from '@utils/const'
import mongoose, { Schema } from 'mongoose'


const mediaSchema = new Schema<IMedia>({
	mediaType:{type:String,required:true},
	classId:{type:Schema.Types.ObjectId,ref:'Class',required:true},
	forMonth:{type:Date,required:true},
	mediaAccess:{type:String,enum:mediaAccessType,required:true},
	mediaUrl:{type:String,required:true},
	docType:{type:String}
})



const mediaModel = mongoose.model<IMedia>('Media',mediaSchema)

export default mediaModel