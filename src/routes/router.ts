import s3Helper from '@utils/s3Helper'
import whatsappController  from '@controllers/whatsappBot.controller'
import paymentController  from '@controllers/payment.controller'
import express, { Express } from 'express'
import multer from 'multer'
import cors from 'cors'
// download from s3

const router: Express = express()

/** Parse the request */
router.use(express.urlencoded({ extended: false }))
/** Takes care of JSON data */
router.use(express.json())

/** RULES OF OUR API */
router.use((req, res, next) => {
	// set the CORS policy
	res.header('Access-Control-Allow-Origin', '*')
	// set the CORS headers
	res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization')
	// set the CORS method headers
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST')
		return res.status(200).json({})
	}
	next()
})

const storage = multer.diskStorage({
	destination:(req,file,cb)=>{
		cb(null,'uploads/docs')
	},
	filename:(req,file,cb)=>{
		cb(null, file.originalname.split('.')[0]+Date.now() +'.'+ file.originalname.split('.')[1])
	}
})
const upload = multer({storage})

router.post('/doc',upload.single('file'),async(req,res)=>{
	try{
		// if(!req.file){
		// 	throw new Error('File not found')
		// }

		const data = await s3Helper.uploadFile(req.file!)
		res.json(data)
	}catch(err:any){
		console.log(err)
		res.status(500).json({err:err?.message})
	}
})

router.get('/doc/:key',async (req,res)=>{
	const data = await s3Helper.downloadFile(req.params.key!)
	data.pipe(res)
})

router.post('/whatsapp-webhook',whatsappController.webhook)
router.get('/whatsapp-webhook',whatsappController.webhook)
router.get('/student-payment-receipt',paymentController.studentPaymentReceipt)


export default router