import {
	adminGetStudentInfo,
	adminStudentList,
	getAllStudents,
	getStudent,
} from '@resolvers/students/Query'
import {
	createStudent,
	editStudent,
	deleteStudent,
	addBankDetails,
	addCardDetails,
	deleteCardDetails,
	deleteBankDetails,
	editStudentWithImage,
} from '@resolvers/students/Mutation'
import {
	createParent,
	editParent,
	deleteParent,
	resetPassword,
	resetPasswordWithId,
	resetPasswordWithIdCoach
} from '@resolvers/parents/Mutation'
import {
	getAdminAllParents,
	getAllParents,
	getParent,
	getWhatsappMessages,
} from '@resolvers/parents/Query'
import {
	parentLogin,
	coachLogin,
	userLogin,
	forgotPassByMail,
	resetParentPassword,
	resetPasswordByToken,
} from '@resolvers/auth/Mutation'
import {
	getAllCoachs,
	getCoach,
	getAdminCoachsList,
} from '@resolvers/coach/Query'
import {
	getAllCenter,
	getCenter,
	getCenterListPagination,
} from '@resolvers/center/Query'
import {
	createCenter,
	editCenter,
	deleteCenter,
} from '@resolvers/center/Mutation'
import {
	createCoach,
	editCoach,
	deleteCoach,
	resetCoachPassword,
} from '@resolvers/coach/Mutation'
import {
	createClass,
	editClass,
	deleteClass,
	addStudents,
} from '@resolvers/class/Mutation'
import {
	createSession,
	editSession,
	deleteSession,
	markAttendees,
	CreateMultipleSession,
	CreateTrailSession,
	checkPaymentStatus,
	payByCard,
	payByQr,
	paymentStatusById,
} from '@resolvers/session/Mutation'
import {
	getAllSession,
	getSession,
	getUpcomingSessions,
	adminGetAllCoachSession,
	getCoachUpcomingSessions,
	getCoachClassHistory,
	getCoachSessionCalender,
	getSessionsListByClassid,
	adminGetSessionsList,
	adminGetSessionsListByClassId,
	getStudentsWithAttendance,
	getSessionsByClassLevel,
} from '@resolvers/session/Query'
import {
	adminGetAllCoachClass,
	adminGetParentById,
	changeClassCenter,
	getAdminAllClasses,
	getAllClass,
	getClass,
	getClassHistory,
	getClassListByCenterId,
	getClassListByStudentId,
	getClassesByLevelAndType,
	getAdminAllClassCode
} from '@resolvers/class/Query'
import {
	deleteAllNotifications,
	getAllNotification,
	getNotification,
	getNotificationsByCoachId,
	getNotificationsByStudentId,
	getNotificationsPagination,
	getUserAnnouncements,
} from '@resolvers/notification/Query'
import {
	createNotification,
	editNotification,
	deleteNotification,
	clearUserAnnouncements,
	updateNotifications,
} from '@resolvers/notification/Mutation'
import { createMedia, deleteMedia } from '@resolvers/media/Mutation'
import {
	getClassMedia,
	adminGetAllMedia,
	adminGetDistinctMedia,
} from '@resolvers/media/Query'
import {
	createQuestion,
	addComment,
	coachRemainder,
} from '@resolvers/questions/Mutation'
import {
	getQuestions,
	classQuestionsList,
	getQuestionsByClassID,
	getQuestionByID,
	getAllQuestionsForCoach,
	adminQuestionsList,
	getQuestionsWithCoachData,
} from '@resolvers/questions/Query'
import {
	getAllSessionFeedBack,
	getSessionFeedBack,
} from '@resolvers/sessionFeedback/Query'
import {
	createSessionFeedBack,
	editSessionFeedBack,
} from '@resolvers/sessionFeedback/Mutation'
import { withFilter } from 'graphql-subscriptions'
import { pubsub } from './questions/module.service'
import {
	clearPaymentsHistory,
	createClassRequest,
	deleteClassRequest,
	updateStatusClassRequest,
} from './classRequest/Mutation'
import {
	getAdminAllClassRequests,
	getClassRequestList,
	getClassRequestListByStudentId,
} from './classRequest/Query'
import {
	createAssignment,
	deleteAssignment,
	addStudentSubmission,
} from '@resolvers/assignment/Mutation'
import {
	getClassAssignment,
	getClassAssignmentBySession,
} from '@resolvers/assignment/Query'
import {
	addRolesWithPermissions,
	addStaff,
	editStaff,
	createUser,
	deleteRole,
	deleteStaff,
	updateStaffStatus,
	editRolePermissions,
	updateUser,
} from './users/Mutation'
import {
	changeStaffCenter,
	getAllRolesWithPermissions,
	getAllUsers,
	getStaffList,
	getUser,
} from './users/Query'
import { checkPermission } from './utils'
import {
	adminFormQuestions,
	getFormQuestions,
	getFormQuestionById,
	adminWebsiteSchudle,
	getWebsiteSchudle,
	getWebsiteSchudleById,
	adminWebsiteContent,
	getWebsiteContent,
	getWebsiteContentById,
	getWebsiteCourseModel,
	getActiveWebsiteCourseModel,
	getWebsiteCourseModelById,
	getEnquire,
	getEnquireById,
	adminEnquire,
	getNewWebsiteContent,
	getNewWebsiteContentById,
	getWebsiteCourseAmountModel,
	getWebsiteCourseAmountModelById,
	getWebsitePointsModel,
	getWebsitePointsModelById,
	getWebsiteCenterModel,
	getWebsiteCenterModelById,
	websiteScheduleResolver,
} from './formQuestions/Query'
import {
	createEnquire,
	createFormQuestion,
	createWebsiteSchudle,
	createWebsiteContent,
	createWebsiteCourse,
	deleteFormQuestion,
	deleteWebsiteSchudle,
	deleteWebsiteContent,
	deleteWebsiteCourse,
	createNewWebsiteContent,
	createWebsiteCourseAmount,
	createWebsitePoints,
	createWebsiteCenter,
	updateWebsiteCenter,
	updateWebsiteContent,
	updateWebsiteCourseAmount,
	updateWebsitePoints,
	deleteWebsitePointsModel,
	deleteWebsiteContentModel,
	deleteWebsiteCourseAmountModel,
	deleteWebsiteCenterModel,
	updateWebsiteCourse,
	updateWebsiteSchudle,
	updateFormQuestion,
	updateStudentClasses,
	updateStudentRegularClass,
} from './formQuestions/Mutation'
import {
	getLeads,
	updateLeadStatus,
	deleteLead,
	assignStaffToLead,
	removeStaffFromLead,
	addLeadAttachments,
	addLeadFollowComments,
	updateLeadDescription,
	editLeadAttachment,
	deleteLeadAttachment,
	updateLeadFollowComment,
	deleteLeadFollowComment,
	getLeadsById,
	deleteAllLead,
	updateLeadDueDate,
} from './formQuestions/leadApi'
import { getAllPaymentLogs, getAllPaymentHistories } from './Payments/query'
import { getCounts, getGraphCounts, getRevanueCounts } from './graph/Query'
import { addDownloadLog } from './graph/Mutation'
import { createFeeConfig } from '@resolvers/feeConfig/Mutation'
import { getActiveFee } from '@resolvers/feeConfig/Query'

