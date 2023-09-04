import BaseService from '@resolvers/BaseService'
import sessions from '@models/schedule/session/sessions.model'
import { ISession } from '@schema/entity.types'
import classes from '@models/schedule/classes.models'
import { sessionTypes } from '@utils/const'
import sessionModel from '@models/schedule/session/sessions.model'
import studentmodel from '@models/students.model'
import mongoose from 'mongoose'
import axios from 'axios'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { refreshToken } from './zoom/tokenUtils'

export default class sessionsService
implements BaseService<sessionsRR.Request, sessionsRR.Response>
{
	// constructor(
	// 	private readonly studentsService?:StudentsService
	// ){}
	async create(data: sessionsRR.Request): Promise<ISession> {
		if (!sessionTypes.includes(data.sessionType)) {
			throw new Error(`
			Following options are allowed: ${sessionTypes.join(', ')}
		  `)
		}

		if (data.classId) {
			const myClass = await classes.findById({ _id: data.classId })
			if (!myClass) {
				throw new Error('Class not found')
			}
			data['class'] = myClass
		}

		const newArgs = { ...data }
		// console.log(data.Date,'date')
		// console.log(data.fromTime,'fromTime')
		// console.log(data.toTime,'toTime')
		const from = new Date(data.fromTime) // Convert fromTime to a Date object
		const to = new Date(data.toTime) // Convert toTime to a Date object

		const durationInMinutes = Math.floor(
			(to.getTime() - from.getTime()) / (1000 * 60)
		)


		let access_token = process.env.zoom_access_token!
		const refresh_token = process.env.zoom_refresh_token!
      
		// Get the expiration time of the access token (assuming it's in UNIX timestamp format)

		const decodedToken = jwt.decode(access_token) as JwtPayload | null
		if (decodedToken) {
			const expirationTime = decodedToken.exp as number
			const currentTime = Math.floor(Date.now() / 1000)
			if (expirationTime < currentTime) {
				access_token = await refreshToken(refresh_token)
			}
		}

		try {
			const meetingResponse = await axios.post(
				'https://api.zoom.us/v2/users/me/meetings',
				{
					topic: data.sessionName,
					type: 2, // Scheduled meeting
					start_time: data.fromTime,
					duration: durationInMinutes > 200 ? 60 : durationInMinutes,
				},
				{
					headers: {
						Authorization: `Bearer ${access_token}`,
						'Content-Type': 'application/json',
					},
				}
			)

			const { join_url, start_url,id, password } = meetingResponse.data
			
			newArgs['meeingLink'] = join_url
			newArgs['start_url'] = start_url
			newArgs['meeting_id'] = id
			newArgs['meeting_passcode'] = password

			const newData = await sessions.create({ ...newArgs })
			// console.log(newData.Date,'newDatadate')
			// console.log(newData.fromTime,'newDatafromTime')
			// console.log(newData.toTime,'newDatatoTime')
			if (newData.class) {
				await classes.updateOne(
					{ _id: newData.class },
					{ $push: { sessions: newData } }
				)
			}
			newData.save()
			return newData
		} catch (error) {
			throw new Error(`error: ${error}`)
		}
	}

	async fetchAll(): Promise<sessionsRR.Response[]> {
		const response = await sessions
			.find()
			.populate({
				path: 'class',
				populate: {
					path: 'center',
				},
			})
			.populate('permanentCoach')
			.populate('temporaryCoach')
			.populate('attendees')

		console.log(response[response.length - 1].class, 'res')
		return response
	}

	async fetchById(id: string): Promise<sessionsRR.Response> {
		return await sessions
			.findOne({ _id: id })
			.populate({
				path: 'class',
				populate: {
					path: 'center',
				},
			})
			.populate('permanentCoach')
			.populate('temporaryCoach')
			.populate('attendees')
		// .populate({
		// 	path: 'class',
		// 	populate: 'center',
		// })
	}

	async fetchByEmail(email: string): Promise<sessionsRR.Response> {
		return await sessions
			.findOne({ email: email })
			.populate({
				path: 'class',
				populate: {
					path: 'center',
				},
			})
			.populate('permanentCoach')
			.populate('temporaryCoach')
			.populate('attendees')
	}

	async deleteById(id: string): Promise<any> {
		return await sessions.deleteOne({ _id: id })
	}

	async update(
		data: sessionsRR.Request & {
      _id: string
      summary: string
      progressReport: string
    }
	): Promise<sessionsRR.Response> {
		const updatedData: { [key: string]: any } = {}

		if (!data._id.match(/^[0-9a-fA-F]{24}$/)) {
			throw new Error('Invalid ID')
		}

		const existing = await sessions.findOne({ _id: data._id })
		if (!existing) {
			throw new Error('sessions not found')
		}

		if (data.sessionType && !sessionTypes.includes(data.sessionType)) {
			throw new Error(`
			following options allowed,
			${sessionTypes.toLocaleString()}
		`)
		}

		if (data.classId) {
			const myClass = await classes.findById({ _id: data.classId })
			data['class'] = myClass
		}

		Object.entries(data)?.map((entry) => {
			const key = entry[0]
			const value = entry[1]
			if (key !== '_id') {
				updatedData[key] = value
			}
		})

		return await sessions.findOneAndUpdate({ _id: data._id }, updatedData)
	}

	// async fetchUpcomingSessions(studentId:string){

	// }

	async markAttendees(
		data: sessionsRR.AttendanceRequest
	): Promise<sessionsRR.AttendanceResponse> {
		const session = await sessions.findOne({ _id: data.sessionId })

		if (!session) {
			throw new Error('Session not found')
		}

		const student = await studentmodel.findOne({ _id: data.studentId })

		if (!student) {
			throw new Error('Student not found')
		}

		let res = ''
		const studentObjectId = new mongoose.Types.ObjectId(data.studentId)
		const checkLedger = session.attendees.includes(studentObjectId)

		if (checkLedger) {
			console.log('pop')
			session.attendees = session.attendees?.filter(
				(v) => v.toString() !== data.studentId
			)
			res = 'student marked absent'
		} else {
			console.log('push')
			session.attendees.push(studentObjectId)
			res = 'student marked present'
		}

		session.save()

		return res
	}

	async getAllSessionByCoachId(
		coachId: string,
		offset: number,
		limit: number,
		search: string,
		sortBy?: string,
		order?: string
	) {
		const filter: any = {
			$or: [{ permanentCoach: coachId }, { temporaryCoach: coachId }],
		}

		if (search && !!search) {
			filter['$or'] = [
				{ sessionType: { $regex: search, $options: 'i' } },
				{ sessionName: { $regex: search, $options: 'i' } },
				{ totalSeats: { $regex: search, $options: 'i' } },
				{ Date: { $regex: search, $options: 'i' } },
				{ fromTime: { $regex: search, $options: 'i' } },
				{ toTime: { $regex: search, $options: 'i' } },
				{ status: { $regex: search, $options: 'i' } },
				{ summary: { $regex: search, $options: 'i' } },
				{ progressReport: { $regex: search, $options: 'i' } },
			]
		}
		const sessionData = await sessionModel
			.find(filter)
			.skip(offset)
			.limit(limit)
			.sort(!!sortBy && !!order ? { [sortBy]: order === 'ASC' ? 1 : -1 } : {})

		return { data: await sessionData, total: await sessionModel.count(filter) }
	}
}

export namespace sessionsRR {
  export type Request = Omit<
    ISession,
    '_id' | 'password' | 'attendees' | 'summary' | 'progressReport'
  >
  export type Response = ISession | null

  export type AttendanceRequest = { sessionId: string; studentId: string }
  export type AttendanceResponse = string
}
