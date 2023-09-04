import assignmentModel from '@models/assignment.model'
import studentmodel from '@models/students.model'
import BaseService from '@resolvers/BaseService'
import { IAssignment } from '@schema/entity.types'
import { isValidObjectId } from 'mongoose'

interface IAssignmentService {
  fetchByClass(classId: string): Promise<AssignmentServiceRR.Response[]>
}

export default class AssignmentService
	extends BaseService
	implements IAssignmentService
{
	async create(
		data: AssignmentServiceRR.Request
	): Promise<AssignmentServiceRR.Response> {
		if (!isValidObjectId(data.classId)) {
			throw new Error('Invalid class ID')
		}
		if (!isValidObjectId(data.sessionId)) {
			throw new Error('Invalid session ID')
		}
		if (data.docType === null || data.docType === '') {
			throw new Error('Invalid DocType')
		}

		if (
			data.questionUrl === '' ||
      data.questionUrl === null ||
      data.questionUrl === undefined
		) {
			throw new Error('Invalid S3 Key')
		}
		const currentDate = new Date()
		data.createdAt = currentDate
		return await assignmentModel.create(data)
	}

	async fetchAll(): Promise<AssignmentServiceRR.Response[]> {
		return await assignmentModel
			.find()
			.populate('classId')
			.populate('submission.studentId')
	}

	async fetchById(id: string): Promise<AssignmentServiceRR.Response> {
		return await assignmentModel
			.findOne({ _id: id })
			.populate('classId')
			.populate('submission.studentId')
	}

	async update(
		data: AssignmentServiceRR.Request & { _id: string }
	): Promise<AssignmentServiceRR.Response> {
		const updatedData: { [key: string]: any } = {}

		Object.entries(data)?.map((entry) => {
			const key = entry[0]
			const value = entry[1]
			if (key !== '_id') {
				updatedData[key] = value
			}
		})

		return await assignmentModel.findOneAndUpdate(
			{ _id: data._id },
			updatedData
		)
	}

	async deleteById(id: string): Promise<AssignmentServiceRR.Response> {
		const assignmentId = await assignmentModel.findOne({ _id: id })

		if (!assignmentId) {
			throw new Error('No such media file exists')
		}

		await assignmentModel.deleteOne({ _id: id })

		return assignmentId
	}

	async fetchByClass(classId: string): Promise<AssignmentServiceRR.Response[]> {
		// const date = new Date()
		// date.setDate(1)
		// ,forMonth:{$gte:date}
		const data = await assignmentModel
			// .find()
			.find({ classId: classId })
			.populate('classId')
			.populate('submission.studentId')
		return data
	}

	async addStudentSubmition(
		_id: string,
		studentId: string,
		answerUrl: string
	): Promise<boolean> {
		const studentCheck = await studentmodel.findOne({ _id: studentId })

		if (!studentCheck) {
			throw new Error('Student not found')
		}

		const assignmentCheck = await assignmentModel.findOne({ _id: _id })

		if (!assignmentCheck) {
			throw new Error('Assignment not found')
		}

		const assignmnet = await assignmentModel.updateOne(
			{ _id: _id },
			{
				$push: {
					submission: {
						studentId: studentId,
						answerUrl: answerUrl,
					},
				},
			}
		)

		return assignmnet.acknowledged
	}
}

export namespace AssignmentServiceRR {
  export type Request = Omit<IAssignment, '_id' | 'submission'>
  export type Response = IAssignment | null
}
