import classModel from '@models/schedule/classes.models'
import StudentsService from './module.service'
import students from '@models/students.model'
import sessionModel from '@models/schedule/session/sessions.model'
import parentmodel from '@models/parents.model'
import mongoose from 'mongoose'

const getAllStudents = async (_: any, a: any, ctx: any) => {
	const services = new StudentsService()
	return await services.fetchAll()
}

const getStudent = async (_: any, args: { _id: string }) => {
	const services = new StudentsService()
	return await services.fetchById(args._id)
}

interface FilterOptions {
  page: number
  perPage: number
  search?: string
}

const adminStudentList = async (_: any, options: FilterOptions) => {
	try {
		const { page, perPage, search } = options

		// Build the query object based on the provided options
		const query: Record<string, any> = {}

		if (search) {
			const parentsData = await parentmodel.find({
				name: { $regex: search, $options: 'i' },
			})
			const parentIds = parentsData.map((parent) => parent._id)
			query.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ parentId: { $in: parentIds } },
			]
		}

		// Retrieve the count of total entries matching the query
		const totalEntries = await students.countDocuments(query)

		// Apply pagination
		const skip = (page - 1) * perPage
		const limit = perPage

		// Retrieve the list of students with their parent data and apply pagination
		const studentsData:any = await students
			.find(query)
			.populate('parentId')
			.sort({ _id: -1 })
			.skip(skip)
			.limit(limit)

		const result = []

		for (const studentObj of studentsData) {
			// Fetch the classes for the current student
			const classes = await classModel.find({ students: studentObj._id })

			// Create an array to store the class information
			// const studentClasses = []

			// Initialize counters for sessions attended and missed
			let totalSessionsAttended = 0
			let totalSessionsMissed = 0

			// Loop through each class
			for (const classItem of classes) {
				// Fetch the sessions for the current class
				const sessions = await sessionModel.find({ class: classItem._id })

				// Get the session IDs for the current student's attendance
				const currentDate = new Date()
				const sessionIdsAttended = sessions
					.filter((session) => {
						// Filter sessions based on date, from time, and to time
						return (
							session.Date < currentDate &&
              session.fromTime < currentDate &&
              session.toTime < currentDate
						)
					})
					.filter((session) =>
						session.attendees.includes(
							new mongoose.Types.ObjectId(studentObj._id)
						)
					)
					.map((session) => session._id)

				// Calculate the missed sessions count
				const missedSessions = sessions.filter(
					(session) =>
						!session.attendees.includes(
							new mongoose.Types.ObjectId(studentObj._id)
						) &&
            (session.Date < currentDate ||
              session.fromTime < currentDate ||
              session.toTime < currentDate)
				)
				const missedSessionsCount = missedSessions.length

				// Update the total sessions attended and missed counters
				totalSessionsAttended += sessionIdsAttended.length
				totalSessionsMissed += missedSessionsCount
			}

			// Add the student with their classes and attendance data to the result array
			result.push({
				studentId: studentObj._id,
				studentName: studentObj.name,
				parent: {
					parentId: studentObj.parentId?._id ?? '',
					parentName:  studentObj.parentId?.name ?? '',
					parentEmail:  studentObj.parentId?.email ?? '',
					parentPhone:  studentObj.parentId?.phone ?? '',
				},
				// classes: studentClasses,
				totalClasses: classes.length,
				totalSessionsAttended,
				totalSessionsMissed,
			})
		}

		return {
			data: result,
			totalEntries,
		}
	} catch (error) {
		// Handle any errors that occur during the process
		console.error('Error:', error)
		throw new Error('Failed to fetch student data.')
	}
}

const adminGetStudentInfo = async (_: any, options: { id: string }) => {
	const student = await students.findById(options.id)
	if (!student) {
		throw new Error(`Student with ID ${options.id} not found`)
	}

	const classes = await classModel.aggregate([
		{
			$lookup: {
				from: 'sessions',
				localField: 'sessions',
				foreignField: '_id',
				as: 'sessions',
			},
		},
		{
			$unwind: '$sessions',
		},
		{
			$lookup: {
				from: 'students',
				localField: 'students',
				foreignField: '_id',
				as: 'students',
			},
		},
		{
			$match: {
				'students._id': student._id,
			},
		},
		{
			$lookup: {
				from: 'centers',
				localField: 'center',
				foreignField: '_id',
				as: 'center',
			},
		},
		{
			$group: {
				_id: '$_id',
				classCode: { $first: '$classCode' },
				classType: { $first: '$classType' },
				classLevel: { $first: '$classLevel' },
				mode: { $first: '$mode' },
				center: { $first: { $arrayElemAt: ['$center', 0] } },
				fromDate: { $first: '$fromDate' },
				toDate: { $first: '$toDate' },
				status: { $first: '$status' },
				sessionsCount: { $sum: 1 },
				attended: {
					$sum: {
						$cond: [
							{ $isArray: '$sessions.attendees' },
							{ $size: '$sessions.attendees' },
							0,
						],
					},
				},
				missed: {
					$sum: {
						$cond: [
							{
								$and: [
									{ $not: ['$sessions.attendees'] },
									// { $eq: ['$sessions.status', 'COMPLETED'] },
								],
							},
							1,
							0,
						],
					},
				},
			},
		},
		{
			$project: {
				// _id: 0,
				classCode: 1,
				classType: 1,
				classLevel: 1,
				mode: 1,
				center: { $ifNull: ['$center', 'N/A'] },
				fromDate: 1,
				toDate: 1,
				status: 1,
				sessionsCount: 1,
				attended: 1,
				missed: 1,
			},
		},
	])

	const studentInfo = {
		id: student._id,
		name: student.name,
		studentType: student.studentType,
		parentId: student.parentId,
		cardDetails: student.cardDetails,
		BankAccountDetails: student.BankAccountDetails,
		classes: classes,
	}
	// console.log(studentInfo,"studentInfo")
	return studentInfo
}
export { adminGetStudentInfo, adminStudentList, getAllStudents, getStudent }
