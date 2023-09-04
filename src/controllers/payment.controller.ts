import { generateReceiptVoucherPdf } from '@resolvers/session/Mutation'
import { Request, Response } from 'express'
import mongoose, { Types } from 'mongoose'
/**
 * This function is used to get logged in user details
 * @param req
 * @param res
 */

const studentPaymentReceipt = async (req: any, res: Response) => {
	try {
		const studentId = new mongoose.Types.ObjectId(req.query.studentId)
		const paymentId = new mongoose.Types.ObjectId(req.query.paymentId)
		const generatedPDF = await generateReceiptVoucherPdf(studentId, paymentId)
		res.status(200).send(generatedPDF)
	} catch (error) {
		res.status(400).send('Internal Server Error')
	}
}
export default { studentPaymentReceipt }
