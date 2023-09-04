import downloadsModel from '@models/downloads'

export const addDownloadLog = async (_:any,args:{downloadLink:string,fileType:string,fileSource:string},ctx:any):Promise<boolean>=>{
	const newData = await downloadsModel.create({
		downloadLink:args.downloadLink,
		fileSource:args.fileSource,
		fileType:args.fileType,
	})
	newData.save()
	return true
}




