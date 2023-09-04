/* eslint-disable no-mixed-spaces-and-tabs */
import {
	IEnquire,
	IFormOptionLists,
	IFormOptions,
	IFormQuestions,
	INewWebsiteContent,
	IQuestionOptions,
	IWebsiteCenter,
	IWebsiteContent,
	IWebsiteCourse,
	IWebsiteCourseAmount,
	IWebsitePoints,
	IWebsiteSchudle,
	IWhatsappGetMessages,
} from '@schema/entity.types'
import formQuestionsModel from '@models/websiteQuestions/formQuestions.model'
import WebsiteSchudleModel from '@models/websiteQuestions/websiteSchudle.model'
import WebsiteContentModel from '@models/websiteQuestions/content.model'
import WebsiteCourseModel from '@models/websiteQuestions/websiteCourse.model'
import enquireModel from '@models/websiteQuestions/enquire.modal'
import passwordHasher from '@utils/passwordHasher'
import parents from '@models/parents.model'
import {
	websiteCenterModel,
	websiteContentModel,
	websiteCourseAmountModel,
	websitePointsModel,
} from '@models/websiteQuestions/websiteContent.modal'
import studentmodel from '@models/students.model'
import {
	leadModel,
	leadHistoryModel,
} from '@models/websiteQuestions/lead.model'
import sessionModel from '@models/schedule/session/sessions.model'
import classModel from '@models/schedule/classes.models'
import parentmodel from '@models/parents.model'
import mongoose, { Schema, Types } from 'mongoose'
import Stripe from 'stripe'
import { createStripeAccount } from './utils/Payment'
import whatsappMessage from '@utils/whatsappMessage'
import mail from '@utils/mail'
import moment from 'moment'


export const createFormQuestion = async (
	_: any,
	optionsData: {
    question: string;
    type: string;
	answerCode: string;
    order: number;
    options: IFormOptionLists[];
  }
): Promise<IFormQuestions> => {
	try {
		const { question, options, order, type, answerCode} = optionsData
		const newOptionArray = options.map((item: any) => {
			return ({
				_id: new mongoose.Types.ObjectId(),
				option: item.option,
				label: item.label,
				code: item.code,
				value: item.value,
			})
		})

		const newData = await formQuestionsModel.create({
			question: question,
			type: type,
			order: order,
			answerCode:answerCode ? answerCode : '',
			options: newOptionArray
		})
		return newData
	} catch (error: any) {
		throw new Error(error)
	}
}

export const createWebsiteSchudle = async (
	_: any,
	userInput: IWebsiteSchudle
): Promise<IWebsiteSchudle> => {
	try {
		const createdWebsiteSchudle = await WebsiteSchudleModel.create(userInput)
		createdWebsiteSchudle.save()
		return createdWebsiteSchudle
	} catch (error: any) {
		throw new Error(error)
	}
}

export const createWebsiteContent = async (
	_: any,
	optionsData: {
    contentType: string;
    contentValue: string;
  }
): Promise<IWebsiteContent> => {
	try {
		const createdWebsiteSchudle = await WebsiteContentModel.create(optionsData)
		createdWebsiteSchudle.save()

		return createdWebsiteSchudle
	} catch (error: any) {
		throw new Error(error)
	}
}

export const createWebsiteCourse = async (
	_: any,
	userInput: IWebsiteCourse
): Promise<IWebsiteCourse> => {
	try {
		const createdWebsiteSchudle = await WebsiteCourseModel.create(userInput)
		createdWebsiteSchudle.save()
		return createdWebsiteSchudle
	} catch (error: any) {
		throw new Error(error)
	}
}

