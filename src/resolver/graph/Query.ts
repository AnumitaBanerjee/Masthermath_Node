import coachModel from '@models/coach.model'
import parentmodel from '@models/parents.model'
import paymentmodel from '@models/payment'
import sessionModel from '@models/schedule/session/sessions.model'
import studentmodel from '@models/students.model'
import usermodel from '@models/users.modal'
import downloadsModel from '@models/downloads'

// getCounts:IPayment
// getGraphCounts:IPayment
// getDownloadsCount:IPayment
export const getCounts = async (_: any) => {
	const coachData = await coachModel.find().countDocuments()
	const studentData = await studentmodel.find().countDocuments()
	const parentData = await parentmodel.find().countDocuments()
	const userData = await usermodel.find({status: true}).countDocuments()
	const downloadsCount = await downloadsModel.find().countDocuments()
	return {
		coachCounts: coachData,
		studentCounts: studentData,
		parentCounts: parentData,
		staffCounts: userData,
		downloadsCount
	}
}

export const getGraphCounts = async (_: any, args: { year: number }) => {
	const startOfYear = new Date(args.year, 0, 1)
	const endOfYear = new Date(args.year, 11, 31, 23, 59, 59)

	const sessions = await sessionModel
		.find({
			Date: { $gte: startOfYear, $lte: endOfYear },
			attendees: { $exists: true, $ne: [] },
		})
		.populate('attendees')

	const attendanceByMonth: any = []
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	]

	for (let i = 0; i < 12; i++) {
		attendanceByMonth.push({
			month: months[i],
			total: 0,
			count: 0,
			percentage: 0,
			sessions: 0,
		})
	}

	sessions.forEach((session) => {
		const month = session.Date.getMonth()
		attendanceByMonth[month].count += session.attendees.length
		attendanceByMonth[month].total += session.totalSeats
		attendanceByMonth[month].sessions++
	})

	const totalSessions = sessions.length
	for (let i = 0; i < 12; i++) {
		attendanceByMonth[i].percentage =
      (attendanceByMonth[i].count / attendanceByMonth[i].total) * 100
	}

	return attendanceByMonth
}

// getRevanueCounts

export const getRevanueCounts = async (_: any, args: { centerId: string }) => {
	const currentYear = new Date().getFullYear()
	const previousYear = currentYear - 1

	const payments = await paymentmodel.find({
		date: {
			$gte: `${previousYear}-01-01`,
			$lte: `${currentYear}-12-31`,
		},
		centerId: args.centerId,
		status: 'paid',
		// classId: { $in: classIds },
	})

	const revenueByMonth:any = []
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	]

	for (let i = 0; i < 12; i++) {
		revenueByMonth.push({
			month: months[i],
			currentYearRevenue: 0,
			previousYearRevenue: 0,
		})
	}

	payments.forEach((payment) => {
		const month = new Date(payment.date).getMonth()
		const year = new Date(payment.date).getFullYear()
		const paymentAmount = parseFloat(payment.amount)
		if (year === currentYear) {
			revenueByMonth[month].currentYearRevenue += paymentAmount / 100
		} else if (year === previousYear) {
			revenueByMonth[month].previousYearRevenue += paymentAmount / 100
		}
	})
	return revenueByMonth
}



