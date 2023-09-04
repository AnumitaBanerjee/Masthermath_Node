import { IDownloadLogs } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'

const downloadLogsSchema = new Schema({
	downloadLink: { type: String, required: false },
	fileType: { type: String, required: false },
	fileSource: { type: String, required: false },
},{
	timestamps: true
})

const downloadsModel = mongoose.model<IDownloadLogs>('DwonloadLogs', downloadLogsSchema)

export default downloadsModel
