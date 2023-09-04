import mongoose, { Schema } from 'mongoose'

const feeConfigSchema = new Schema({
	planTax:{type:Number,default: 0},
	setupFee:{type:Number,default: 0},
	setupTax:{type:Number,default: 0},
	discount:{type:Number,default: 0},
	isActive: ({type:Boolean,default: true})
},{
	timestamps: true
})

const feeConfigModel = mongoose.model('FeeConfig',feeConfigSchema)

export default feeConfigModel
