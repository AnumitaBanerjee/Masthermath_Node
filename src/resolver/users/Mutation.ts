import globalValidators from '@utils/globalValidators'
import { UsersRR, UsersRRExtraFields } from './module.service'
import AuthServices from '@resolvers/auth/module.service'
import UserService from './module.service'
import usermodel, { rolemodel } from '@models/users.modal'
import passwordHasher from '@utils/passwordHasher'

export interface UsersRRExtraFields2 {
  _id: string
}

const createUser = async (
	_: any,
	args: UsersRR.Request & UsersRRExtraFields
): Promise<UsersRR.Response> => {
	const isEmail = globalValidators.validateEmail(args.email)
	const passwordLength = args.password.length

	if (isEmail === null) {
		throw new Error('Invalid email format')
	}

	if (passwordLength < 8) {
		throw new Error('Password must be atleast 8 char long')
	}

	const user = new UserService()

	const newParent = await user.create(args)

	return newParent
}

export const updateUser = async (
	_: any,
	args: UsersRR.Request & UsersRRExtraFields2
): Promise<boolean> => {
	const user = new UserService()
	const newParent = await user.update(args)
	return newParent ? true : false
}

export const addRolesWithPermissions = async (
	_: any,
	roles: { roleName: string; permissions: string[] }
): Promise<any> => {
	const createdRoles = await rolemodel.insertMany(roles)
	return createdRoles ? true : false
}

// Mutation to edit a role's permissions

export const editRolePermissions = async (
	_: any,
	roles: { roleId: string; roleName: string; permissions: string[] }
): Promise<any> => {
	const updatedRole = await rolemodel.findByIdAndUpdate(
		roles.roleId,
		{ permissions: roles.permissions, roleName: roles.roleName },
		{ new: true }
	)
	return updatedRole ? true : false
}

export const deleteRole = async (
	_: any,
	roles: { roleId: string }
): Promise<any> => {
	const updatedRole = await rolemodel.deleteOne({ _id: roles.roleId })
	return updatedRole.deletedCount === 1
}

export const addStaff = async (
	_: any,
	options: {
    name: string
    email: string
    password: string
    phoneNumber: string
    address: string
    idProof: string
    staffCenter: string[]
    staffRole: string[]
  }
) => {
	const { name, email, phoneNumber, address, idProof, staffCenter, staffRole, password } =
    options

	// Check if the email or phone number is already registered
	const existingStaff = await usermodel.findOne({
		$or: [{ email }, { phoneNumber }],
	})
	if (existingStaff) {
		throw new Error('Email or phone number is already registered')
	}
	const hashPassword = await passwordHasher.hash(password, process.env.SALT!)

	// Create a new staff object
	const newStaff = new usermodel({
		name,
		email,
		password: hashPassword,
		phoneNumber,
		address,
		idProof,
		staffCenter,
		staffRole,
	})

	// Save the staff member in the database
	const savedStaff = await newStaff.save()
	return savedStaff ? true : false
}
export const editStaff = async (
	_: any,
	options: {
    id: string
    name: string
    email: string
    password: string
    phoneNumber: string
    address: string
    idProof: string
    staffCenter: string[]
    staffRole: string[]
  }
) => {
	const {
		id,
		name,
		email,
		phoneNumber,
		address,
		idProof,
		staffCenter,
		staffRole,
		password
	} = options

	const existingStaffWithEmailOrPhone = await usermodel.find({
		$or: [{ email }, { phoneNumber }],
		// _id: { $ne: id }, // Exclude the current staff member from the search
	})
	if (existingStaffWithEmailOrPhone.length > 1) {
		throw new Error(
			'Email or phone number is already registered with another staff member'
		)
	}
	// const hashPassword = await passwordHasher.hash('staff@123', process.env.SALT!)
	const existingStaff: any = await usermodel.findOne({
		_id: id,
	})
	if (!existingStaff) {
		throw new Error('staff not found')
	}

	existingStaff.name = name
	existingStaff.email = email
	existingStaff.phoneNumber = phoneNumber
	existingStaff.staffCenter = staffCenter
	existingStaff.staffRole = staffRole
	existingStaff.address = address
	if (idProof) {
		existingStaff.idProof = idProof
	}
	if(password){
		const hashPassword = await passwordHasher.hash(password, process.env.SALT!)
		existingStaff.password = hashPassword
	}

	// Save the staff member in the database
	const savedStaff = await existingStaff.save()
	return savedStaff ? true : false
}
export const updateStaffStatus = async (
	_: any,
	options: {
    _id: string;
  }
) => {
	const { _id } = options
	// const hashPassword = await passwordHasher.hash('staff@123', process.env.SALT!)
	const existingStaff: any = await usermodel.findOne({
		_id: _id,
	})
	if (!existingStaff) {
		throw new Error('staff not found')
	}

	existingStaff.status = !existingStaff.status

	// Save the staff member in the database
	const savedStaff = await existingStaff.save()
	return savedStaff ? true : false
}

const resetPassword = async (
	_: any,
	args: { currentPassword: string; password: string },
	ctx: any
): Promise<any> => {
	const authService = new AuthServices()
	const _id = await authService.CheckAuthUser(ctx.headers['authorization'])

	const services = new UserService()
	const res = await services.resetPassword(
		_id,
		args.currentPassword,
		args.password
	)

	if (!res) {
		throw new Error('Failed to reset password')
	}

	return 'rest successful'
}

export const deleteStaff = async (_: any, args: { _id: string }) => {
	const services = new UserService()
	const status = await services.deleteById(args._id)
	return status.deletedCount === 1
}

export { createUser, resetPassword }
