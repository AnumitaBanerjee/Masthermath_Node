import usermodel, { rolemodel } from '@models/users.modal'
import UserService from './module.service'
import centerModel from '@models/center.model'

const getAllUsers = async () => {
	const services = new UserService()
	return await services.fetchAll()
}

const getUser = async (_: any, args: { _id: string }) => {
	const services = new UserService()
	return await services.fetchById(args._id)
}
export const getAllRolesWithPermissions = async (_: any) => {
	const roles = await rolemodel.find()
	console.log(roles, 'roles')
	return roles
}

export const getStaffList = async (
	_: any,
	options: { page: number; perPage: number; search: string; centerId: string }
) => {
	const { page, perPage, search, centerId } = options
	const skip = (page - 1) * perPage

	const query: any = {}

	if (search) {
		const regex = new RegExp(search, 'i')
		query.$or = [
			{ name: regex },
			{ email: regex },
			{ phoneNumber: regex },
			{ address: regex },
			{ idProof: regex },
		]
	}

	if (centerId) {
		query.staffCenter = centerId
	}

	const totalCount = await usermodel.countDocuments(query)
	const staffList = await usermodel
		.find(query, { password: 0 })
		.populate('staffCenter')
		.populate('staffRole')
		.skip(skip)
		.limit(perPage)
		.sort({ createdAt: -1 }) // Sort by createdAt field in descending order


	
	return {
		data: staffList,
		totalEntries: totalCount,
	}
}
export const changeStaffCenter = async (
	_: any,
	options: { staffIds: string[]; currentCenterId: string; newCenterId: string }
) => {
	const { staffIds, currentCenterId, newCenterId } = options

	// Remove the current center from staff members
	const removeQuery = {
		_id: { $in: staffIds },
		staffCenter: currentCenterId,
	}
	const removedCenter = await usermodel.updateMany(removeQuery, {
		$pull: { staffCenter: currentCenterId },
	})
	

	// Update the staff members with the new center
	const updateQuery = { _id: { $in: staffIds } }
	const updateFields = { $addToSet: { staffCenter: newCenterId } }
	const updatedStaff = await usermodel.updateMany(updateQuery, updateFields)

	return removedCenter.modifiedCount > 0 && updatedStaff.modifiedCount > 0
}



export { getAllUsers, getUser }
