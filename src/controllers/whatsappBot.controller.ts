import { Request, Response } from 'express'

/**
 * This function is used to get logged in user details
 * @param req
 * @param res
 */

const webhook = async (req: Request, res: Response) => {
	// Your custom controller logic here
	console.log('Received WhatsApp message:', req.body)
	res.status(200).send('Message received successfully.')
}
export default { webhook }
