
import centerService from './module.service'

const getActiveFee= async (_: any) => {
	const services = new centerService()
	return await services.fetchActiveFee()
}
export {
	getActiveFee
}
