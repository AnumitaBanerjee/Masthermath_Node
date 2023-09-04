import AuthServices from '@resolvers/auth/module.service'
import centerService from './module.service'
import classModel from '@models/schedule/classes.models'
import sessionModel from '@models/schedule/session/sessions.model'
import { commentsModel, questionModel } from '@models/question.model'
import studentmodel from '@models/students.model'
import mongoose from 'mongoose'

const getQuestions = async () => {
	const services = new centerService()
	return await services.fetchAll()
}
const getQuestionByID = async (_: any, args: { _id: string }) => {
	const services = new centerService()
	return await services.fetchById(args._id)
}

const getQuestionsByClassID = async (
	_: any,
	args: { classId: string; studnetId: string }
) => {
	const services = new centerService()
	return await services.fetchByClassId(args.studnetId, args.classId)
}

const classQuestionsList = async (_: any, args: { student_id: string }) => {
	const services = new centerService()
	return await services.questionList(args?.student_id)
}

const getAllQuestionsForCoach = async (_: any, args: any, ctx: any) => {
	const authService = new AuthServices()
	const coachId = await authService.CheckAuthCoach(ctx.headers['authorization'])
	const listOfCoachClasses = await sessionModel.find({
		$or: [{ permanentCoach: coachId }, { temporaryCoach: coachId }],
	})
	const classesList = listOfCoachClasses.map((session) => session.class).flat()

	const questions = await questionModel
		.find({ class_id: { $in: classesList } })
		.populate({
			path: 'class_id',
			populate: {
				path: 'students',
			},
		})
		.populate('comments')
		.populate('student_id')
		.populate({
			path: 'comments',
			populate: 'studentId',
		})

	return questions
}

interface FilterOptions {
  page: number
  perPage: number
  search?: string
}

const adminQuestionsList = async (_: any, options: FilterOptions) => {
	try {
		const { page, perPage, search } = options

		const query = {
			name: { $regex: search, $options: 'i' },
			studentType: { $ne: 'student' },
		}

		const students = await studentmodel
			.find(query)
			.skip((page - 1) * perPage)
			.limit(perPage)

		const studentIds = students.map((student) => student._id)

		const studentData = await Promise.all(
			studentIds.map(async (studentId) => {
				const student = await studentmodel.findById(studentId)
				if (!student) {
					return null
				}

				const latestQuestion: any = await questionModel
					.findOne({ student_id: studentId })
					.sort({ created_at: -1 })
					.populate('class_id')

				const unansweredCount = await questionModel.countDocuments({
					student_id: studentId,
					coachId: { $exists: false },
				})

				return {
					studentId: student._id,
					name: student.name,
					classCode: latestQuestion?.class_id?.classCode || '',
					latestQuestionDate: latestQuestion?.created_at || null,
					unansweredCount,
				}
			})
		)

		const totalEntries = await studentmodel.countDocuments(query)

		return {
			totalEntries,
			data: studentData,
		}
	} catch (error) {
		console.error('Error:', error)
		throw new Error('Failed to fetch student data.')
	}
}

// const getQuestionsWithCoachData = async (
// 	page,
// 	perpage,
// 	studentId,
// 	timePeriod
// ) => {
// 	try {
interface FilterOptions {
  page: number
  perPage: number
  studentId?: string
  timePeriod?: any
}


const getQuestionsWithCoachData = async (_: any, options: FilterOptions) => {
	try {
		const { page, perPage, studentId, timePeriod } = options

		// Calculate the start and end dates based on the given time period
		const currentDate = new Date()
		let startDate, endDate

		if (timePeriod === 'week') {
			startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)
			endDate = currentDate
		} else if (timePeriod === 'month') {
			startDate = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth() - 1,
				currentDate.getDate()
			)
			endDate = currentDate
		} else if (timePeriod === 'all') {
			startDate = null // Set startDate to null to disable the date filtering
			endDate = null // Set endDate to null to disable the date filtering
		} else {
			throw new Error(
				'Invalid time period. Supported values: "week", "month", "all"'
			)
		}

		// Prepare the filter object based on the timePeriod
		const filter: any = {
			student_id: studentId,
		}

		if (startDate && endDate) {
			filter.created_at = { $gte: startDate, $lte: endDate }
		}

		// Query the questions with the given student ID and time period
		const questions = await questionModel
			.find(filter)
			.populate({
				path: 'comments',
				populate: 'coachId',
			})
			.populate('student_id')
			.skip((page - 1) * perPage)
			.limit(perPage)
			.exec()

		// Count the total number of questions
		const totalEntries = await questionModel.countDocuments(filter)

			
		return { data: questions, totalentries: totalEntries }
	} catch (error) {
		throw new Error('Failed to fetch questions: ' + error)
	}
}

export {
	getQuestions,
	getQuestionsByClassID,
	getQuestionByID,
	classQuestionsList,
	adminQuestionsList,
	getQuestionsWithCoachData,
}
export { getAllQuestionsForCoach }
