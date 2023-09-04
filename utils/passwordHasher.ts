import bcrypt from 'bcrypt'

class PasswordHasher{
	async hash(password: string,salt:string): Promise<string>{
		const hasedPassword = await bcrypt.hash(password,salt)
		return hasedPassword
	}

	async verify(inputPassword:string,storedPassword: string): Promise<boolean>{
		console.log(inputPassword,storedPassword)
		return await bcrypt.compare(inputPassword,storedPassword)
	}
}

export default new PasswordHasher()