export const createNewWebsiteContent = async (
	_: any,
	userInput: INewWebsiteContent
): Promise<INewWebsiteContent> => {
	try {
		const checkData = await websiteContentModel.find()
		if (checkData.length > 1) {
			throw new Error('Can\'t be more then one')
		}
		const createdWebsiteSchudle = await websiteContentModel.create(userInput)

		createdWebsiteSchudle.save()
		return createdWebsiteSchudle
	} catch (error: any) {
		throw new Error(error)
	}
}
export const createWebsiteCourseAmount = async (
	_: any,
	userInput: IWebsiteCourseAmount
): Promise<IWebsiteCourseAmount> => {
	try {
		const checkData = await websiteCourseAmountModel.find()
		if (checkData.length > 1) {
			throw new Error('Can\'t be more then one')
		}
		const createdWebsiteSchudle = await websiteCourseAmountModel.create(
			userInput
		)
		createdWebsiteSchudle.save()
		return createdWebsiteSchudle
	} catch (error: any) {
		throw new Error(error)
	}
}
export const createWebsitePoints = async (
	_: any,
	userInput: IWebsitePoints
): Promise<IWebsitePoints> => {
	try {
		const checkData = await websitePointsModel.find()
		if (checkData.length > 1) {
			throw new Error('Can\'t be more then one')
		}
		const createdWebsiteSchudle = await websitePointsModel.create({
			title: userInput.title,
			image: userInput.image,
		})
		const formOptions: IFormOptions[] = userInput.options.map(
			(option: any) => ({
				option: option,
			})
		)
		createdWebsiteSchudle.options = formOptions
		createdWebsiteSchudle.save()
		return createdWebsiteSchudle
	} catch (error: any) {
		throw new Error(error)
	}
}
export const createWebsiteCenter = async (
	_: any,
	userInput: IWebsiteCenter
): Promise<IWebsiteCenter> => {
	try {
		const checkData = await websiteCenterModel.find()
		if (checkData.length > 4) {
			throw new Error('Can\'t be more then four')
		}
		const createdWebsiteSchudle = await websiteCenterModel.create(userInput)
		createdWebsiteSchudle.save()
		return createdWebsiteSchudle
	} catch (error: any) {
		throw new Error(error)
	}
}
export const updateWebsiteCenter = async (
	_: any,
	userInput: { id: string; centerName: string; centerAddress: string }
): Promise<IWebsiteCenter | null> => {
	try {
		const updatedWebsiteCenter = await websiteCenterModel.findByIdAndUpdate(
			userInput.id,
			userInput,
			{ new: true }
		)
		return updatedWebsiteCenter
	} catch (error: any) {
		throw new Error(error)
	}
}

export const updateWebsiteCourse = async (
	_: any,
	userInput: {
    classLevel: string;
    id: string;
    classCode: string;
    classTitle: string;
    classType: string;
    title: string;
    price: number;
    seatCapacity: number;
    fromDate: Date;
    toDate: Date;
    fromTime: Date;
    toTime: Date;
    mode: string;
    location: string;
    description: string;
  }
): Promise<IWebsiteCourse | null> => {
	try {
		const updatedWebsiteContent = await WebsiteCourseModel.findByIdAndUpdate(
			userInput.id,
			userInput,
			{ new: true }
		)
		return updatedWebsiteContent
	} catch (error: any) {
		throw new Error(error)
	}
}

export const updateWebsiteSchudle = async (
	_: any,
	userInput: {
    id: string;
    classLevel: string;
    fromDate: Date;
    toDate: Date;
    classCode: string;
    className: string;
    fromTime: Date;
    toTime: Date;
    year: string;
    mode: string;
    location: string;
    description: string;
    seatCapacity: string;
  }
): Promise<IWebsiteSchudle | null> => {
	try {
		const updatedWebsiteSchudle = await WebsiteSchudleModel.findByIdAndUpdate(
			userInput.id,
			userInput,
			{ new: true }
		)
		return updatedWebsiteSchudle
	} catch (error: any) {
		throw new Error(error)
	}
}
export const updateWebsiteContent = async (
	_: any,
	userInput: {
    id: string;
    title: string;
    description: string;
    year: number;
    image: string;
  }
): Promise<INewWebsiteContent | null> => {
	try {
		const updatedWebsiteContent = await websiteContentModel.findByIdAndUpdate(
			userInput.id,
			userInput,
			{ new: true }
		)
		return updatedWebsiteContent
	} catch (error: any) {
		throw new Error(error)
	}
}
export const updateWebsiteCourseAmount = async (
	_: any,
	userInput: { id: string; title: string; description: string }
): Promise<IWebsiteCourseAmount | null> => {
	try {
		const updatedWebsiteCourseAmount =
      await websiteCourseAmountModel.findOneAndUpdate(
      	{_id: new mongoose.Types.ObjectId(userInput.id)},
      	{
      		title: userInput.title,
      		description: userInput.description,
      	},
      	{
      		new: true,
      	}
      )
		return updatedWebsiteCourseAmount
	} catch (error: any) {
		throw new Error(error)
	}
}

