import axios from 'axios'
import btoa from 'btoa'

async function refreshToken(refresh_token: string) {
	const client_id = process.env.zoom_client_id
	const client_secret = process.env.zoom_client_secret
	const credentials = `${client_id}:${client_secret}`
	const encodedCredentials = btoa(credentials)

	// Prepare headers and payload
	const headers = {
		Authorization: `Basic ${encodedCredentials}`,
		'Content-Type': 'application/x-www-form-urlencoded',
	}

	const body = new URLSearchParams({
		grant_type: 'refresh_token',
		refresh_token: refresh_token,
	})

	try {
		// Make the token refresh request using axios
		const refreshResponse = await axios.post('https://zoom.us/oauth/token', body.toString(), {
			headers: headers,
		})

		if (refreshResponse.status !== 200) {
			throw new Error(`Failed to refresh the access token: ${refreshResponse.data.message}`)
		}

		const refreshData = refreshResponse.data
		const access_token = refreshData.access_token

		return access_token
	} catch (error) {
		console.error(error)
		throw new Error('Failed to refresh the access token.')
	}
}

export { refreshToken }
