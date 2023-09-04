import S3 from 'aws-sdk/clients/s3'
import fs from 'fs'

class S3Helper{

	// upload a file to s3
	uploadFile(file:Express.Multer.File):Promise<S3.ManagedUpload.SendData>{
		const s3 = new S3({
			region:process.env.AWS_REGION!,
			accessKeyId:process.env.AWS_ACCESS_KEY!,
			secretAccessKey:process.env.AWS_SECRET_KEY!
		})

		const fileStream = fs.createReadStream(file.path)
        
		const uploadParams = {
			Bucket: process.env.AWS_BUCKET_NAME!,
			Body: fileStream,
			Key: file.filename
		}
    
		return s3.upload(uploadParams).promise()
	}

	// download file
	downloadFile(fileKey:string){
		const s3 = new S3({
			region:process.env.AWS_REGION!,
			accessKeyId:process.env.AWS_ACCESS_KEY!,
			secretAccessKey:process.env.AWS_SECRET_KEY!
		})
        
		const uploadParams = {
			Bucket: process.env.AWS_BUCKET_NAME!,
			Key: fileKey,
		}

		return s3.getObject(uploadParams).createReadStream()
	}
}

export default new S3Helper()