export const updateFormQuestion = async (
	_: any,
	optionsData: {
    question: string;
    type: string;
    order: number;
    id: string;
	answerCode: string;
	options: IFormOptionLists[];
  }
): Promise<IFormQuestions> => {
	try {
		const existingWebsitePoints = await formQuestionsModel.findById(
			optionsData.id
		)

		if (!existingWebsitePoints) {
			throw new Error('Website points not found')
		}
		const isValidObjectId = (str: string) => {
			return mongoose.Types.ObjectId.isValid(str)
		  }
		const newOptionArray = optionsData.options.map((item: any) => {
			return ({
				_id:
				isValidObjectId(item._id)
          	? new mongoose.Types.ObjectId(item._id)
          	: new mongoose.Types.ObjectId(),
				option: item.option,
				label: item.label,
				code: item.code,
				value: item.value,
			})
		})
		const updatedWebsitePoints: any = await formQuestionsModel.updateOne({_id: optionsData.id},{
			question: optionsData.question,
			type: optionsData.type,
			order: optionsData.order,
			answerCode:optionsData.answerCode ? optionsData.answerCode : '',
			options: newOptionArray
		})

		return updatedWebsitePoints
	} catch (error: any) {
		throw new Error(error)
	}
}

export const updateWebsitePoints = async (
	_: any,
	userInput: { id: string; title: string; image: string; options: string[] }
): Promise<IWebsitePoints | null> => {
	try {
		const existingWebsitePoints = await websitePointsModel.findById(
			userInput.id
		)

		if (!existingWebsitePoints) {
			throw new Error('Website points not found')
		}

		// Update the image if the data is present
		if (userInput.image) {
			existingWebsitePoints.image = userInput.image
		}

		// Validate and update the options
		if (Array.isArray(userInput.options)) {
			// Validate each option value
			const validatedOptions = userInput.options.map((option) => {
				return { option }
			})

			existingWebsitePoints.title = userInput.title
			existingWebsitePoints.options = validatedOptions
		} else {
			throw new Error('Invalid options data')
		}

		const updatedWebsitePoints = await existingWebsitePoints.save()

		return updatedWebsitePoints
	} catch (error: any) {
		throw new Error(error)
	}
}

export const deleteFormQuestion = async (_: any, args: { _id: string }) => {
	const status = await formQuestionsModel.deleteOne({ _id: args._id })
	return status.deletedCount === 1
}
export const deleteWebsiteSchudle = async (_: any, args: { _id: string }) => {
	const status = await WebsiteSchudleModel.deleteOne({ _id: args._id })
	return status.deletedCount === 1
}
export const deleteWebsiteContent = async (_: any, args: { _id: string }) => {
	const status = await WebsiteContentModel.deleteOne({ _id: args._id })
	return status.deletedCount === 1
}
export const deleteWebsiteCourse = async (_: any, args: { _id: string }) => {
	const status = await WebsiteCourseModel.deleteOne({ _id: args._id })
	return status.deletedCount === 1
}
export const deleteEnquire = async (_: any, args: { _id: string }) => {
	const status = await enquireModel.deleteOne({ _id: args._id })
	return status.deletedCount === 1
}
export const deleteWebsiteCenterModel = async (
	_: any,
	args: { _id: string }
) => {
	const status = await websiteCenterModel.deleteOne({ _id: args._id })
	return status.deletedCount === 1
}
export const deleteWebsiteCourseAmountModel = async (
	_: any,
	args: { _id: string }
) => {
	const status = await websiteCourseAmountModel.deleteOne({ _id: args._id })
	return status.deletedCount === 1
}
export const deleteWebsitePointsModel = async (
	_: any,
	args: { _id: string }
) => {
	const status = await websitePointsModel.deleteOne({ _id: args._id })
	return status.deletedCount === 1
}
export const deleteWebsiteContentModel = async (
	_: any,
	args: { _id: string }
) => {
	const status = await websiteContentModel.deleteOne({ _id: args._id })
	return status.deletedCount === 1
}

