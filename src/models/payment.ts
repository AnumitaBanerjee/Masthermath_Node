import { IPayment } from '@schema/entity.types'
import { truncateSync } from 'fs'
import mongoose, { Schema } from 'mongoose'

const paymentSchema = new Schema<IPayment>({
	month:{type:String},
	payId:{type:String},
	payMethod:{type:String},
	amount:{type:String, default:'0'},
	date:{type:String,required:true},
	createdAt:{type:Date},
	status:{type:String,required:true},
	centerId:{type:Schema.Types.ObjectId,required:false,ref:'Center',default:'648ff01513b7816b00da179b'},
	classId:{type:Schema.Types.ObjectId,required:false,ref:'Class'},
	studentId:{type:Schema.Types.ObjectId,required:false,ref:'Students'},
	parentId:{type:Schema.Types.ObjectId,required:false,ref:'Students'},
	invoiceNo:{type:String,default: null},
	receiptNo:{type:String,default: null},
	planTax:{type:Number,default: 0},
	setupFee:{type:Number,default: 0},
	setupTax:{type:Number,default: 0},
	discount:{type:Number,default: 0},
	planQty:{type:Number,default: 0},
	setupQty:{type:Number,default: 0},
	planTotalAmount:{type:Number,default: 0},
	setupTotalAmount:{type:Number,default: 0},
	subTotal:{type:Number,default: 0},
	discountTotalAmount:{type:Number,default: 0},
	taxTotalAmount:{type:Number,default: 0},
	payableAmount:{type:Number,default: 0},
	cardType:{type:String,default: null},
	last4:{type:String,default: null},
})

const paymentmodel = mongoose.model<IPayment>('Payment',paymentSchema)

export default paymentmodel

