import mediaModel from '@models/media.model'
import MediaService, { MediaServiceRR } from './module.service'
import mongoose from 'mongoose'

const getClassMedia = async (_:any,args:{classId:string}):Promise<MediaServiceRR.Response[]>=>{
	const mediaService = new MediaService()
	return await mediaService.fetchByClass(args.classId)
}

const adminGetAllMedia = async (
	_:any,
	{offset,limit,mediaAccess,sortBy,order,classCode,accessMonth,search}:{search:string,accessMonth:number,classCode?:string,mediaAccess:string ,offset:number,limit:number,sortBy?:string,order?:string}
)=>{
	const mediaService = new MediaService()
	return {
		data:await mediaService.fetchAllForAdmin(mediaAccess ,offset,limit,sortBy,order,classCode,accessMonth,search),
		total:await mediaModel.count({mediaAccess:mediaAccess})
	}
}

const adminGetDistinctMedia = async(_:any,
	{offset,limit,mediaAccess,classCode,accessMonth,search}:{search:string,accessMonth:number,classCode?:string,mediaAccess:string ,offset:number,limit:number,sortBy?:string,order?:string}
)=>{
	const filter:any ={}

	if(classCode){
		filter['classId'] = new mongoose.Types.ObjectId(classCode)
	}

	if(mediaAccess){
		filter['mediaAccess'] = mediaAccess
	}

	if(search){
		filter['$or'] =  [
			{ mediaType: { $regex: search, $options: 'i' } },
			{ mediaAccess: { $regex: search, $options: 'i' } },
			{ mediaUrl: { $regex: search, $options: 'i' } },
			{ docType: { $regex: search, $options: 'i' } },
			{ forMonth: { $regex: search, $options: 'i' } }
		]
	}

	let latestMediaByClass = await mediaModel.aggregate([
		{ $match: filter },
		{ $sort: { classId: 1, forMonth: -1 } },
		{
			$group: {
				_id: '$classId',
				mediaId:{ $first: '$_id' },
				classId: { $first: '$classId' },
				mediaType: { $first: '$mediaType' },
				forMonth: { $first: '$forMonth' },
				mediaAccess: { $first: '$mediaAccess' },
				mediaUrl: { $first: '$mediaUrl' },
				docType: { $first: '$docType' },
			},
		},
		{
			$lookup: {
				from: 'classes',
				localField: 'classId',
				foreignField: '_id',
				as: 'classData',
			},
		},
		{
			$addFields: {
				classCode: { $arrayElemAt: ['$classData.classCode', 0] },
			},
		},
		{ $skip: offset },
		{ $limit: limit },
	])
	


	let  Total = await mediaModel.aggregate([
		{ $match: filter },
		{ $sort: { classId: 1, forMonth: -1 } },
		{
			$group: {
				_id: '$classId',
				classId: { $first: '$classId' },
				mediaType: { $first: '$mediaType' },
				forMonth: { $first: '$forMonth' },
				mediaAccess: { $first: '$mediaAccess' },
				mediaUrl: { $first: '$mediaUrl' },
				docType: { $first: '$docType' },
			},
		},
		{
			$lookup: {
				from: 'classes',
				localField: 'classId',
				foreignField: '_id',
				as: 'classData',
			},
		},
		{
			$addFields: {
				classCode: { $arrayElemAt: ['$classData.classCode', 0] },
			},
		},
		{ $skip: offset },
		{ $limit: limit },
	])

	if(accessMonth){

		if(accessMonth>12 || accessMonth<1) throw new Error('Month should be between 1 and 12')
		
		latestMediaByClass = latestMediaByClass?.filter(value=>new Date(value?.forMonth).getMonth() === accessMonth-1)
		Total = Total?.filter(value=>{
			console.log(value?.forMonth,new Date(value?.forMonth).getMonth(), accessMonth)
			return new Date(value?.forMonth).getMonth() === accessMonth-1
		})
	}

	
	return {data:latestMediaByClass?.map(v=>({...v,_id:v?.mediaId})),total:Total.length}
}


export {getClassMedia,adminGetAllMedia,adminGetDistinctMedia}