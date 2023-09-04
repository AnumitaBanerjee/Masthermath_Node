import studentmodel from '@models/students.model'
import usermodel from '@models/users.modal'
import {
	leadHistoryModel,
	leadModel,
} from '@models/websiteQuestions/lead.model'
import AuthServices from '@resolvers/auth/module.service'
import { ILead, IUser } from '@schema/entity.types'

export const getLeads = async (
	_: any,
	args: {
    search: string
    status: string
    classType: string
  }
): Promise<ILead[]> => {
	try {
		const query: any = {}

		// Check if search parameter is provided
		// if (args.search) {
		// 	const searchRegex = new RegExp(args.search, 'i')
		// 	query.$or = [{ classType: searchRegex }, { leadDescription: searchRegex }]
		// }
		// Check if status parameter is provided
		if (args.status) {
			query.status = args.status
		}
		if (args.classType) {
			query.classType = args.classType
		}

		const newData = await leadModel
			.find(query)
			.populate('enquire')
		// .populate('student')
			.populate({
				path: 'student',
				populate: {
					path: 'classId',
					model: 'Class',
				},
			})
			.populate({
				path: 'parent',
				model: 'Parents',
				populate: {
					path: 'children',
					model: 'Students',
					populate: {
						path: 'classId',
						model: 'Class',
					},
				},
			})
			.populate('staff')
			.populate('leadFollowCmmments.staff')

		let filteredData = newData

		if (args.search) {
			// Perform additional filtering
			filteredData = newData.filter((lead) => {
				// Apply your filtering conditions here
				// For example, filter by student name
				return lead.student.name
					.toLowerCase()
					.includes(args.search.toLowerCase())
			})
		}

		// console.log(JSON.stringify(filteredData, null, 3), 'ILead')
		return filteredData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const getLeadsById = async (
	_: any,
	args: {
    id: string
  }
): Promise<ILead | null> => {
	try {
		const newData = await leadModel
			.findOne({ _id: args.id })
			.populate('enquire')
			.populate('student')
			.populate({
				path: 'parent',
				model: 'Parents',
				populate: {
					path: 'children',
					model: 'Students',
					populate: {
						path: 'classId',
						model: 'Class',
					},
				},
			})
			.populate('staff')
			.populate('leadFollowCmmments.staff')
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const updateLeadDescription = async (
	_: any,
	args: { id: string; description: string }
): Promise<ILead | null> => {
	try {
		const { id, description } = args

		// Find the lead by ID and update the description
		const updatedLead = await leadModel.findByIdAndUpdate(
			id,
			{ leadDescription: description },
			{ new: true }
		)

		return updatedLead
	} catch (error: any) {
		throw new Error(error)
	}
}
export const updateLeadDueDate = async (
	_: any,
	args: { id: string; newDate: Date }
): Promise<ILead | null> => {
	try {
		const { id, newDate } = args
		const leadData = await leadModel.findById({
			_id: id,
		})
		const classData:any = await studentmodel.findById({
			_id: leadData?.student._id,
		}).populate('classId')
		if(classData?.classId[0]?.classType !== 'Trial_Class'){
			throw new Error('Due Date is Only for Trail Classes')
		}
		// Find the lead by ID and update the dueDate
		const updatedLead = await leadModel.findByIdAndUpdate(
			id,
			{ dueDate: newDate },
			{ new: true }
		)
		return updatedLead
	} catch (error: any) {
		throw new Error(error)
	}
}

export const updateLeadStatus = async (
	_: any,
	args: { id: string; status: string }
): Promise<ILead | null> => {
	try {
		const { id, status } = args

		// Find the lead by ID and update the status
		const leadId = await leadModel.findById(id)
		if (!leadId) {
			throw new Error('Lead not found')
		}
		const curretnStatus = leadId.leadStatus
		const updatedLead = await leadModel.findByIdAndUpdate(
			id,
			{ leadStatus: status },
			{ new: true }
		)

		if (!updatedLead) {
			throw new Error('Lead not found')
		}

		// Create a new lead history entry
		const leadHistoryEntry = new leadHistoryModel({
			oldStatus: curretnStatus,
			newStatus: status,
			createdAt: new Date(),
		})

		// Save the lead history entry
		await leadHistoryEntry.save()

		// Update the lead's leadHistory array with the new entry
		updatedLead.leadHistory.push(leadHistoryEntry)

		// Save the updated lead document
		await updatedLead.save()

		return updatedLead
	} catch (error: any) {
		throw new Error(error)
	}
}

export const deleteLead = async (
	_: any,
	args: { id: string }
): Promise<boolean> => {
	try {
		const { id } = args

		// Find the lead by ID and delete it
		const deletedLead = await leadModel.findByIdAndDelete(id)

		if (deletedLead) {
			// Lead successfully deleted
			return true
		} else {
			// Lead with the provided ID was not found
			return false
		}
	} catch (error: any) {
		throw new Error(error)
	}
}
export const deleteAllLead = async (_: any): Promise<boolean> => {
	try {
		await leadModel.deleteMany({})

		return true
	} catch (error: any) {
		throw new Error(error)
	}
}

export const assignStaffToLead = async (
	_: any,
	args: { leadId: string; staffId: string }
): Promise<ILead | null> => {
	try {
		const { leadId, staffId } = args

		// Find the lead by ID
		const lead = await leadModel.findById(leadId)

		if (!lead) {
			throw new Error('Lead not found')
		}

		// Find the staff member by ID
		const staffMember = await usermodel.findById(staffId)

		if (!staffMember) {
			throw new Error('Staff member not found')
		}

		// Check if the staff member already exists in the staff array
		const isStaffExist = lead.staff.some((staff) =>
			staff.equals(staffMember._id)
		)

		if (isStaffExist) {
			// Staff member already exists, ignore adding them
			return lead
		}

		// Push the staff member to the staff array in the lead document
		lead.staff.push(staffMember)

		// Save the updated lead document
		const updatedLead = await lead.save()

		return updatedLead
	} catch (error: any) {
		throw new Error(error)
	}
}

export const removeStaffFromLead = async (
	_: any,
	args: { leadId: string; staffId: string }
): Promise<ILead | null> => {
	try {
		const { leadId, staffId } = args

		// Find the lead by ID
		const lead = await leadModel.findById(leadId)

		if (!lead) {
			throw new Error('Lead not found')
		}

		// Find the staff member by ID
		const staffMember = await usermodel.findById(staffId)

		if (!staffMember) {
			throw new Error('Staff member not found')
		}

		// Check if the staff member exists in the staff array
		const staffIndex = lead.staff.findIndex((staff) =>
			staff.equals(staffMember._id)
		)

		if (staffIndex === -1) {
			// Staff member doesn't exist, ignore removing them
			return lead
		}

		// Remove the staff member from the staff array
		lead.staff.splice(staffIndex, 1)

		// Save the updated lead document
		const updatedLead = await lead.save()

		return updatedLead
	} catch (error: any) {
		throw new Error(error)
	}
}

export const addLeadAttachments = async (
	_: any,
	args: {
    leadId: string
    attachment: string
    staffId?: string
  },
	ctx: any
): Promise<ILead | null> => {
	try {
		const authService = new AuthServices()
		const getStaffId = await authService.CheckAuthUser(
			ctx.headers['authorization']
		)

		const { leadId, attachment, staffId } = args

		// Find the lead by ID
		const lead = await leadModel.findById(leadId)

		if (!lead) {
			throw new Error('Lead not found')
		}

		// Create an array to store the staff members
		const staffMembers: IUser[] = []

		// If staffId is provided, find the staff member by ID
		if (staffId) {
			const staffMember = await usermodel.findById(staffId)

			if (!staffMember) {
				throw new Error(`Staff member not found for ID: ${staffId}`)
			}

			staffMembers.push(staffMember)
		}
		const currentDate = new Date()

		// Create the lead attachment object
		const leadAttachment: any = {
			attachment: attachment,
			staff: [getStaffId],
			createdAt: currentDate,
		}

		// Add the lead attachment to the lead's leadAttachments array
		lead.leadAttachments.push(leadAttachment)

		// Save the updated lead document
		const updatedLead = await lead.save()

		return updatedLead
	} catch (error: any) {
		throw new Error(error)
	}
}

export const editLeadAttachment = async (
	_: any,
	args: { leadId: string; attachmentId: string; attachment: string },
	ctx: any
): Promise<ILead | null> => {
	try {
		const authService = new AuthServices()
		const getStaffId = await authService.CheckAuthUser(
			ctx.headers['authorization']
		)

		const { leadId, attachmentId, attachment } = args

		// Find the lead by ID
		const lead = await leadModel.findById(leadId)

		if (!lead) {
			throw new Error('Lead not found')
		}

		// Find the lead attachment by ID
		const leadAttachment = lead.leadAttachments.find(
			(attachment) => attachment._id.toString() === attachmentId
		)

		if (!leadAttachment) {
			throw new Error('Lead attachment not found')
		}

		// Update the attachment value
		if (attachment) {
			leadAttachment.attachment = attachment
		}

		leadAttachment.staff = [getStaffId]

		// Save the updated lead document
		const updatedLead = await lead.save()

		return updatedLead
	} catch (error: any) {
		throw new Error(error)
	}
}

export const deleteLeadAttachment = async (
	_: any,
	args: { leadId: string; attachmentId: string }
): Promise<ILead | null> => {
	try {
		const { leadId, attachmentId } = args

		// Find the lead by ID
		const lead = await leadModel.findById(leadId)

		if (!lead) {
			throw new Error('Lead not found')
		}

		// Find the index of the lead attachment by ID
		const attachmentIndex = lead.leadAttachments.findIndex(
			(attachment) => attachment._id.toString() === attachmentId
		)

		if (attachmentIndex === -1) {
			throw new Error('Lead attachment not found')
		}

		// Remove the lead attachment from the array
		lead.leadAttachments.splice(attachmentIndex, 1)

		// Save the updated lead document
		const updatedLead = await lead.save()

		return updatedLead
	} catch (error: any) {
		throw new Error(error)
	}
}

export const addLeadFollowComments = async (
	_: any,
	args: {
    leadId: string
    commentAttachment: string
    comment: string
    staffId?: string
  },
	ctx: any
): Promise<ILead | null> => {
	try {
		const currentDate = new Date()

		const authService = new AuthServices()
		const getStaffId = await authService.CheckAuthUser(
			ctx.headers['authorization']
		)

		const { leadId, comment, commentAttachment } = args

		// Find the lead by ID
		const lead = await leadModel.findById(leadId)

		if (!lead) {
			throw new Error('Lead not found')
		}
		if (getStaffId) {
			// const staffMember = await usermodel.findById(staffId)

			// if (!staffMember) {
			// 	throw new Error(`Staff member not found for ID: ${staffId}`)
			// }
			const leadFollowComment: any = {
				comment: comment,
				staff: getStaffId,
				commentAttachment: commentAttachment,
				createdAt: currentDate,
			}

			// Add the lead follow comment to the lead's leadFollowCmmments array
			lead.leadFollowCmmments.push(leadFollowComment)
		}

		// Save the updated lead document
		const updatedLead = await lead.save()

		return updatedLead
	} catch (error: any) {
		throw new Error(error)
	}
}
export const updateLeadFollowComment = async (
	_: any,
	args: {
    leadId: string
    commentAttachment: string
    commentId: string
    comment: string
  }
): Promise<ILead | null> => {
	try {
		const { leadId, commentId, comment } = args

		// Find the lead by ID
		const lead = await leadModel.findById(leadId)

		if (!lead) {
			throw new Error('Lead not found')
		}

		// Find the lead follow comment by ID
		const leadFollowComment = lead.leadFollowCmmments.find(
			(c) => c._id.toString() === commentId
		)

		if (!leadFollowComment) {
			throw new Error('Lead follow comment not found')
		}

		// Update the comment text
		leadFollowComment.comment = comment

		if (args.commentAttachment) {
			leadFollowComment.commentAttachment = args.commentAttachment
		}
		// Save the updated lead document
		const updatedLead = await lead.save()

		return updatedLead
	} catch (error: any) {
		throw new Error(error)
	}
}

export const deleteLeadFollowComment = async (
	_: any,
	args: { leadId: string; commentId: string }
): Promise<ILead | null> => {
	try {
		const { leadId, commentId } = args

		// Find the lead by ID
		const lead = await leadModel.findById(leadId)

		if (!lead) {
			throw new Error('Lead not found')
		}

		// Find the index of the lead follow comment
		const commentIndex = lead.leadFollowCmmments.findIndex(
			(c) => c._id.toString() === commentId
		)

		if (commentIndex === -1) {
			throw new Error('Lead follow comment not found')
		}

		// Remove the lead follow comment from the array
		lead.leadFollowCmmments.splice(commentIndex, 1)

		// Save the updated lead document
		const updatedLead = await lead.save()

		return updatedLead
	} catch (error: any) {
		throw new Error(error)
	}
}
