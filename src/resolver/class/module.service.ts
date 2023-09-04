/* eslint-disable no-mixed-spaces-and-tabs */
import BaseService from '@resolvers/BaseService'
import classes from '@models/schedule/classes.models'
import { IClass, ISession } from '@schema/entity.types'
import center from '@models/center.model'
import { classLevel, classMode, classTypes } from '@utils/const'
import globalValidators from '@utils/globalValidators'
import students from '@models/students.model'
import sessions from '@models/schedule/session/sessions.model'
import mongoose from 'mongoose'
import sessionModel from '@models/schedule/session/sessions.model'

export default class classesService
implements BaseService<classesRR.Request, classesRR.Response>
{
	// constructor(
	// 	private readonly studentsService?:StudentsService
	// ){}

	async create(data: classesRR.Request): Promise<IClass> {
		if (!classTypes.includes(data.classType)) {
			throw new Error(`
			following options allowed,
			${classTypes.toLocaleString()}
		`)
		}
		if (!classLevel.includes(data.classLevel)) {
			throw new Error(`
			following options allowed,
			${classLevel.toLocaleString()}
		`)
		}
		if (!data.classCode) {
			throw new Error('Class code is required')
		}
		if (!classMode.includes(data.mode)) {
			throw new Error(`
			following options allowed,
			${classMode.toLocaleString()}
		`)
		}

		if (data.mode === 'Offline' && !data.centerId) {
			throw new Error(`
			Select Center,`)
		}

		if (data.centerId) {
			const myCenter = await center.findById({ _id: data.centerId })

			data['center'] = myCenter
		}

		// const classCode = globalValidators.generateClassCode(4)
		const newArgs = { ...data }

		const newData = await classes.create({ ...newArgs })
		newData.save()

		return newData
	}

	async fetchAll(): Promise<classesRR.Response[]> {
		const response = await classes
			.find()
			.populate('center')
			.populate('sessions')
			.populate('students')
		return response
	}

	async fetchById(id: string): Promise<classesRR.Response> {
		return await classes.findOne({ _id: id })
			.populate('center')
			.populate('sessions')
			.populate('students')
	}

	async fetchByEmail(email: string): Promise<classesRR.Response> {
		return await classes.findOne({ email: email })
	}

	async deleteById(id: string): Promise<any> {
		return await classes.deleteOne({ _id: id })
	}

	async update(
		data: classesRR.Request & { _id: string }
	): Promise<classesRR.Response> {
		const updatedData: { [key: string]: any } = {}

		if (!data._id.match(/^[0-9a-fA-F]{24}$/)) {
			throw new Error('Invalid ID')
		}

		const existing = await classes.findOne({ _id: data._id })
		if (!existing) {
			throw new Error('classes not found')
		}

		if (!classTypes.includes(data.classType)) {
			throw new Error(`
			following options allowed,
			${classTypes.toLocaleString()}
		`)
		}
		if (!classLevel.includes(data.classLevel)) {
			throw new Error(`
			following options allowed,
			${classLevel.toLocaleString()}
		`)
		}
		if (!classMode.includes(data.mode)) {
			throw new Error(`
			following options allowed,
			${classMode.toLocaleString()}
		`)
		}

		if (data.mode === 'Offline' && !data.centerId) {
			throw new Error(`
			Select Center,`)
		}
		if (data.centerId) {
			const myCenter = await center.findById({ _id: data.centerId })

			data['center'] = myCenter
		}
		
		Object.entries(data)?.map((entry) => {
			const key = entry[0]
			const value = entry[1]
			if (key !== '_id') {
				updatedData[key] = value
			}
		})
		return await classes.findOneAndUpdate({ _id: data._id }, updatedData)
	}

	async addStudents(
		data: { classId: string; studentIds: [string] } & { _id: string }
	): Promise<classesRR.Response> {
		const { classId, studentIds } = data

		// Fetch the class by ID
		const classObject = await classes.findOne({ _id: classId })
		if (!classObject) {
			throw new Error(`Class with ID ${classId} not found`)
		}

		// Fetch all the students by ID
		const studentsList: any = await students.find({
			_id: { $in: studentIds.map((id) => id) },
		})

		// Add the new students to the class
		const updatedClass = await classes.findOneAndUpdate(
			{ _id: classId },
			{ $push: { students: { $each: studentsList } } },
			{ returnOriginal: false }
		)
		const myClass = await classes.findById({ _id: classId })

		await students.updateMany(
			{ _id: { $in: studentsList } },
			{ $addToSet: { classId: myClass } }
		)

		return updatedClass
	}

	async getClassListByStudentId(
		studentId: string
	): Promise<classesRR.Response[]> {
		return await classes
			.find({ students: studentId })
			.select('_id classCode classType classLevel')
	}

	async getClassHistory(
		studentId: string,
		classId: string,
		historyType: string
	): Promise<{ year: number; month: number; sessions: ISession[] }[]> {
		const historyData = await sessions
			.find({ class: classId })
			.populate('class')
		const currentTime = Date.now()
		const newStudentId = new mongoose.Types.ObjectId(studentId)

		// console.log(JSON.stringify(historyData,null,3), 'historyData')

		const filteredSessions: typeof historyData = historyData.filter(
			(session) => {
				const sessionDateTime = new Date(session.Date)
				const sessionTime = new Date(session.fromTime)
				sessionDateTime.setHours(sessionTime.getHours())
				sessionDateTime.setMinutes(sessionTime.getMinutes())
				sessionDateTime.setSeconds(sessionTime.getSeconds())
				if (!Array.isArray(session?.class)) {
					return
				}

				if (historyType === 'Completed') {
					return (
						sessionDateTime.getTime() < currentTime &&
            session?.class[0]?.students?.includes(newStudentId)
					)
				}
				if (historyType === 'Upcoming') {
					return (
						sessionDateTime.getTime() > currentTime &&
            session?.class[0]?.students?.includes(newStudentId)
					)
				}
			}
		)

		const sessionsByMonth = filteredSessions.reduce<
      { year: number; month: number; sessions: typeof filteredSessions }[]
    >((acc, session) => {
    	const sessionDateTime = new Date(session.Date)
    	const year = sessionDateTime.getFullYear()
    	const month = sessionDateTime.getMonth() + 1

    	const existingMonth: any = acc.find(
    		(m) => m.year === year && m.month === month
    	)
    	if (existingMonth) {
    		existingMonth.sessions.push(session)
    	} else {
    		acc.push({ year, month, sessions: [session] })
    	}

    	return acc
    }, [])

		return sessionsByMonth
	}

	async getAllClassByCoachId(coachId:string ,offset:number,limit:number,search:string,sortBy?:string,order?:string){
		const sessionData = await sessionModel.find({$or:[{permanentCoach:coachId},{temporaryCoach:coachId}]})
		
		const filter:any = {
			sessions:{$in:sessionData.map(v=>v?._id)},
		}

		if(search && !!search){
			filter['$or']= [
				{ classCode: { $regex: search, $options: 'i' } },
				{ classType: { $regex: search, $options: 'i' } },
				{ classLevel: { $regex: search, $options: 'i' } },
				{ mode: { $regex: search, $options: 'i' } },
				{ fromDate: { $regex: search, $options: 'i' } },
				{ toDate: { $regex: search, $options: 'i' } },
				{ status: { $regex: search, $options: 'i' } },
			]
		}

		return {
			data:await classes
				.find(filter)
				.skip(offset)
				.limit(limit)
				.sort(!!sortBy && !!order ?{[sortBy]:order==='ASC'?1:-1}:{})
				.populate('center')
				.populate('sessions')
				.populate('students'),
			total:await classes.count(filter)
		}
	}
}


export namespace classesRR {
  export type Request = Omit<IClass, '_id' | 'password'>
  export type Response = IClass | null
}
