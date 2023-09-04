/* eslint-disable no-mixed-spaces-and-tabs */
import * as pdf from 'html-pdf-node'
import fs from 'fs'
class generatePDF {
	async create(file: any): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			const options = { format: 'A4' }
			pdf.generatePdf({ content: file }, options, (err, data) => {
				if (err) {
				  reject(err)
				} else {
				  resolve(data as Buffer)
				}
			  })
		})
	}
}

export default new generatePDF()
