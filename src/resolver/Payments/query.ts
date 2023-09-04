import paymentmodel from '@models/payment'

interface FilterOptions {
  code: any;
  page: number;
  perPage: number;
  search?: string;
  month?: string;
  year?: string;
  status?: string;
  classCode?: string;
}
export const getAllPaymentLogs = async (
	_: any,
	args: { id: string; studentId: string; parentId: string }
) => {
	if (args.id) {
		const payData = await paymentmodel
			.find({
				_id: args.id,
			})
			.populate('studentId')
			.populate('classId')
		return payData
	}
	if (args.studentId) {
		const payData = await paymentmodel
			.find({
				studentId: args.studentId,
			})
			.populate('studentId')
			.populate('classId')
		return payData
	}

	if (args.parentId) {
		const payData = await paymentmodel
			.find({
				parentId: args.parentId,
			})
			.populate('studentId')
			.populate('classId')
		return payData
	}
	const payData = await paymentmodel
		.find()
		.populate('studentId')
		.populate('classId')
	console.log(payData, 'payData')
	return payData
}
export const getAllPaymentHistories = async (
	_: any,
	options: FilterOptions
) => {
	const pipeline: any = [
		{
			$lookup: {
				from: 'classes',
				as: 'classId',
				localField: 'classId',
				foreignField: '_id',
			},
		},
		{ $unwind: '$classId' },
		{
			$lookup: {
				from: 'parents',
				as: 'parentId',
				localField: 'parentId',
				foreignField: '_id',
			},
		},
		{ $unwind: '$parentId' },
	]
	if (options.classCode) {
		pipeline.push({ $match: { 'classId.classCode': options.classCode } })
	}
	if (options.search) {
		pipeline.push({
			$match: {
				$or: [
					{ invoiceNo: { $regex: options.search, $options: 'i' } },
					{ 'parentId.name': { $regex: options.search, $options: 'i' } },
				],
			},
		})
	}

	if (options.status) {
		pipeline.push({ $match: { status: options.status } })
	}

	if (options.year) {
		pipeline.push({
			$match: {
				$expr: {
					$eq: [{ $year: '$createdAt' }, Number(options.year)], // Replace 2023 with the desired year
				},
			},
		})
	}

	if (options.month) {
		const currentDate = new Date()
		const currentYear = currentDate.getFullYear()
		pipeline.push({
			$match: {
				$expr: {
					$and: [
						{ $eq: [{ $year: '$createdAt' }, options.year ? Number(options.year) : Number(currentYear)] }, // Replace 2023 with the desired year
						{ $eq: [{ $month: '$createdAt' }, Number(options.month)] }, // Replace 8 with the desired month (August)
					],
				},
			},
		})
	}

	const totalEntries = await await paymentmodel.aggregate(pipeline)
	pipeline.push(
		{ $sort: { _id: -1 } },
		{ $skip: (options.page - 1) * options.perPage },
		{ $limit: options.perPage }
	)
	const payData = await paymentmodel.aggregate(pipeline)

	return { totalEntries: totalEntries.length, data: payData }
}
