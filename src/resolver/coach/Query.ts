import sessionModel from '@models/schedule/session/sessions.model'
import CoachService from './module.service'
import coach from '@models/coach.model'
import classModel from '@models/schedule/classes.models'

const getAllCoachs = async () => {
	const services = new CoachService()
	return await services.fetchAll()
}

const getCoach = async (_: any, args: { _id: string }) => {
	const services = new CoachService()
	return await services.fetchById(args._id)
}

const getAdminCoachsList = async (
	_: any,
	args: {
    page: number
    perPage: number
    search: string
  }
) => {
	const offset = (args.page - 1) * args.perPage
	const limit = args.perPage
	const search = args.search

	try {
		// Retrieve coach data based on search criteria
		const coachData = await coach
			.find(
				search && !!search
					? {
						$or: [
							{ coachName: { $regex: search, $options: 'i' } },
							{ emailAddress: { $regex: search, $options: 'i' } },
							{ phoneNumber: { $regex: search, $options: 'i' } },
							{ address: { $regex: search, $options: 'i' } },
						],
					}
					: {}
			)
			.sort({ _id: -1 }) // Sort by descending order of _id field
			.limit(limit)
			.skip(offset)


		// Count total coach entries based on search criteria
		const totalEntries = await coach.countDocuments(
			search && !!search
				? {
					$or: [
						{ coachName: { $regex: search, $options: 'i' } },
						{ emailAddress: { $regex: search, $options: 'i' } },
						{ phoneNumber: { $regex: search, $options: 'i' } },
						{ address: { $regex: search, $options: 'i' } },
					],
				}
				: {}
		)

		// Fetch additional data for each coach (e.g., session count, class count)
		const coachDataWithAdditionalInfo = await Promise.all(
			coachData.map(async (coach) => {
				const sessions = await sessionModel.find({
					$or: [{ permanentCoach: coach._id }, { temporaryCoach: coach._id }],
				})
				const classes = await classModel.find({
					sessions: { $in: sessions.map((session) => session._id) },
				})
				return {
					...coach.toObject(),
					sessionCount: sessions.length,
					classCount: classes.length,
				}
			})
		)
	

		return {
			data: coachDataWithAdditionalInfo,
			totalEntries: totalEntries,
		}
	} catch (error) {
		console.error(error)
		throw new Error('Failed to fetch coach data.')
	}
}

export { getAllCoachs, getCoach, getAdminCoachsList }
