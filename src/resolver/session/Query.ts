import sessionModel from '@models/schedule/session/sessions.model'
import sessionService from './module.service'
import classModel from '@models/schedule/classes.models'
import AuthServices from '@resolvers/auth/module.service'
import mongoose from 'mongoose'
import sessionFeedBackModel from '@models/schedule/session/sessionsFeedback.models'
import coachModel from '@models/coach.model'
import assignmentModel from '@models/assignment.model'
import moment from 'moment'

const getAllSession = async () => {
	const services = new sessionService()
	return await services.fetchAll()
}

const getSession = async (_: any, args: { _id: string }) => {
	const services = new sessionService()
	return await services.fetchById(args._id)
}

const getUpcomingSessions = async (
	_: any,
	args: { studentId: string },
	ctx: any
) => {
	const userClasses = await classModel.find({
		students: { $in: [args.studentId] },
	})
	// extract ids
	const userIds = userClasses.map((v) => v._id)

	// fetch sessions
	const sessionData = await sessionModel
		.find({
			class: { $in: userIds },
			Date: { $gte: new Date() },
			fromTime: { $gte: new Date() },
		})
		.populate({
			path: 'class',
			populate: {
				path: 'center',
				model: 'Center',
			},
		})
		.populate('permanentCoach')
		.populate('temporaryCoach')

	console.log(args.studentId, '\n', sessionData)
	return sessionData
}

// coach
const getCoachClassHistory = async (
	_: any,
	args: { classId: string },
	ctx: any
) => {
	const authService = new AuthServices()
	const coachId = await authService.CheckAuthCoach(ctx.headers['authorization'])

	const data = await sessionModel.aggregate([
		{
			$match: {
				class: { $in: [new mongoose.Types.ObjectId(args.classId)] },
				Date: { $lt: new Date() },
				toTime: { $lt: new Date() },
				$or: [
					{ permanentCoach: new mongoose.Types.ObjectId(coachId) },
					{ temporaryCoach: new mongoose.Types.ObjectId(coachId) },
				],
			},
		},
		{
			$lookup: {
				from: 'classes',
				localField: 'class',
				foreignField: '_id',
				as: 'class',
			},
		},
		{
			$lookup: {
				from: 'coaches', // collection name to join with
				localField: 'permanentCoach',
				foreignField: '_id',
				as: 'permanentCoach',
			},
		},
		{
			$unwind: '$permanentCoach', // convert the array to an object
		},
		{
			$lookup: {
				from: 'coaches', // collection name to join with
				localField: 'temporaryCoach',
				foreignField: '_id',
				as: 'temporaryCoach',
			},
		},
		{
			$unwind: '$temporaryCoach', // convert the array to an object
		},
		{
			$group: {
				_id: { $month: '$Date' },
				sessions: { $push: '$$ROOT' },
			},
		},
		{
			$sort: {
				_id: 1,
			},
		},
	])

	return data
}

