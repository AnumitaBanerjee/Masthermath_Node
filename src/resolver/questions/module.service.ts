import BaseService from '@resolvers/BaseService'
import { questionModel, commentsModel } from '@models/question.model'
import { IComment, IQuestion } from '@schema/entity.types'
import mongoose, { Types } from 'mongoose'
import { PubSub } from 'graphql-subscriptions'
import classes from '@models/schedule/classes.models'

export const pubsub = new PubSub()

export default class questionService
implements BaseService<questionRR.Request, questionRR.Response>
{
	// constructor(
	// 	private readonly studentsService?:StudentsService
	// ){}
	async create(data: {
    question_text: string
    student_id: Types.ObjectId
    class_id: Types.ObjectId
  }): Promise<IQuestion> {
		const newData = await questionModel.create({ ...data })
		newData.save()
		return newData
	}

	async fetchAll(): Promise<questionRR.Response[]> {
		const response = await questionModel
			.find()
			.populate('class_id')
			.populate('comments')
			.populate('student_id')
			.populate({
				path: 'comments',
				populate: 'studentId',
			})
		return response
	}

	async fetchByClassId(
		studnetId: string,
		_id: string
	): Promise<questionRR.Response[]> {
		const data = await questionModel
			.find({ student_id: studnetId })
			.populate('class_id')
			.populate('comments')
			.populate('student_id')
			.populate({
				path: 'comments',
				populate: 'studentId',
			})

		const updatedData = data.filter((q) => {
			return q.class_id._id.toString() === _id
		})

		return updatedData
	}

	async fetchById(id: string): Promise<questionRR.Response> {
		const question = await questionModel.findById({ _id: id })
		if (!question) {
			throw new Error('Question not found')
		}
		question.unseen_comments_count = 0 // turn to 0
		await question.save()
		const data = await questionModel
			.findOne({ _id: id })
			.populate('class_id')
			.populate('comments')
			.populate('student_id')
			.populate({
				path: 'comments',
				populate: [{ path: 'studentId' }, { path: 'coachId' }],
			})
		return data
	}

	// coachId

	async fetchByEmail(email: string): Promise<questionRR.Response> {
		return await questionModel.findOne({ email: email })
	}

	async deleteById(id: string): Promise<any> {
		return await questionModel.deleteOne({ _id: id })
	}

	async update(
		data: questionRR.Request & { _id: string }
	): Promise<questionRR.Response> {
		const updatedData: { [key: string]: any } = {}

		if (!data._id.match(/^[0-9a-fA-F]{24}$/)) {
			throw new Error('Invalid ID')
		}

		const existing = await questionModel.findOne({ _id: data._id })
		if (!existing) {
			throw new Error('question not found')
		}

		// if (data.questionName) {
		// 	const user = await questionModel.findOne({
		// 		questionName: data.questionName,
		// 	})
		// 	if (user && user._id.toString() !== data._id) {
		// 		throw new Error('question name is already in use')
		// 	}
		// }

		Object.entries(data)?.map((entry) => {
			const key = entry[0]
			const value = entry[1]
			if (key !== '_id') {
				updatedData[key] = value
			}
		})

		return await questionModel.findOneAndUpdate({ _id: data._id }, updatedData)
	}

	async questionList(student_id: string): Promise<any> {
		const classIds = await classes.find({ students: student_id })
		const classData = []
		for (const classId of classIds) {
			const questionsCount = await questionModel.find({
				student_id: student_id,
				class_id: classId,
			})
			classData.push({
				classId: classId?._id,
				classType: classId.classType,
				classLevel: classId.classLevel,
				classCode: classId.classCode,
				questionCount: questionsCount.length,
			})
		}

		return classData
	}

	async addComment(data: {
    commentText: string
    questionId: Types.ObjectId
    coachId: Types.ObjectId
    studentId: Types.ObjectId
    userType: string
  }): Promise<IComment> {
		const question = await questionModel.findById({ _id: data.questionId })
		if (!question) {
			throw new Error('Question not found')
		}
		const newData = await commentsModel.create({ ...data })
		newData.save()

		if (newData.questionId) {
			await questionModel.updateOne(
				{ _id: newData.questionId },
				{ $push: { comments: newData } }
			)
		}
		if (data.coachId) {
			question.unseen_comments_count++ // increment unseen_comments_count
		}
		question.comments_count++ // increment unseen_comments_count
		await question.save()
		const updatedNewData = await (
			await newData.populate('studentId')
		).populate('coachId')

		pubsub.publish('COMMENT_ADDED', updatedNewData)
		return newData
	}
}

export namespace commentsRR {
  export type Request = Omit<IComment, '_id' | 'password'>
  export type Response = IComment | null
}

export namespace questionRR {
  export type Request = Omit<IQuestion, '_id' | 'password'>
  export type Response = IQuestion | null
}
