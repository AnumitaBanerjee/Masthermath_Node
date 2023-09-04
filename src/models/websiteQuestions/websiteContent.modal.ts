import { IFormOptions, IFormQuestions, INewWebsiteContent, IWebsiteCenter, IWebsiteContent, IWebsiteCourseAmount, IWebsitePoints } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'

const formOptions = new Schema<IFormOptions>({
	option: { type: String },
})

const websiteContent = new Schema<INewWebsiteContent>({
	title: { type: String },
	description: { type: String },
	year: { type: Number },
	image: { type: String },
})
const websiteCourseAmount = new Schema<IWebsiteCourseAmount>({
	title: { type: String },
	description: { type: String },
})
const websitePoints = new Schema<IWebsitePoints>({
	title: { type: String },
	image: { type: String },
	options: [{ type: formOptions, default: [] }],
})
const websiteCenter = new Schema<IWebsiteCenter>({
	centerName: { type: String },
	centerAddress: { type: String },
	centerCode: { type: String },
})
const websiteContentModel = mongoose.model<INewWebsiteContent>(
	'NewWebsiteContent',
	websiteContent
)
const websiteCourseAmountModel = mongoose.model<IWebsiteCourseAmount>(
	'WebsiteCourseAmount',
	websiteCourseAmount
)
const websitePointsModel = mongoose.model<IWebsitePoints>(
	'WebsitePoints',
	websitePoints
)
const websiteCenterModel = mongoose.model<IWebsiteCenter>(
	'WebsiteCenter',
	websiteCenter
)

export {
	websiteContentModel,
	websiteCourseAmountModel,
	websiteCenterModel,
	websitePointsModel,
}
