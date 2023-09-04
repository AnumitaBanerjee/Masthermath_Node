import { Types } from 'mongoose'

/* all types related to parents entity */

export interface IParents {
  _id: string
  name: string
  email: string
  password: string
  phone: string
  address: string
  image: string
  paymentCusId: string
  wid?: string | null
  children: IStudents[]
  resetToken:string
	resetTokenExpiry:number
}

export interface IUser {
  equals(_id: string): unknown
  _id: string
  name: string
  email: string
  password: string
  phoneNumber: string
  address: string
  idProof: string
  staffCenter: Types.ObjectId[]
  staffRole: Types.ObjectId[]
  status:boolean
  resetToken:string
	resetTokenExpiry:number
}


export interface IRole {
  _id: string
  roleName: string
  permissions: string[]

}
/* all types related to students entity */
export interface IBankAccountInfo {
  _id: string
  bankName: string
  accountNumber: string
  accountHolderName: string
  paymentCusId: string
  payToken: string
}
export interface ICreditCardInfo {
  _id?: string
  nameOnCard: string
  cardNumber: string
  expireDate: Date
  cvv: number
  month: string
  year: string
  paymentCusId: string
  payToken: string
}
export interface IStudents {
  _id: string
  name: string
  parentId: Types.ObjectId | IParents
  studentType: string
  classId: Types.ObjectId[] | IClass[]
  cardDetails?: ICreditCardInfo[]
  image: string
  BankAccountDetails?: IBankAccountInfo[]
}
export interface ICenter {
  _id: string
  centerName: string
  centerAddress: string
  centerCode: string
  sessions: Types.ObjectId[] | IClass[]
}
export interface IDownloadLogs {
  _id: string
  downloadLink: string
  fileType: string
  fileSource: string
}
export interface IClassRequest {
  _id: string
  requestType:string
  classLevel:string
  sessions: Types.ObjectId[]
  statusReason:string
  status:string
  created_at: Date
  isClear:boolean
}
export interface ICoach {
  _id: string
  name: string
  coachName: string
  emailAddress: string
  phoneNumber: string
  address: string
  idProof: string
  coachType: string[]
  askQuestionLevel: string[]
  password:string
  profileImg:string
  resetToken:string
	resetTokenExpiry:number
}
export interface IClass {
  _id: string
  classCode: string
  classType: string
  classLevel: string
  mode: string
  center: ICenter | null
  centerId: Types.ObjectId
  fromDate: Date
  toDate: Date
  status: string
  sessions: Types.ObjectId[] | ISession[]
  students: Types.ObjectId[]
}
export interface ISession {
  _id: string
  sessionType: string
  sessionName: string
  totalSeats: number
  permanentCoach: ICoach
  temporaryCoach: ICoach
  Date: Date
  fromTime: Date
  toTime: Date
  status: string
  classId: Types.ObjectId
  class: IClass[] | IClass | null
  attendees: Types.ObjectId[],
  summary:string
  progressReport:string
  meeingLink:string
  start_url:string
  meeting_id:string
  meeting_passcode:string
}
export interface ISessionFeedBack{
  _id: string
  sessionId: Types.ObjectId
  studentId: Types.ObjectId
  feedback: string
}
export interface INotification {
  _id: string
  selectNotificationType: string
  selectTheUser: string
  selectClassLevel: string
  selectClassType: string
  selectClassCode: string
  addDescription: string
  sesions: Types.ObjectId[]
  insertLink: string
  created_at:Date
}
export interface ITrackNotification {
  _id: string
  studentId: Types.ObjectId
  statusType: string
  updated_at: Date
  created_at: Date
}
export interface IMedia {
  _id: string
  classId: Types.ObjectId
  forMonth: Date
  mediaAccess: string
  mediaUrl: string
  docType: string
  mediaType:string
}
export interface ISubmittion {
  studentId: Types.ObjectId,
  answerUrl: string
}
export interface IAssignment{
  _id: string
  classId: Types.ObjectId
  sessionId: Types.ObjectId
  docType: string
  questionUrl:string
  submission:ISubmittion[]
  createdAt:Date
}
export interface IQuestion {
  question_text: string
  created_at: Date
  student_id: Types.ObjectId
  comments: Types.ObjectId
  class_id: Types.ObjectId
  unseen_comments_count:number
  comments_count:number
}
export interface IComment {
  commentText: string
  created_at: Date
  studentId: Types.ObjectId
  coachId: Types.ObjectId
  questionId: Types.ObjectId
}
export interface IFormQuestions {
  question: string
  type: string
  order: number
  answerCode: string
  options: IFormOptionLists[]
}
export interface IFormOptions {
  option: string
}

