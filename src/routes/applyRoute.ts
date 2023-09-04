

import router from './router'
import {Express} from 'express'
function applyRoute(app:Express){
	app.use('/',router)

	app.get('/xxx',(req,res)=>{
		res.json({name:'mk'})
	})

	
}

export default applyRoute