// Enquire
export const createEnquire = async (
	_: any,
	userInput: {
    classLevel: string;
    session?: string;
    courseId?: string;
    classCode: string;
    classType: string;
    emailAddress: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    childFirstName: string;
    childLastName: string;
    source: string;
    state: string;
    country: string;
    address: string;
    city: string;
    zipCode: string;
	friendsName: string;
    friendsNumber: string;
    options: IQuestionOptions[];
  }
): Promise<IEnquire> => {
	try {
		const newCurrentDate = new Date()
		const currentDate = new Date()
		const dueDate = new Date(currentDate.setDate(currentDate.getDate() + 5)) // Adding 5 days to createdAt
		// console.log(newCurrentDate,'currentDatasdasde')
		// console.log(dueDate,'dueDatasdasde')
		const createdEnquireModel = await enquireModel.create(userInput)
		const hashPassword = await passwordHasher.hash('Parent', process.env.SALT!)

		let newParent: any = {}
		const newType = () => {
			if (userInput.classType === 'Regular_Class') return 'Regular'
			if (userInput.classType === 'Crash_Course_Class') return 'Crash_Course'
			if (userInput.classType === 'Trial_Class') return 'Trial'
			return 'Regular_Class'
		}
		const existingParent = await parentmodel.findOne({
			email: userInput.emailAddress,
			phone: userInput.phoneNumber,
		})

		newParent = existingParent

		if (!existingParent) {
			const parent = await parents.create({
				address: userInput.address,
				email: userInput.emailAddress,
				name: `${userInput.firstName} ${userInput.lastName}`,
				phone: userInput.phoneNumber,
				password: hashPassword,
			})
			const account: Stripe.Customer = await createStripeAccount({
				email: userInput.emailAddress
			})
			newParent = parent
			newParent.paymentCusId = account.id
		}

		const newStudent = await studentmodel.create({
			name: `${userInput.childFirstName} ${userInput.childLastName}`,
			studentType: newType(),
			parentId: new mongoose.Types.ObjectId(newParent._id),
		})

		newParent.children.push(new mongoose.Types.ObjectId(newStudent._id))

		const newHistoryModel = await leadHistoryModel.create({
			oldStatus: 'newLead',
			newStatus: 'newLead',
			createdAt: newCurrentDate,
		})
		await newHistoryModel.save()

		const newLead = await leadModel.create({
			leadStatus: 'newLead',
			classType: userInput.classType,
			courseId: userInput.courseId,
			sessionId: userInput.session ? userInput.session : null,
			createdAt:newCurrentDate,
			dueDate:dueDate,
			parent: new mongoose.Types.ObjectId(newParent._id),
			enquire: new mongoose.Types.ObjectId(createdEnquireModel._id),
			leadHistory: [newHistoryModel],
			student: new mongoose.Types.ObjectId(newStudent._id),
		})
		let sessionData = null
		if (userInput.session && userInput.session !== 'none' && newStudent) {
			 sessionData = await sessionModel.findById({
				_id: userInput.session,
			})
			if (!sessionData) {
				throw new Error('Error with Registering. - session Issue')
			}

			await classModel.findByIdAndUpdate(
				sessionData.class,
				{ $push: { students: newStudent } },
				{ new: true }
			)
			const classId2Data = await classModel.findOne({ _id: sessionData.class })

			await studentmodel.findOneAndUpdate(
				{ _id: newStudent._id },
				{ $addToSet: { classId: classId2Data } }
			)
		}
		
		if (
			userInput.classType === 'Crash_Course_Class' &&
			newStudent &&
			userInput.classCode &&
			userInput.courseId !== 'none'
		) {
			const websiteCourse = await WebsiteCourseModel.findById({
				_id: userInput.courseId,
			})

			if (!websiteCourse) {
				throw new Error('Error with Registering. - course Issue')
			}

			await classModel.findOneAndUpdate(
				{ classCode: websiteCourse.classCode },
				{ $push: { students: newStudent } },
				{ new: true }
			)
			const classIdData = await classModel.findOne({
				classCode: websiteCourse.classCode,
			})

			if (!classIdData) {
				throw new Error(
					`Error with Registering. - No Class Data found for ${websiteCourse.classCode}`
				)
			}
			await studentmodel.findOneAndUpdate(
				{ _id: newStudent._id },
				{ $addToSet: { classId: classIdData } }
			)
		}
		// if (userInput.classType === 'Trial_Class' && newStudent) {

		// 	await classModel.updateMany(
		// 		{ classType: 'Trial_Class' },
		// 		{ $push: { students: newStudent } }
		// 	)
		// }

		createdEnquireModel.save()
		newStudent.save()
		newParent.save()
		newLead.save()
		// send whatsapp message
		let classData: any = []
		if(userInput.session && userInput.session  !== 'none'){
			 classData = await classModel.aggregate([
				{
					$match: { sessions: new mongoose.Types.ObjectId(userInput.session) },
				},
				{
					$lookup: {
						from: 'centers', // The collection you're looking up from
						localField: 'center', // The field in the current collection (orders) containing product IDs
						foreignField: '_id', // The field in the referenced collection (products) to match with
						as: 'center_info', // The name of the field to store the joined products
					},
				},
			])
		}
		
		let welcomeParentMessage = 'Good Day  '+userInput.firstName+' '+userInput.lastName+'  & Greetings from MasterMaths. My name is Irfan.\nThank you for registering '+userInput.childFirstName+' '+userInput.childLastName+' for the Coaching Program.\n'
		if(classData.length > 0) {
			let class_datetime = ''
			if(sessionData){
				class_datetime = moment(sessionData.Date).format('dddd h.mmA') + ' to ' + moment(sessionData.Date).add(30, 'minutes').format('h.mmA')
			}
			welcomeParentMessage +='The lesson registered is for '+classData[0].classLevel+', '+class_datetime+ ' '+
			classData[0].mode

			if(classData[0].mode == 'Offline' && classData[0].center_info.length > 0) {
				welcomeParentMessage +=' at our '+ classData[0].center_info[0].centerName  +' Branch.'
			}
		}
		welcomeParentMessage += '\nYou have successfully registered. Please find your login credential. \nUser ID: '+userInput.emailAddress+' \nPassword: Parent'
		const whatsappMessageResponse = await whatsappMessage.sendMessage({phone: `+${userInput.phoneNumber}`, message: welcomeParentMessage})

		setTimeout(() => {
			whatsappMessage.sendMessage({phone: `+${userInput.phoneNumber}`, message: '*course_benefits*\nAs a MasterMaths student, '+userInput.childFirstName+' '+userInput.childLastName+' would also be entitled to the following support:\n#1 90 minutes weekly coaching sessions\n#2 Lesson recordings for unlimited revision (sent weekly after lessons for self recap)\n#3 Access to whatsapp tutor for anytime Maths QNA (ask online tutor maths related questions anytime)\n#4 Complimentary 45min lessons (booster class) on every weekday evenings with Coach Irfan for landmark P5 & P6 levels'})
		},60000)

		


		await parents.updateOne({_id: new mongoose.Types.ObjectId(newParent._id)},{wid: whatsappMessageResponse.wid})

		await mail.send({
			from: 'anumita.banerjee@indusnet.co.in',
			to: userInput.emailAddress,
			// to:'santu.pradhan@indusnet.co.in',
			subject: 'Welcome to MasterMaths',
			htmlBody:`
			<h1>Welcome to MasterMaths!</h1>
			<p>Dear Parent,</p>
			<p>Thank you for registering with us. We're excited to have you on board!</p>
			<p>Your login credentials are as follows:</p>
			<p>Email: ${userInput.emailAddress}</p>
			<p>Password: Parent</p>
			<p>You can now log in to our website using the provided credentials.</p>
			<p>If you have any questions or need assistance, don't hesitate to contact our support team.</p>
			<p>Thank you again for joining us!</p>
			<p>Best regards,<br>
			MasterMaths Team</p>
		  `,
			//   'Attached to this email, you will find your official receipt for your reference. Please keep this receipt for future correspondence and reimbursement purposes.',
			// 		attachments: [
			// 			{
			// 				Name: payment.payId + '.pdf',
			// 				Content: pdfBuffer.toString('base64'),
			// 				ContentType: 'application/pdf',
			// 			},
			// 		],
		})

		return createdEnquireModel
	} catch (error: any) {
		throw new Error(error)
	}
}

