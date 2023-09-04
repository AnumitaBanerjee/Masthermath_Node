import {
	IBankAccountInfo,
	ICreditCardInfo,
	IStudents,
} from '@schema/entity.types'
import { studentTypes } from '@utils/const'
import mongoose, { Schema, Types } from 'mongoose'

const CreditCardInfoSchema = new Schema<ICreditCardInfo>({
	nameOnCard: { type: String, required: true },
	cardNumber: { type: String, required: true },
	expireDate: { type: Date, required: true },
	month: { type: String, required: false },
	year: { type: String, required: false },
	cvv: { type: Number, required: true },
	paymentCusId: { type: String, required: true },
	payToken: { type: String, required: true },
})

const BankAccountInfoSchema = new Schema<IBankAccountInfo>({
	bankName: { type: String, required: true },
	accountNumber: { type: String, required: true },
	accountHolderName: { type: String, required: true },
	paymentCusId: { type: String, required: true },
	payToken: { type: String, required: true },
})


const studentSchema = new Schema<IStudents>({
	name: { type: String, required: true },
	image: { type: String, required: false },
	studentType:{type:String,required:true,enum:studentTypes},
	parentId: { type: Schema.Types.ObjectId, ref: 'Parents', required: true },
	cardDetails: [{ type: CreditCardInfoSchema, default: [] }],
	BankAccountDetails: [{ type: BankAccountInfoSchema, default: [] }],
	classId: [{ type: Schema.Types.ObjectId, ref: 'Class', required: false }],
})


const studentmodel = mongoose.model<IStudents>('Students', studentSchema)

export default studentmodel