const getCoachUpcomingSessions = async (
	_: any,
	args: { classId: string },
	ctx: any
) => {
	const authService = new AuthServices()
	const coachId = await authService.CheckAuthCoach(ctx.headers['authorization'])

	const match: any = {
		Date: { $gte: new Date() },
		// fromTime: { $gte: new Date() },
		$or: [
			{ permanentCoach: new mongoose.Types.ObjectId(coachId) },
			{ temporaryCoach: new mongoose.Types.ObjectId(coachId) },
		],
	}

	if (args.classId) {
		match['class'] = { $in: [new mongoose.Types.ObjectId(args.classId)] }
	}

	const sessionData2 = await sessionModel.aggregate([
		{
			$match: match,
		},
		{
			$lookup: {
				from: 'classes',
				let: { classIds: '$class' },
				pipeline: [
					{
						$match: {
							$expr: { $in: ['$_id', '$$classIds'] },
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
				],
				as: 'class',
			},
		},
		{
			$lookup: {
				from: 'coaches',
				localField: 'permanentCoach',
				foreignField: '_id',
				as: 'permanentCoach',
			},
		},
		{
			$unwind: '$permanentCoach',
		},
		{
			$lookup: {
				from: 'coaches',
				localField: 'temporaryCoach',
				foreignField: '_id',
				as: 'temporaryCoach',
			},
		},
		{
			$unwind: '$temporaryCoach',
		},
		{
			$group: {
				_id: { $month: '$Date' },
				sessions: { $push: '$$ROOT' },
			},
		},
		{
			$sort: {
				_id: 1,
			},
		},
	])

	return sessionData2
}

const getCoachSessionCalender = async (
	_: any,
	args: { fromDate: string; toDate: string },
	ctx: any
) => {
	const authService = new AuthServices()
	const coachId = await authService.CheckAuthCoach(ctx.headers['authorization'])

	const sessionData2 = await sessionModel.aggregate([
		{
			$match: {
				Date: { $gte: new Date(args.fromDate), $lte: new Date(args.toDate) },
				$or: [
					{ permanentCoach: new mongoose.Types.ObjectId(coachId) },
					{ temporaryCoach: new mongoose.Types.ObjectId(coachId) },
				],
			},
		},
		{
			$lookup: {
				from: 'classes',
				let: { classIds: '$class' },
				pipeline: [
					{
						$match: {
							$expr: { $in: ['$_id', '$$classIds'] },
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
				],
				as: 'class',
			},
		},
		{
			$lookup: {
				from: 'coaches', // collection name to join with
				localField: 'permanentCoach',
				foreignField: '_id',
				as: 'permanentCoach',
			},
		},
		{
			$unwind: '$permanentCoach', // convert the array to an object
		},
		{
			$lookup: {
				from: 'coaches', // collection name to join with
				localField: 'temporaryCoach',
				foreignField: '_id',
				as: 'temporaryCoach',
			},
		},
		{
			$unwind: '$temporaryCoach', // convert the array to an object
		},
	])

	return sessionData2
}

const getSessionsListByClassid = async (
	_: any,
	args: { classId: string },
	ctx: any
) => {
	const classList = await sessionModel
		.find({
			class: { $in: args.classId },
		})
		.exec()
	console.log(classList, 'classList')
	return classList
}

interface FilterOptions {
  page: number
  perPage: number
  studentId?: string
  search?: string
  classId: string
}

async function adminGetSessionsList(_: any, options: FilterOptions) {
	const { page, perPage, search, classId, studentId } = options
	const entriesPerPage = perPage || 10 // Default to 10 entries per page
	const skip = (page - 1) * entriesPerPage

	if (!studentId || !classId) {
		throw new Error('Need Student Id and Class Id')
	}
	let sessionQuery = sessionModel.find({
		class: new mongoose.Types.ObjectId(classId),
	})

	if (search) {
		sessionQuery = sessionQuery.find({
			$or: [
				{ sessionType: { $regex: search, $options: 'i' } },
				{ sessionName: { $regex: search, $options: 'i' } },
				{ summary: { $regex: search, $options: 'i' } },
				// Add more fields to search here if needed
			],
		})
	}

	const countQuery = sessionModel.find({
		class: new mongoose.Types.ObjectId(classId),
	})
	if (search) {
		countQuery.find({
			$or: [
				{ sessionType: { $regex: search, $options: 'i' } },
				{ sessionName: { $regex: search, $options: 'i' } },
				{ summary: { $regex: search, $options: 'i' } },
				// Add more fields to search here if needed
			],
		})
	}

	const sessionCount = await countQuery.countDocuments().exec()
	const totalPages = Math.ceil(sessionCount / entriesPerPage)

	const sessions = await sessionQuery
		.populate('class', 'className')
		.skip(skip)
		.limit(entriesPerPage)
		.exec()

	const sessionAssignments = await assignmentModel
		.find({ classId: { $in: sessions } })
		.exec()

	const sessionDetails = await Promise.all(
		sessions.map(async (session) => {
			const permanentCoach = await coachModel.findById(session.permanentCoach)
			const temporaryCoach = await coachModel.findById(session.temporaryCoach)

			const assignments = sessionAssignments.filter(
				(assignment) => assignment.classId.toString() === session._id.toString()
			)

			return {
				sessionType: session.sessionType,
				sessionName: session.sessionName,
				totalSeats: session.totalSeats,
				permanentCoach: permanentCoach,
				temporaryCoach: temporaryCoach,
				date: session.Date,
				fromTime: session.fromTime,
				toTime: session.toTime,
				status: session.status,
				class: session.class,
				attendees: session.attendees,
				summary: session.summary,
				isStudentPresent: session.attendees.includes(
					new mongoose.Types.ObjectId(studentId)
				),
				progressReport: session.progressReport,
				assignments: assignments,
			}
		})
	)

	return {
		data: sessionDetails,
		totalEntries: sessionCount,
	}
}

interface FilterOptions2 {
  page: number
  perPage: number
  classId: string
  search?: string
  tempCoach?: string
  perCoach?: string
  status?: string
}
async function adminGetSessionsListByClassId(_: any, options: FilterOptions2) {
	const { classId, perPage, page, perCoach, tempCoach, status, search } =
    options

	if (!classId) {
		throw new Error('Class ID is mandatory.')
	}

	let query = sessionModel.find({ class: classId })

	// Filter by coach
	if (perCoach) {
		query = query.find({ permanentCoach: perCoach })
	}

	// Filter by temporary coach
	if (tempCoach) {
		query = query.find({ temporaryCoach: tempCoach })
	}

	// Filter by status
	if (status) {
		const currentDate = new Date().getTime()

		switch (status) {
		case 'completed':
			query = query.where('Date').lt(currentDate)
			break
		case 'current':
			query = query
				.where('date')
				.lte(currentDate)
				.where('fromTime')
				.lte(currentDate)
				.where('toTime')
				.gte(currentDate)
			break
		case 'upcoming':
			query = query.where('Date').gt(currentDate)
			break
		default:
			break
		}
	}

	// Filter by search
	if (search) {
		const searchRegExp = new RegExp(search, 'i')

		query = query.find({
			$or: [
				{ sessionName: { $regex: searchRegExp } },
				{ summary: { $regex: searchRegExp } },
				{ progressReport: { $regex: searchRegExp } },
			],
		})
	}
	query = query.populate('permanentCoach').populate('temporaryCoach')

	const totalEntries = await sessionModel.countDocuments(query)
	const paginatedSessions = await query
		.skip((page - 1) * perPage)
		.limit(perPage)
		.exec()

	const sessionsWithStatus = paginatedSessions.map((session) => ({
		...session.toObject(),
		status: getSessionStatus(session),
	}))

	return {
		data: sessionsWithStatus,
		totalEntries: totalEntries,
	}
}

function getSessionStatus(session: any) {
	const sessionDate = moment(session.Date).format('YYYY-MM-DD')
	if (sessionDate < moment(new Date().toISOString()).format('YYYY-MM-DD')) {
		return 'completed'
	} else if (sessionDate === moment(new Date().toISOString()).format('YYYY-MM-DD')) {
		if (moment(session.fromTime).format('HH:mm') <= moment(new Date().toISOString()).format('HH:mm') && moment(session.toTime).format('HH:mm') >= moment(new Date().toISOString()).format('HH:mm')) {
			return 'current'
		} else if (moment(session.fromTime).format('HH:mm') > moment(new Date().toISOString()).format('HH:mm')) {
			return 'upcoming'
		}
	} else if (sessionDate > moment(new Date().toISOString()).format('YYYY-MM-DD')) {
		return 'upcoming'
	}

	return 'unknown'
}

interface FilterOptions3 {
  page: number
  perPage: number
  classId: string
  sessionId: string
  search: string
}

async function getStudentsWithAttendance(_: any, options: FilterOptions3) {
	const { classId, sessionId, page, perPage, search } = options

	// Retrieve the class object
	const classObj = await classModel.findById(classId).populate({
		path: 'students',
		populate: {
			path: 'parentId',
		},
	})

	// Check if the class exists
	if (!classObj) {
		throw new Error('Class not found')
	}

	// Filter the students for the given page and perPage values
	let filteredStudents = classObj.students

	if (search) {
		const regex = new RegExp(search, 'i')
		filteredStudents = classObj.students.filter((student: any) => {
			return (
				regex.test(student.name) ||
        regex.test(student.parentId.name) ||
        regex.test(student.classId)
        // Add more fields to search here
        // Example: regex.test(student.cardDetails.fieldName)
        // or regex.test(student.BankAccountDetails.fieldName)
			)
		})
	}

	const startIndex = (page - 1) * perPage
	const endIndex = startIndex + perPage
	const students = filteredStudents.slice(startIndex, endIndex)

	// Retrieve attendance, feedback, and assignments for each student in the session
	const attendedStudents = await Promise.all(
		students.map(async (student: any) => {
			const isPresent = await checkAttendance(sessionId, student._id.toString())
			const feedback = await getStudentFeedback(
				sessionId,
				student._id.toString()
			)
			const assignments = await getStudentAssignments(
				classId,
				student._id.toString()
			)
			return { ...student.toObject(), isPresent, feedback, assignments }
		})
	)

	// Count the total number of entries
	const totalEntries = filteredStudents.length

	// Return the result
	return {
		students: attendedStudents,
		totalEntries,
	}
}

async function getStudentAssignments(classId: string, studentId: string) {
	// Implement your logic to retrieve the assignments for the given class and student
	// For example, you can query the assignmentModel in your database
	const assignments = await assignmentModel
		.find({ classId, 'submission.studentId': studentId })
		.populate('submission.studentId')
	return assignments.map((assignment) => {
		const submission = assignment.submission.find(
			(sub) => sub.studentId.toString() === studentId
		)
		return {
			questionUrl: assignment.questionUrl,
			docType: assignment.docType,
			answerUrl: submission?.answerUrl || null,
		}
	})
}

// Simulating attendance check
async function checkAttendance(sessionId: string, studentId: string) {
	// Implement your logic to check attendance for the given session and student
	// For example, you can query the sessionModel in your database
	const session: any = await sessionModel.findById(sessionId)
	if (!session) {
		throw new Error('Session not found')
	}
	return session.attendees.includes(studentId)
}

// Simulating feedback retrieval
async function getStudentFeedback(sessionId: string, studentId: string) {
	// Implement your logic to retrieve the feedback for the given session and student
	// For example, you can query the sessionFeedBackSchema in your database
	const sessionFeedback = await sessionFeedBackModel.findOne({
		sessionId,
		studentId,
	})
	return sessionFeedback?.feedback || null
}

const adminGetAllCoachSession = async (
	_: any,
	{
		coachId,
		offset,
		limit,
		search,
		sortBy,
		order,
	}: {
    coachId: string
    offset: number
    limit: number
    search?: string
    sortBy?: string
    order?: string
  }
) => {
	const services = new sessionService()
	return await services.getAllSessionByCoachId(
		coachId,
		offset - 1,
		limit,
		search ? search : '',
		sortBy,
		order
	)
}

export const getSessionsByClassLevel = async (_: any, ars:{classLevel?: string, classCode?: string}) => {
	const currentDate = new Date().toISOString()
	let match: any = {
		classLevel: ars.classLevel,
		toDate: { $gt: currentDate },
		classType: 'Regular_Class',
	}
	if(ars.classCode) {
		const searchRegExp = new RegExp(ars.classCode, 'i')
		match = {
			classCode: { $regex: searchRegExp },
			toDate: { $gt: currentDate },
			classType: 'Regular_Class',
		}
	}

	const classes = await classModel
		.find(match)
		.sort({ fromDate: 1 })
		.limit(7)
	let sessionIds: any = []
	for (let index = 0; index < classes.length; index++) {
		const element = classes[index]
		sessionIds = sessionIds.concat(element.sessions)
	}
	const today = moment()
	const endOfWeek = today.clone().endOf('week')
	const sessions = await sessionModel.find({ _id: { $in: sessionIds } , Date: {
		$gt: today.toISOString()
	}}).populate('permanentCoach')
	return sessions
}

export {
	getAllSession,
	getSession,
	getUpcomingSessions,
	getSessionsListByClassid,
	adminGetSessionsListByClassId,
	getStudentsWithAttendance,
}
export {
	getCoachClassHistory,
	getCoachUpcomingSessions,
	getCoachSessionCalender,
	adminGetSessionsList,
	adminGetAllCoachSession,
}

// export { getAllSession,getSessionsListByClassid, getSession,getUpcomingSessions,getCoachUpcomingSessions }