const getStudentDataByLeadId = async (leadId: string, studentId: string) => {
	const lead = await leadModel
		.findById(leadId)
		.populate('enquire')
		.populate('parent')
		.populate({
			path: 'parent',
			populate: 'children',
		})

	if (!lead) {
		throw new Error('Lead not found')
	}

	const { enquire, parent } = lead
	const { childFirstName, childLastName } = enquire

	let student

	if (studentId) {
		student = await studentmodel.findById(studentId)
	} else {
		const matchingStudent: any = parent.children.find((child) => {
			const fullName = child.name
			const childFullName = `${childFirstName} ${childLastName}`
			return fullName === childFullName
		})

		if (!matchingStudent) {
			throw new Error('Student not found')
		}
		student = await studentmodel
			.findById(matchingStudent._id)
			.populate('classId')
	}

	if (!student) {
		throw new Error('Student not found')
	}

	return {
		lead,
		enquire,
		parent,
		student,
	}
}

export const updateStudentClasses = async (
	_: any,
	userInput: {
    studentId: string;
    type: string;
    leadId: string;
  }
) => {
	const { student, parent } = await getStudentDataByLeadId(
		userInput.leadId,
		userInput.studentId
	)

	const currentClassIds = student.classId.map((cls) => cls._id)

	// Remove the current classes linked to the student
	const currentClasses = await classModel.find({
		_id: { $in: currentClassIds },
	})

	if (currentClasses.length === 0) {
		// Find the new classes based on the given type
		const newClasses = await classModel.find({ classType: userInput.type })
		if (!newClasses.length) {
			throw new Error('New classes not found')
		}

		// // Push the new classes into the student's classId array
		const studentsList = [student]
		// await student.save()
		await studentmodel.updateMany(
			{ _id: { $in: studentsList } },
			{ $addToSet: { classId: { $each: newClasses } } }
		)
		return student
	}

	if (!currentClasses.length) {
		throw new Error('Current classes not found')
	}
	const curretnStudent = await studentmodel.findOne({
		_id: userInput.studentId,
	})
	if (!curretnStudent) {
		throw new Error('New Student not found')
	}
	curretnStudent.classId = []
	await curretnStudent.save()
	currentClasses.forEach((currentClass) => {
		currentClass.students = currentClass.students.filter(
			(stdId) => stdId.toString() !== userInput.studentId
		)
		currentClass.save()
	})

	// Find the new classes based on the given type
	const newClasses = await classModel.find({ classType: userInput.type })
	if (!newClasses.length) {
		throw new Error('New classes not found')
	}

	// // Push the new classes into the student's classId array
	const studentsList = [student]
	// await student.save()
	await studentmodel.updateMany(
		{ _id: { $in: studentsList } },
		{ $addToSet: { classId: { $each: newClasses } } }
	)
	const lead = await leadModel.findById({ _id: userInput.leadId })
	if (!lead) {
		throw new Error('lead not found')
	}
	lead.classType = 'Trial_Class'
	await lead.save()
	return student
}