export interface IFormOptionLists {
  _id?: Types.ObjectId
  option?: string
  label: string
  code: string
  value: string
}
export interface IWebsiteContent {
  contentType: string
  contentValue: string
}
export interface IWebsiteSchudle {
  classLevel: string
  fromDate: Date
  toDate: Date
  classCode: string
  className: string
  fromTime: Date
  toTime: Date
  year: string
  mode: string
  location: string
  description: string
  seatCapacity: string
}
export interface IWebsiteCourse {
  classLevel: string
  classCode: string
  classTitle: string
  classType: string
  title: string
  price: number
  seatCapacity: number
  fromDate: Date
  toDate: Date
  fromTime: Date
  toTime: Date
  mode: string
  location: string
  description: string
}
export interface IQuestionOptions {
  question: string
  answer: string
}
export interface IEnquire {
  classLevel: string
  session?: string
  courseId: string
  classCode: string
  classType: string
  emailAddress: string
  phoneNumber: string
  firstName: string
  lastName: string
  childFirstName: string
  childLastName: string
  source: string
  state: string
  country: string
  address: string
  city: string
  zipCode: string
  options: IQuestionOptions[]
}

export interface INewWebsiteContent {
  title: string
  description: string
  year: number
  image: string
}
export interface IWebsiteCourseAmount {
  title: string
  description: string
}
export interface IWebsitePoints {
  title: string
  image: string
  options: IFormOptions[]
}
export interface IWebsiteCenter {
  centerName: string
  centerAddress: string
  centerCode: string
}

// 
export interface ILeadHistory {
  oldStatus: string
  newStatus: string
  createdAt: Date
}
export interface ILeadAttachments {
  _id: string
  id: string
  attachment: string
  staff: IUser[] | undefined
  createdAt: Date
}
export interface ILeadFollowCmmments {
  comment: string
  _id: string
  commentAttachment: string
  staff: IUser | undefined
  createdAt: Date
}

export interface ILead {
  leadStatus: string
  classType: string
  courseId: string
	sessionId: string
  leadDescription: string
  dueDate: Date
  leadAttachments: ILeadAttachments[]
  leadHistory: ILeadHistory[]
  leadFollowCmmments: ILeadFollowCmmments[]
  staff: IUser[]
  parent: IParents
  student: IStudents
  enquire: IEnquire
  createdAt:Date
}

// payment
export interface IPayment {
  id?: Types.ObjectId
  month: string
  payMethod: string
  payId: string
  status: string
  studentId: Types.ObjectId,
  parentId: Types.ObjectId,
  classId: Types.ObjectId,
  centerId: Types.ObjectId,
  date: string
  amount:string
  createdAt: Date
  invoiceNo:string
	receiptNo:string
	planTax:number,
	setupFee:number,
	setupTax:number,
	discount:number,
	planQty:number,
	setupQty:number,
	planTotalAmount:number,
	setupTotalAmount:number,
	subTotal:number,
	discountTotalAmount:number,
	taxTotalAmount:number,
	payableAmount:number,
  cardType:string,
  last4:string
}

// Whatsapp
export interface IWhatsappRequest {
  phone: string
  message: string
}

export interface IMailAttachment {
  Name: string
  Content: string
  ContentType: string
}

export interface IMailRequest {
  from: string
  to: string
  subject: string
  htmlBody: string
  attachments?: IMailAttachment[]
}



export interface IWhatsappGetMessageRequest {
  wid: string
  page: number,
  limit: number,
}
export interface IWhatsappGetMessages {
  id: string,
  type: string,
  ack: string,
  isAdminMessage: boolean,
  date: string,
  timestamp: number,
  body: string
}

export interface IFeeConfig {
  id?: string,
  planTax: number,
  setupFee: number
  setupTax: number
  discount: number
}

// 
export interface IPasswordLogs {
  _id: string
  resetToken: string
  mail: string
  resetDate: string
  resetTime: string
  resetExpireTime: string
  resetDateTime: Date
  userType: string
}