import Stripe from 'stripe'

interface CreateStripeAccountInput {
  email: string
  // Additional input fields as needed
}

interface BankAccountData {
  accountHolderName: string
  accountNumber: string
  bankName: string
}
interface cardData {
  nameOnCard: string
  cardNumber: string
  expireDate: Date
  cvv: number
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
	? process.env.STRIPE_SECRET_KEY
	: 'sk_test_51MytREJtZkRJFOgssNqNELXNCm1ie4nacwW1MwOr4NcvKKGZJ6aNBEVAUp5oibJBF3kHGRBahFMX7rBKT5ETJirt00YbKhIdBW'
export const stripeInstance = new Stripe(stripeSecretKey, {
	apiVersion: '2022-11-15', // Replace with the desired API version
})

async function createStripeAccount(
	input: CreateStripeAccountInput
): Promise<Stripe.Customer> {
	try {
		const account: Stripe.Customer = await stripeInstance.customers.create({
			// type: 'standard',
			email: input.email,
			// Additional parameters as needed
		})

		return account
	} catch (error:any) {
		console.log(error, 'stripe error')
		throw Error('Failed to create Stripe account '+ error.message)
	}
}

async function updateCustomerWithBankAccountToken(
	customerId: string,
	bankAccountData: BankAccountData
): Promise<null> {
	try {
		// const tokenParams: Stripe.TokenCreateParams = {
		// 	bank_account: {
		// 		object: 'bank_account',
		// country: 'SG',
		// currency: 'sgd',
		// account_holder_name: bankAccountData.accountHolderName,
		// account_number: bankAccountData.accountNumber,
		// 	},
		// }

		// const bankAccountToken: Stripe.Token = await stripeInstance.tokens.create(tokenParams);

		// const customer: Stripe.Customer = await stripeInstance.customers.create({
		//   source: bankAccountToken.id,
		// })

		// const bankAccount: Stripe.BankAccount = customer.sources
		// 	.data[0] as Stripe.BankAccount

		// return bankAccount

		// const bankAccount:any  = await stripeInstance.customers.createSource(
		// 	customerId,
		// 	{
		// 		source: {
		// 			object: 'bank_account',
		// 			//   country: bankInfo.country,
		// 			//   currency: bankInfo.currency,
		// 			//   account_holder_name: bankInfo.accountHolderName,
		// 			//   account_holder_type: bankInfo.accountHolderType,
		// 			//   routing_number: bankInfo.routingNumber,
		// 			//   account_number: bankInfo.accountNumber,
		// 			country: 'SG',
		// 			currency: 'sgd',
		// 			routing_number: '1100-000',
		// 			account_holder_name: bankAccountData.accountHolderName,
		// 			account_number: '000123456',
		// 		},
		// 	}
		// )
		return null
	} catch (error) {
		console.log(error, 'stripe error')
		throw new Error('Failed to update customer with bank account token')
	}
}

async function updateCustomerWithCardToken(
	customerId: string,
	cardInfo: cardData
): Promise<Stripe.PaymentMethod> {
	try {
		const cardPaymentMethod = await stripeInstance.paymentMethods.create({
			type: 'card',
			card: {
				number: cardInfo.cardNumber,
				exp_month: 12,
				exp_year: 2023,
				cvc: cardInfo.cvv.toString(),
			},
		})

		// Attach the payment method to the customer
		await stripeInstance.paymentMethods.attach(cardPaymentMethod.id, {
			customer: customerId,
		})

		return cardPaymentMethod
	} catch (error:any) {
		console.log(error, 'stripe error')
		throw new Error('Failed to update customer with Card '+ error.message)
	}
}
export {
	createStripeAccount,
	updateCustomerWithBankAccountToken,
	updateCustomerWithCardToken,
}
