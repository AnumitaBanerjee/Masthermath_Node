import jwt, { JwtPayload } from 'jsonwebtoken'
import usermodel from '@models/users.modal'

async function checkPermission(
	ctx: any,
	requiredPermission: string
): Promise<any> {
	try {
		if (!ctx) {
			throw new Error('Unauthorized')
		}

		const tokenWithoutBearer = ctx?.headers?.authorization.replace(
			'Bearer ',
			''
		)

		const decodedToken = jwt.decode(tokenWithoutBearer) as JwtPayload | null
		const existingStaff = await usermodel
			.findOne({
				_id: decodedToken?._id,
			})
			.populate('staffRole')

		if (!existingStaff || existingStaff.staffRole.length === 0) {
			throw new Error('No roles found')
		}

		for (const role of existingStaff.staffRole) {
			const roleModel: any = role as any // Type assertion to RoleModel

			if (!roleModel.permissions.includes(requiredPermission)) {
				throw new Error(
					`Insufficient permissions. Required: ${requiredPermission}`
				)
			}
		}
	} catch (error) {
		// Handle the error gracefully
		console.error(error) // Log the error
		// You can choose to return a specific error message or data if needed
		throw new Error(
			'Permission check failed: Insufficient permissions. Required'
		)
	}
}

export { checkPermission }
//export const websiteUrl = 'http://172.105.60.248'
export const websiteUrl = 'http://143.110.242.57:8098'
export const adminRoles = [
	{
		_id: '649169fa78c41c27586e2c2e',
		roleName: 'All Permissions Role',
		permissions: [
			'Centre_create',
			'Centre_delete',
			'Centre_edit',
			'Centre_view',
			'SalesPipeline_create',
			'SalesPipeline_delete',
			'SalesPipeline_edit',
			'SalesPipeline_view',
			'Parents_create',
			'Parents_delete',
			'Parents_edit',
			'Parents_view',
			'Students_create',
			'Students_delete',
			'Students_edit',
			'Students_view',
			'Coaches_create',
			'Coaches_delete',
			'Coaches_edit',
			'Coaches_view',
			'Class_create',
			'Class_delete',
			'Class_edit',
			'Class_view',
			'Session_create',
			'Session_delete',
			'Session_edit',
			'Session_view',
			'ClassRequests_create',
			'ClassRequests_delete',
			'ClassRequests_edit',
			'ClassRequests_view',
			'Media_create',
			'Media_delete',
			'Media_edit',
			'Media_view',
			'BillingInvoice_create',
			'BillingInvoice_delete',
			'BillingInvoice_edit',
			'BillingInvoice_view',
			'Notification_create',
			'Notification_delete',
			'Notification_edit',
			'Notification_view',
			'AskQuestion_create',
			'AskQuestion_delete',
			'AskQuestion_edit',
			'AskQuestion_view',
			'Staff_create',
			'Staff_delete',
			'Staff_edit',
			'Staff_view',
			'Roles_view',
		],
	},
]
export const prebuidlRoles = [
	{
		id: '',
		rolename: 'Centre',
		permissions: [
			'Centre_create',
			'Centre_delete',
			'Centre_edit',
			'Centre_view',
		],
	},
	{
		id: '',
		rolename: 'Sales Pipeline',
		permissions: [
			'SalesPipeline_create',
			'SalesPipeline_delete',
			'SalesPipeline_edit',
			'SalesPipeline_view',
		],
	},
	{
		id: '',
		rolename: 'Parents',
		permissions: [
			'Parents_create',
			'Parents_delete',
			'Parents_edit',
			'Parents_view',
		],
	},
	{
		id: '',
		rolename: 'Students',
		permissions: [
			'Students_create',
			'Students_delete',
			'Students_edit',
			'Students_view',
		],
	},
	{
		id: '',
		rolename: 'Coaches',
		permissions: [
			'Coaches_create',
			'Coaches_delete',
			'Coaches_edit',
			'Coaches_view',
		],
	},
	{
		rolename: 'Class',
		permissions: ['Class_create', 'Class_delete', 'Class_edit', 'Class_view'],
	},
	{
		rolename: 'Session',
		permissions: [
			'Session_create',
			'Session_delete',
			'Session_edit',
			'Session_view',
		],
	},
	{
		rolename: 'Class Requests',
		permissions: [
			'ClassRequests_create',
			'ClassRequests_delete',
			'ClassRequests_edit',
			'ClassRequests_view',
		],
	},
	{
		rolename: 'Media',
		permissions: ['Media_create', 'Media_delete', 'Media_edit', 'Media_view'],
	},
	{
		rolename: 'Billing & Invoice',
		permissions: [
			'BillingInvoice_create',
			'BillingInvoice_delete',
			'BillingInvoice_edit',
			'BillingInvoice_view',
		],
	},
	{
		rolename: 'Notification',
		permissions: [
			'Notification_create',
			'Notification_delete',
			'Notification_edit',
			'Notification_view',
		],
	},
	{
		rolename: 'AskQuestion',
		permissions: [
			'AskQuestion_create',
			'AskQuestion_delete',
			'AskQuestion_edit',
			'AskQuestion_view',
		],
	},
	{
		rolename: 'Staff',
		permissions: ['Staff_create', 'Staff_delete', 'Staff_edit', 'Staff_view'],
	},
]
