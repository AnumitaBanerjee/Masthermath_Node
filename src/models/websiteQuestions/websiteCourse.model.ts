import {  IWebsiteCourse } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'

const schema = new Schema<IWebsiteCourse>({
	classLevel:{type:String},
	classCode: {type:String},
	classTitle: {type:String},
	classType: {type:String},
	title:{type:String},
	price:{type:Number},
	seatCapacity:{type:Number},
	fromDate:{type:Date},
	toDate:{type:Date},
	fromTime:{type:Date},
	toTime:{type:Date},
	mode:{type:String},
	location:{type:String},
	description:{type:String},
})
const WebsiteCourseModel = mongoose.model<IWebsiteCourse>('WebsiteCourse',schema)

export default WebsiteCourseModel