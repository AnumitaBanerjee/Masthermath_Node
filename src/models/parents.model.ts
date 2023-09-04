import { IParents } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'

const parentSchema = new Schema<IParents>({
	name:{type:String,required:true},
	email:{type:String,required:true,unique:true},
	password:{type:String,required:true},
	phone:{type:String,required:true},
	image:{type:String,required:false},
	address:{type:String,required:true},
	paymentCusId:{type:String,required:false},
	resetToken:{type:String,required:false},
	resetTokenExpiry:{type:Number,required:false},
	wid:{type:String,required:false},
	children:[{type:Schema.Types.ObjectId,required:false,ref:'Students',default:[]}],
})

const parentmodel = mongoose.model<IParents>('Parents',parentSchema)

export default parentmodel