import mongoose, { Schema } from 'mongoose'

const userAnnouncementSchema = new Schema({
	notificationId:{type:mongoose.Schema.Types.ObjectId,ref:'Notification',required:true},
	studentId:{type:String},
	global:{type:Boolean},
	createdAt:{type:Date,default:new Date()}
})

const userAnnouncementModel = mongoose.model('UserAnnouncement',userAnnouncementSchema)

export default userAnnouncementModel


