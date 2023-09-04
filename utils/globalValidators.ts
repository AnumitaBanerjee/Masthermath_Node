class GlobalValidator{
	validateEmail(email:string){
		return String(email)
			.toLowerCase()
			.match(
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			)
	}

	generateClassCode(length: number):string{
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
		let code = ''
		for (let i = 0; i < length; i++) {
			code += characters.charAt(Math.floor(Math.random() * characters.length))
		}
		return code
	}
}

export default new GlobalValidator()