const Resolvers = {
	Query: {
		getAllStudents,
		getStudent,
		// Parents
		getAllParents,
		getParent,
		getWhatsappMessages,
		// coach
		getAllCoachs,
		getCoach,
		getAllCenter,
		getCenter,
		getAllClass,
		getClass,
		getAllSession,
		getSession,
		getAllNotification,
		getNotification,
		getUserAnnouncements,
		getUpcomingSessions,
		getCoachUpcomingSessions,
		getCoachClassHistory,
		getCoachSessionCalender,
		getClassMedia,
		getQuestions,
		classQuestionsList,
		getQuestionsByClassID,
		getQuestionByID,
		getAllQuestionsForCoach,
		getAllSessionFeedBack,
		getSessionFeedBack,
		// classRequest
		getClassListByStudentId,
		getClassHistory,
		getSessionsListByClassid,
		getClassRequestListByStudentId,
		getClassRequestList,
		getNotificationsByStudentId,
		deleteAllNotifications,
		getNotificationsByCoachId,
		// assignment
		getClassAssignment,
		getClassAssignmentBySession,
		// admin
		getSessionsByClassLevel,
		adminFormQuestions,
		getFormQuestions,
		getFormQuestionById,
		adminWebsiteSchudle,
		getWebsiteSchudle,
		getWebsiteSchudleById,
		adminWebsiteContent,
		getWebsiteContent,
		getWebsiteContentById,
		getWebsiteCourseModel,
		getActiveWebsiteCourseModel,
		getWebsiteCourseModelById,
		getEnquire,
		getEnquireById,
		adminEnquire,
		getNewWebsiteContent,
		getNewWebsiteContentById,
		getWebsiteCourseAmountModel,
		getWebsiteCourseAmountModelById,
		getWebsitePointsModel,
		getWebsitePointsModelById,
		getWebsiteCenterModel,
		getWebsiteCenterModelById,
		websiteScheduleResolver,
		getLeads,
		getLeadsById,
		getAllPaymentLogs,
		getAllPaymentHistories,
		getGraphCounts,
		getRevanueCounts,
		getCounts,
		getAdminAllClassCode,
		adminGetAllMedia: async (_: any, __: any, ctx: any) => {
			try {
				checkPermission(ctx, 'Media_view') // Check for role
				const result = await adminGetAllMedia(_, __) // Call the imported function
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		adminGetDistinctMedia: async (_: any, __: any, ctx: any) => {
			try {
				checkPermission(ctx, 'Media_view') // Check for role
				const result = await adminGetDistinctMedia(_, __) // Call the imported function
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		adminGetAllCoachSession: async (_: any, __: any, ctx: any) => {
			try {
				checkPermission(ctx, 'Coaches_view') // Check for role
				const result = await adminGetAllCoachSession(_, __) // Call the imported function
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		adminGetAllCoachClass: async (_: any, __: any, ctx: any) => {
			try {
				checkPermission(ctx, 'Coaches_view') // Check for role
				const result = await adminGetAllCoachClass(_, __) // Call the imported function
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		getAdminAllParents: async (_: any, __: any, ctx: any) => {
			try {
				checkPermission(ctx, 'Parents_view') // Check for role
				const result = await getAdminAllParents(_, __) // Call the imported function
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		getAdminAllClassRequests: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'ClassRequests_view')
				const result = await getAdminAllClassRequests(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		getAdminAllClasses: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Class_view')
				const result = await getAdminAllClasses(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		adminGetParentById: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Parents_view')
				const result = await adminGetParentById(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		adminStudentList: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Students_view')
				const result = await adminStudentList(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		adminGetStudentInfo: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Students_view')
				const result = await adminGetStudentInfo(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		adminGetSessionsList: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Session_view')
				const result = await adminGetSessionsList(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		adminGetSessionsListByClassId: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Session_view')
				const result = await adminGetSessionsListByClassId(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		adminQuestionsList: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'AskQuestion_view')
				const result = await adminQuestionsList(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		getQuestionsWithCoachData: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'AskQuestion_view')
				const result = await getQuestionsWithCoachData(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		getStudentsWithAttendance: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Students_view')
				const result = await getStudentsWithAttendance(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		getAllRolesWithPermissions: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Staff_view')
				const result = await getAllRolesWithPermissions(_)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		getStaffList: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Staff_view')
				const result = await getStaffList(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		getClassListByCenterId: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Class_view')
				const result = await getClassListByCenterId(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		getCenterListPagination: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Centre_view')
				const result = await getCenterListPagination(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		getClassesByLevelAndType: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Class_view')
				const result = await getClassesByLevelAndType(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		getNotificationsPagination: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Notification_view')
				const result = await getNotificationsPagination(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		getAdminCoachsList: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Coaches_view')
				const result = await getAdminCoachsList(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		getUser,
		getAllUsers,
		getActiveFee
	},
	Mutation: {
		// users operations
		resetPasswordByToken,
		updateUser: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Staff_edit')
				const result = await updateUser(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		// students
		createStudent: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Students_create')
				const result = await createStudent(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		editStudent: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Students_edit')
				const result = await editStudent(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		deleteStudent: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Students_delete')
				const result = await deleteStudent(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		// payment info
		addBankDetails,
		addCardDetails,
		deleteCardDetails,
		deleteBankDetails,
		// parents
		createParent,
		editParent: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Parents_edit')
				const result = await editParent(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		deleteParent: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Parents_delete')
				const result = await deleteParent(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		resetPassword,
		// login
		parentLogin,
		coachLogin,
		userLogin,
		// website quires
		createEnquire,
		createFormQuestion,
		createWebsiteSchudle,
		createWebsiteContent,
		createWebsiteCourse,
		deleteFormQuestion,
		deleteWebsiteSchudle,
		deleteWebsiteContent,
		deleteWebsiteCourse,
		createNewWebsiteContent,
		createWebsiteCourseAmount,
		createWebsitePoints,
		createWebsiteCenter,
		updateWebsiteCenter,
		updateWebsiteContent,
		updateWebsiteCourseAmount,
		updateWebsitePoints,
		deleteWebsitePointsModel,
		deleteWebsiteContentModel,
		deleteWebsiteCourseAmountModel,
		deleteWebsiteCenterModel,
		updateWebsiteCourse,
		updateWebsiteSchudle,
		updateFormQuestion,
		updateStudentClasses,
		// lead quires
		updateLeadStatus: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'SalesPipeline_edit')
				const result = await updateLeadStatus(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		deleteLead: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'SalesPipeline_delete')
				const result = await deleteLead(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		assignStaffToLead: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'SalesPipeline_edit')
				const result = await assignStaffToLead(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		removeStaffFromLead: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'SalesPipeline_edit')
				const result = await removeStaffFromLead(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		addLeadAttachments: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'SalesPipeline_edit')
				const result = await addLeadAttachments(_, __, ctx)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		addLeadFollowComments: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'SalesPipeline_edit')
				const result = await addLeadFollowComments(_, __, ctx)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		updateLeadDescription: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'SalesPipeline_edit')
				const result = await updateLeadDescription(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		editLeadAttachment: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'SalesPipeline_edit')
				const result = await editLeadAttachment(_, __, ctx)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		deleteLeadAttachment: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'SalesPipeline_edit')
				const result = await deleteLeadAttachment(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		updateLeadFollowComment: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'SalesPipeline_edit')
				const result = await updateLeadFollowComment(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		deleteLeadFollowComment: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'SalesPipeline_edit')
				const result = await deleteLeadFollowComment(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		deleteRole,
		checkPaymentStatus,
		payByCard,
		payByQr,
		updateLeadDueDate: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'SalesPipeline_edit')
				const result = await updateLeadDueDate(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		paymentStatusById,
		addDownloadLog,
		// coach
		createCoach: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Coaches_create')
				const result = await createCoach(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		editCoach: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Coaches_edit')
				const result = await editCoach(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		editCoachApp: async (_: any, __: any, ctx: any) => {
			try {
				// await checkPermission(ctx, 'Coaches_edit')
				const result = await editCoach(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		deleteCoach: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Coaches_delete')
				const result = await deleteCoach(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		resetCoachPassword,
		
		createCenter: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Centre_create')
				const result = await createCenter(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		editCenter: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Centre_edit')
				const result = await editCenter(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		deleteCenter: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Centre_delete')
				const result = await deleteCenter(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		createClass: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Class_create')
				const result = await createClass(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		editClass: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Class_edit')
				const result = await editClass(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		deleteClass: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Class_delete')
				const result = await deleteClass(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		createSession: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Session_create')
				const result = await createSession(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		editSession: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Session_edit')
				const result = await editSession(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		deleteSession: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Session_delete')
				const result = await deleteSession(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		markAttendees,
		// notifications
		createNotification: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Notification_create')
				const result = await createNotification(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		editNotification: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Notification_edit')
				const result = await editNotification(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		deleteNotification: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Notification_delete')
				const result = await deleteNotification(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		updateNotifications: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Notification_edit')
				const result = await updateNotifications(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		addStudents,
		editStudentWithImage,
		clearUserAnnouncements,
		// media 
		createMedia: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Media_create')
				const result = await createMedia(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		deleteMedia: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Media_delete')
				const result = await deleteMedia(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		createQuestion,
		addComment,
		forgotPassByMail,
		// session feedback
		createSessionFeedBack,
		editSessionFeedBack,
		// classRequest
		createClassRequest: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'ClassRequests_create')
				const result = await createClassRequest(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		// Assignment
		createAssignment,
		deleteAssignment,
		addStudentSubmission,
		clearPaymentsHistory,
		deleteClassRequest: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'ClassRequests_delete')
				const result = await deleteClassRequest(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		
		// users
		createUser,
		updateStatusClassRequest: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'ClassRequests_edit')
				const result = await updateStatusClassRequest(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		coachRemainder: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'AskQuestion_edit')
				const result = await coachRemainder(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		resetPasswordWithId,
		resetPasswordWithIdCoach,
		CreateMultipleSession: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Session_create')
				const result = await CreateMultipleSession(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		CreateTrailSession: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Session_create')
				const result = await CreateTrailSession(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		// addRolesWithPermissions: async (_: any, __: any, ctx: any) => {
		// 	try {
		// 		await checkPermission(ctx, 'Staff_create')
		// 		const result = await addRolesWithPermissions(_, __)
		// 		return result
		// 	} catch (error) {
		// 		// Handle the error gracefully or return a specific error message or data
		// 		return error
		// 	}
		// },
		addRolesWithPermissions,
		editRolePermissions,
		deleteAllLead,
		updateStudentRegularClass,
		// editRolePermissions: async (_: any, __: any, ctx: any) => {
		// 	try {
		// 		await checkPermission(ctx, 'Staff_edit')
		// 		const result = await editRolePermissions(_, __)
		// 		return result
		// 	} catch (error) {
		// 		// Handle the error gracefully or return a specific error message or data
		// 		return error
		// 	}
		// },
		addStaff: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Staff_create')
				const result = await addStaff(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		editStaff: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Staff_edit')
				const result = await editStaff(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		changeStaffCenter: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Centre_edit')
				const result = await changeStaffCenter(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		changeClassCenter: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Centre_edit')
				const result = await changeClassCenter(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		resetParentPassword: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Parents_edit')
				const result = await resetParentPassword(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		updateStaffStatus,
		deleteStaff: async (_: any, __: any, ctx: any) => {
			try {
				await checkPermission(ctx, 'Staff_delete')
				const result = await deleteStaff(_, __)
				return result
			} catch (error) {
				// Handle the error gracefully or return a specific error message or data
				return error
			}
		},
		// Fee Config
		createFeeConfig,
	},
	Subscription: {
		commentsSub: {
			subscribe: withFilter(
				() => pubsub.asyncIterator('COMMENT_ADDED'),
				(payload, variables) => {
					// Here you can define your filter logic based on the variables passed in
					// In this example, we only return the payload if the comment matches the specified author

					return (
						payload?.questionId?.toString() === variables?.questionId.toString()
					)
				}
			),
			resolve: (payload: any) => {
				console.log(payload.studentId, 'payload')
				return payload
			},
		},
	},
}
export default Resolvers
