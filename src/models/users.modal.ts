import { IRole, IUser } from '@schema/entity.types'
import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema<IUser>({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	phoneNumber: { type: String, required: true },
	address: { type: String, required: true },
	idProof: { type: String, required: true },
	status: { default:true, type: Boolean, required: true },
	staffCenter:  [{ type: Schema.Types.ObjectId, ref: 'Center' }],
	staffRole:  [{ type: Schema.Types.ObjectId, ref: 'Roles' }],
	resetToken:{type:String,required:false},
	resetTokenExpiry:{type:Number,required:false},
})

const Roles = new Schema<IRole>({
	roleName: { type: String, required: true },
	permissions: [{ type: String, required: true }],
})

const usermodel = mongoose.model<IUser>('Users', userSchema)
const rolemodel = mongoose.model<IRole>('Roles', Roles)

export { rolemodel }
export default usermodel
