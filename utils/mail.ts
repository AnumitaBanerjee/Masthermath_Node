/* eslint-disable no-prototype-builtins */
import {
	IMailRequest
} from '@schema/entity.types'
import axios from 'axios'

class Mail {
	async send(requestData: IMailRequest): Promise<any | null> {
		try {

			const mailRequest: any = {
				From: requestData.from,
				To: requestData.to,
				Subject:  requestData.subject,
				HtmlBody: requestData.htmlBody,
				MessageStream: 'outbound',
			}
			
			if(requestData.hasOwnProperty('attachments')) {
				mailRequest['Attachments'] = requestData.attachments
			}
			const mailConfig = {
				method: 'post',
				maxBodyLength: Infinity,
				url: 'https://api.postmarkapp.com/email',
				headers: {
					'X-Postmark-Server-Token': process.env.EMAIL_TOKEN,
					'Content-Type': 'application/json'
				},
				data: JSON.stringify(mailRequest)
			}

			await axios.request(mailConfig)
				.then((response) => {
					console.log('Mail has been sent successful',JSON.stringify(response.data))
				})
				.catch((error) => {
					console.log(error)
					// throw new Error('Mail hasn\'t been sent successful')
				})
		} catch (error: any) {
			console.log(error)
			// throw new Error('Mail hasn\'t been sent successful')
		}
	}
}

export default new Mail()
