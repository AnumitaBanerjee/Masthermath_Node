import mediaModel from '@models/media.model'
import MediaService, { MediaServiceRR } from './module.service'

const createMedia = async (
	_: any,
	args: MediaServiceRR.Request
): Promise<MediaServiceRR.Response> => {
	const mediaService = new MediaService()
	return await mediaService.create(args)
}

const deleteMedia = async (_: any, args: { mediaId: string }) => {
	try {
		const check = await mediaModel.findOne({ _id: args.mediaId })

		if (!check) {
			throw new Error('Could not find media')
		}

		const data = await mediaModel.deleteOne({ _id: args.mediaId })
		console.log(data, 'djfbdfbu')
		return true
	} catch (err: any) {
		throw new Error(err.message)
	}
}

export { createMedia, deleteMedia }
