import { IParents } from '@schema/entity.types'
import jwt, { JwtPayload } from 'jsonwebtoken'

class JwtGenerator{
	sign(data:Omit<IParents,'name'|'email'|'password'|'children'>){
		const token = {
			token: jwt.sign(data,process.env.JWT_PRIVATE_KEY!,{ algorithm: 'HS512',expiresIn:'240000h'}),
			refreshToken:jwt.sign(data,process.env.JWT_PRIVATE_KEY!,{ algorithm: 'HS512',expiresIn:'60h'}),
		}
		return token
	}
  
	verify(token:string):JwtPayload| {_id:string}{
		const data:any = jwt.verify(token,process.env.JWT_PRIVATE_KEY!)
		return {_id:data._id}
	}
}

export default new JwtGenerator()