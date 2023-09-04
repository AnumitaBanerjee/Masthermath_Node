import {  IWebsiteSchudle } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'

const schema = new Schema<IWebsiteSchudle>({
	classLevel:{type:String},
	fromDate:{type:Date},
	toDate:{type:Date},
	classCode:{type:String},
	className:{type:String},
	fromTime:{type:Date},
	toTime:{type:Date},
	year:{type:String},
	mode:{type:String},
	location:{type:String},
	description:{type:String},
	seatCapacity:{type:String},
})
const WebsiteSchudleModel = mongoose.model<IWebsiteSchudle>('WebsiteSchudle',schema)

export default WebsiteSchudleModel