export const updateStudentRegularClass = async (
	_: any,
	userInput: {
    studentId: string;
    type: string;
    leadId: string;
  }
) => {
	const { student, parent } = await getStudentDataByLeadId(
		userInput.leadId,
		userInput.studentId
	)
	const lead = await leadModel.findById({ _id: userInput.leadId })
	if (!lead) {
		throw new Error('lead not found')
	}
	const sessionData = await sessionModel.findById({
		_id: lead.sessionId,
	})
	if (!sessionData) {
		throw new Error('session not found')
	}
	const currentClassIds = student.classId.map((cls) => cls._id)

	// Remove the current classes linked to the student
	const currentClasses = await classModel.find({
		_id: { $in: currentClassIds },
	})

	if (!currentClasses.length) {
		throw new Error('Current classes not found')
	}
	const curretnStudent = await studentmodel.findOne({
		_id: userInput.studentId,
	})
	if (!curretnStudent) {
		throw new Error('New Student not found')
	}
	curretnStudent.classId = []
	await curretnStudent.save()
	currentClasses.forEach((currentClass) => {
		currentClass.students = currentClass.students.filter(
			(stdId) => stdId.toString() !== userInput.studentId
		)
		currentClass.save()
	})

	await classModel.findByIdAndUpdate(
		sessionData.class,
		{ $push: { students: student } },
		{ new: true }
	)
	const classId2Data = await classModel.findOne({ _id: sessionData.class })

	await studentmodel.findOneAndUpdate(
		{ _id: student._id },
		{ $addToSet: { classId: classId2Data } }
	)
	lead.classType = 'Regular_Class'
	await lead.save()
	return student
}
