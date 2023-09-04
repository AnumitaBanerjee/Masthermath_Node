import { IWhatsappGetMessageRequest, IWhatsappRequest } from '@schema/entity.types'
import axios from 'axios'

class WhatsappMessage {
	async sendMessage(data:IWhatsappRequest): Promise<any | null> {
		try {
			const whatsappResponse = await axios.post(
				'https://api.wassenger.com/v1/messages',
				data,
				{
					headers: {
						Token: process.env.WASSENGER_TOKEN,
						'Content-Type': 'application/json',
					},
				}
			)
			return whatsappResponse.data
		} catch (error: any) {
			throw new Error(error)
		}
	}
	async getSentMessage(data:IWhatsappGetMessageRequest):  Promise<any | null> {
		try {
			const device_id = process.env.WHATSAPP_ADMIN_DEVICE_ID
			const whatsappResponse = await axios.get(
				'https://api.wassenger.com/v1/chat/'+device_id+'/chats/'+data.wid+'/sync?size='+data.limit+'&page='+data.page+'',
				{
					headers: {
						Token: process.env.WASSENGER_TOKEN,
						'Content-Type': 'application/json',
					},
				}
			)
			return whatsappResponse.data
		} catch (error: any) {
			console.log(error)
			throw new Error(error)
		}
	}
}

export default new WhatsappMessage()
