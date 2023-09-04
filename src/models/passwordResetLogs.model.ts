import { IPasswordLogs } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'

const PasswordResetLogs = new Schema<IPasswordLogs>({
	resetToken:{type:String,required:true},
	mail:{type:String,required:true},
	// resetDate:{type:String,required:false,},
	resetTime:{type:String,required:true},
	resetExpireTime:{type:String,required:true},
	resetDateTime:{type:Date,required:false},
	userType:{type:String,required:true},
})

const PasswordResetLogsModel = mongoose.model<IPasswordLogs>('PasswordLogs',PasswordResetLogs)

export default PasswordResetLogsModel