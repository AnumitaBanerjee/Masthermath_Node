import {  IWebsiteContent } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'

const schema = new Schema<IWebsiteContent>({
	contentType:{type:String},
	contentValue:{type:String},
})
const WebsiteContentModel = mongoose.model<IWebsiteContent>('WebsiteContent',schema)

export default WebsiteContentModel