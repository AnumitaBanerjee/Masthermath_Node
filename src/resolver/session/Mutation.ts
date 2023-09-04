/* eslint-disable no-mixed-spaces-and-tabs */
import sessionModel from "@models/schedule/session/sessions.model";
import sessionService, { sessionsRR } from "./module.service";
import { Types } from "mongoose";
import { refreshToken } from "./zoom/tokenUtils";
import classes from "@models/schedule/classes.models";
import axios from "axios";
import jwt, { JwtPayload } from "jsonwebtoken";
import paymentmodel from "@models/payment";
import { addMinutes, isAfter, startOfDay, endOfDay, subMonths } from "date-fns";
import studentmodel from "@models/students.model";
import feeConfigModel from "@models/feeConfig.model";
import { stripeInstance } from "@resolvers/formQuestions/utils/Payment";
import { leadModel } from "@models/websiteQuestions/lead.model";
import WebsiteCourseModel from "@models/websiteQuestions/websiteCourse.model";
import * as ejs from "ejs";
import path from "path";
import generatePDF from "@utils/generatePDF";
import { IFeeConfig } from "@schema/entity.types";
import moment from "moment";
import mail from "@utils/mail";

const FIXEDPAYMENT = 197;
const FIXEDPAYMENTINCENTS = FIXEDPAYMENT * 100;
const FIXEDPARTPAYMENT = 49.25;
const FIXEDPARTPAYMENTCENTS = FIXEDPARTPAYMENT * 100;

export const createSession = async (
  _: any,
  args: sessionsRR.Request
): Promise<sessionsRR.Response> => {
  const services = new sessionService();
  const newData = await services.create(args);
  return newData;
};

export const editSession = async (
  _: any,
  args: sessionsRR.Request & {
    _id: string;
    summary: string;
    progressReport: string;
  }
): Promise<sessionsRR.Response> => {
  const services = new sessionService();
  return await services.update(args);
};

export const deleteSession = async (_: any, args: { _id: string }) => {
  const services = new sessionService();
  const status = await services.deleteById(args._id);
  return status.deletedCount === 1;
};

// coach only
export const markAttendees = async (
  _: any,
  args: sessionsRR.AttendanceRequest
): Promise<sessionsRR.AttendanceResponse> => {
  const services = new sessionService();
  const status = await services.markAttendees(args);
  return status;
};

interface fields {
  sessionType: string;
  sessionName: string;
  totalSeats: string;
  permanentCoach: string;
  temporaryCoach: string;
  Date: Date;
  fromTime: Date;
  toTime: Date;
  repeatEvery: number;
  repeatCount: number;
  repeatInterval: string;
  classId: string;
}

export const CreateMultipleSession = async (
  _: any,
  args: fields
): Promise<any> => {
  const {
    sessionType,
    totalSeats,
    permanentCoach,
    temporaryCoach,
    Date: date,
    fromTime,
    toTime,
    repeatEvery,
    repeatCount,
    repeatInterval,
    classId,
  } = args;

  const sessions = [];

  if (sessionType === "automatic" || sessionType === "Manual") {
    const sessionLength = repeatCount;
    const startDate = new Date(date);

    let intervalInDays;
    switch (repeatInterval) {
      case "day":
        intervalInDays = repeatEvery;
        break;
      case "week":
        intervalInDays = repeatEvery * 7;
        break;
      case "month":
        intervalInDays = repeatEvery * 30;
        break;
      default:
        throw new Error("Invalid repeatInterval");
    }

    let access_token = process.env.zoom_access_token!;
    const refresh_token = process.env.zoom_refresh_token!;

    const decodedToken = jwt.decode(access_token) as JwtPayload | null;
    if (decodedToken) {
      const expirationTime = decodedToken.exp as number;
      const currentTime = Math.floor(Date.now() / 1000);
      if (expirationTime < currentTime) {
        access_token = await refreshToken(refresh_token);
      }
    }

    for (let i = 0; i < sessionLength; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i * intervalInDays);

      const existingSession = await sessionModel.findOne({
        Date: currentDate,
        fromTime,
        toTime,
      });

      if (existingSession) {
        throw new Error(
          "Session already exists with the same date, from time, and to time"
        );
      }
      const from = new Date(fromTime); // Convert fromTime to a Date object
      const to = new Date(toTime); // Convert toTime to a Date object

      const durationInMinutes = Math.floor(
        (to.getTime() - from.getTime()) / (1000 * 60)
      );

      const meetingResponse = await axios.post(
        "https://api.zoom.us/v2/users/me/meetings",
        {
          topic: `session ${i + 1}`,
          type: 2, // Scheduled meeting
          start_time: fromTime,
          duration: durationInMinutes > 200 ? 60 : durationInMinutes,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { join_url, start_url, id, password } = meetingResponse.data;

      const session = new sessionModel({
        sessionType: "Automatic",
        sessionName: `session ${i + 1}`,
        totalSeats,
        permanentCoach,
        temporaryCoach,
        Date: currentDate,
        fromTime,
        toTime,
        class: new Types.ObjectId(classId),
        attendees: [],
        summary: null,
        progressReport: null,
        meeingLink: join_url,
        start_url: start_url,
        meeting_id: id,
        meeting_passcode: password,
      });
      if (session.class) {
        await classes.updateOne(
          { _id: session.class },
          { $push: { sessions: session } }
        );
      }
      sessions.push(session);
    }
  }

  try {
    const createdSessions = await sessionModel.insertMany(sessions);

    return createdSessions ? true : false;
  } catch (error) {
    throw new Error("Failed to create sessions");
  }
};

export const CreateTrailSession = async (
  _: any,
  args: fields
): Promise<any> => {
  const { sessionName, totalSeats, classId } = args;
  const sessions = [];

  const session = new sessionModel({
    sessionName,
    totalSeats,
    class: new Types.ObjectId(classId),
    attendees: [],
    summary: null,
    progressReport: null,
    sessionType: "Automatic",
    permanentCoach: null,
    temporaryCoach: null,
    Date: null,
    fromTime: null,
    toTime: null,
  });
  sessions.push(session);

  try {
    const createdSessions = await sessionModel.insertMany(sessions);
    console.log(createdSessions, "createdSessions");

    return createdSessions ? true : false;
  } catch (error) {
    console.log(error, "error");
    throw new Error("Failed to create sessions");
  }
};

export const checkPaymentStatus = async (
  _: any,
  { studentId }: { studentId: string }
) => {
  try {
    // Fetch the student's information including the class ID
    const student: any = await studentmodel
      .findById(studentId)
      .populate("classId");

    if (!student) {
      throw new Error("Student not found");
    }

    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });
    const currentDate = new Date();

    // Trial_Class
    if (student.classId[0].classType === "Trial_Class") {
      const getLead = await leadModel.findOne({
        student: student,
      });

      if (!getLead) {
        throw new Error("Error with student registration.");
      }
      const leadTime = new Date(getLead.createdAt.valueOf());
      const newCreatedAt = new Date(leadTime.setDate(leadTime.getDate() + 5)); // Adding 5 days to createdAt

      const currentDate = new Date(); // Current date
      const dueDate = new Date(getLead.dueDate);

      if (getLead.dueDate && currentDate.getTime() > dueDate.getTime()) {
        return {
          success: false,
          message: "Trail Perid Over",
          month: null,
          dueDate: getLead.dueDate,
          allowedToUseApp: false,
          sessionsCount: [],
          paymentAmt: 0,
          payId: 0,
        };
      }

      if (currentDate.getTime() > newCreatedAt.getTime()) {
        return {
          success: false,
          message: "Trail Perid Over",
          month: null,
          dueDate: newCreatedAt,
          sessionsCount: [],
          paymentAmt: 0,
          payId: 0,
          allowedToUseApp: false,
        };
      } else {
        return {
          success: true,
          message: "Trail Not Perid Over",
          month: null,
          dueDate: newCreatedAt,
          allowedToUseApp: true,
          sessionsCount: [],
          paymentAmt: 0,
          payId: 0,
        };
      }

      // Check if the payment intent was successful
    }
    if (student.classId[0].classType === "Crash_Course_Class") {
      const crashExistingStudent = await paymentmodel.find({
        studentId,
        status: "paid",
      });
      if (crashExistingStudent.length > 0) {
        return {
          paymentAmt: 0,
          classType: "Crash_Course_Class",
          student: student,
          sessionsCount: [],
          month: currentMonth,
          dueDate: "Already paid",
          status: "paid",
          allowedToUseApp: true,
          message: "Payment received. You are allowed to use the app.",
        };
      }
      const getLead = await leadModel.findOne({
        student: student,
      });
      if (!getLead) {
        throw new Error("Error with student registration.");
      }
      const courseData = await WebsiteCourseModel.findOne({
        _id: getLead?.courseId,
      });
      if (!courseData) {
        throw new Error("Error with student registration and course.");
      }
      return {
        paymentAmt: courseData.price ? courseData.price : FIXEDPAYMENTINCENTS,
        classType: "Crash_Course_Class",
        student: student,
        sessionsCount: [],
        month: currentMonth,
        dueDate: "",
        status: "not paid",
        allowedToUseApp: false,
        message:
          "Please make the payment for this month to continue using the app.",
      };
    }

    // Fetch the payment for the previous month for the given studentId
    const previousMonth = new Date(subMonths(currentDate, 1)).toLocaleString(
      "default",
      { month: "long" }
    );
    const existingStudent = await paymentmodel.find({
      studentId,
      status: "paid",
    });
    const previousMonthPayment = await paymentmodel.findOne({
      studentId,
      month: previousMonth,
    });

    //

    // // Check if payment already exists for previous month
    // if (previousMonthPayment && previousMonthPayment.status !== 'paid') {
    // 	return {
    // 		paymentAmt: 0,
    // 		student: student,
    // 		sessionsCount: [],
    // 		month: currentMonth,
    // 		dueDate: 'Previous month payment not made',
    // 		status: 'not paid',
    // 		allowedToUseApp: false,
    // 		message:
    //   'Please make the payment for the previous month to continue using the app.',
    // 	}
    // }

    // Fetch the payment for the current month for the given studentId
    const currentMonthPayment = await paymentmodel.findOne({
      studentId,
      month: currentMonth,
      status: "paid",
    });

    // Check if payment already exists for current month
    if (currentMonthPayment) {
      return {
        paymentAmt: FIXEDPAYMENTINCENTS,
        student: student,
        sessionsCount: [],
        month: currentMonth,
        dueDate: "Already paid",
        status: "paid",
        allowedToUseApp: true,
        message: "Payment received. You are allowed to use the app.",
      };
    }
    if (
      student.classId[0].classType === "Regular_Class" &&
      existingStudent.length > 0
    ) {
      return {
        paymentAmt: FIXEDPAYMENTINCENTS,
        student: student,
        sessionsCount: [],
        month: currentMonth,
        dueDate: "7th of next month",
        status: "not paid",
        allowedToUseApp: false,
        message:
          "Please make the payment for this month to continue using the app.",
      };
    }
    const classId = student.classId[0]._id;

    // Fetch the sessions from the classes held after the current date and time
    const sessions = await sessionModel.find({
      class: classId,
      Date: { $gte: startOfDay(currentDate) },
      // fromTime: { $gte: addMinutes(currentDate, 30) }, // Assuming a minimum of 30 minutes before the current time
    });
    console.log(JSON.stringify(student, null, 3), "sessions");
    // Calculate payment amount and sessions count
    let paymentAmount: number;
    let sessionsCount: string[];

    if (previousMonthPayment) {
      // Old student, charge fixed amount every month
      paymentAmount = FIXEDPAYMENTINCENTS;
      sessionsCount = [];
    } else {
      // New student, charge based on remaining sessions count
      const sessionCount = sessions.length;

      if (sessionCount === 0) {
        paymentAmount = 0;
        sessionsCount = [];
      } else if (sessionCount > 4) {
        paymentAmount = FIXEDPAYMENTINCENTS;
        sessionsCount = sessions.map((session: any) => session._id);
      } else {
        paymentAmount = sessionCount * FIXEDPARTPAYMENTCENTS;
        sessionsCount = sessions.map((session: any) => session._id);
      }
    }

    // Return the payment details
    return {
      student: student,
      paymentAmt: paymentAmount,
      sessionsCount,
      month: currentMonth,
      dueDate: "7th of next month",
      status: "not paid",
      allowedToUseApp: false,
      message:
        sessionsCount.length === 0
          ? // eslint-disable-next-line no-mixed-spaces-and-tabs
            "No Sessions Found For current Month Please Check Back Later"
          : "Please make the payment for this month to continue using the app.",
    };
  } catch (error: any) {
    throw new Error("Error checking payment status " + error?.toString());
  }
};
function toCents(aValue: number) {
  return Math.round((Math.abs(aValue) / 100) * 10000);
}

export const payByCard = async (
  _: any,
  { studentId }: { studentId: string }
): Promise<any> => {
  try {
    const currentDate = new Date();

    if (!studentId) {
      throw new Error("Pass student Id");
    }
    const student: any = await studentmodel
      .findById(studentId)
      .populate("classId");

    if (!student || typeof student === undefined) {
      throw new Error("Student not found");
    }
    const firstCard = student.cardDetails[0]; // Get the first card from the student's cards

    // Trial_Class
    if (student.classId[0].classType === "Trial_Class") {
      const getLead = await leadModel.findOne({
        student: student,
      });

      if (!getLead) {
        throw new Error("Error with student registration.");
      }
      const createdAt = getLead.createdAt; // Example value, replace with your actual createdAt value

      const currentDate = new Date(); // Current date
      const dueDate = new Date(getLead.dueDate);
      if (getLead.dueDate && currentDate.getTime() > dueDate.getTime()) {
        return {
          success: false,
          message: "Trail Perid Over",
          month: null,
          dueDate: getLead.dueDate,
          sessionsCount: 0,
          paymentAmt: 0,
          payId: 0,
        };
      }
      if (createdAt.getTime() > currentDate.getTime()) {
        // createdAt + 5 days is greater than the current date
        return {
          success: false,
          message: "Trail Perid Over",
          month: null,
          dueDate: getLead.dueDate,
          sessionsCount: 0,
          paymentAmt: 0,
          payId: 0,
        };
      } else {
        return {
          success: true,
          message: "Trail Not Perid Over",
          month: null,
          dueDate: getLead.dueDate,
          sessionsCount: 0,
          paymentAmt: 0,
          payId: 0,
        };
      }

      // Check if the payment intent was successful
    }
    // crashCourse
    if (student.classId[0].classType === "Crash_Course_Class") {
      const existingPayment = await paymentmodel.findOne({
        studentId,
        // createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        status: "paid",
      });

      if (existingPayment) {
        return {
          message: "Payment for the current month has already been done.",
          errorCode: "PAYMENT_ALREADY_DONE",
          status: false,
        };
      }

      const getLead = await leadModel.findOne({
        student: student,
      });

      if (!getLead) {
        throw new Error("Error with student registration.");
      }
      const courseData = await WebsiteCourseModel.findOne({
        _id: getLead?.courseId,
      });

      if (!courseData) {
        throw new Error("Error with student registration and course.");
      }

      const cardPaymentMethod: any = await stripeInstance.paymentMethods.create(
        {
          type: "card",
          card: {
            number: firstCard.cardNumber,
            exp_month: 12,
            exp_year: 2023,
            cvc: firstCard.cvv.toString(),
          },
        }
      );
      const payableCalculation: any = await calculatePayableAmount(
        courseData.price
      );

      // Create a payment intent with the Stripe client using the card token
      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: courseData.price
          ? toCents(payableCalculation.payableAmount)
          : toCents(FIXEDPAYMENTINCENTS),
        confirm: true,
        currency: "sgd",
        payment_method: cardPaymentMethod.id,
        customer: student.cardDetails[0].paymentCusId,
      });

      // Check if the payment intent was successful
      if (paymentIntent.status === "succeeded") {
        // Get the current month and due date for the next month
        const currentMonth = new Date().toLocaleString("default", {
          month: "long",
        });
        const dueDate = new Date();
        dueDate.setDate(7);
        dueDate.setMonth(dueDate.getMonth() + 1);

        // Create a new payment record in the database
        const newPayment: any = new paymentmodel({
          studentId,
          month: currentMonth,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          status: "paid",
          classId: student.classId[0],
          parentId: student.parentId,
          payId: paymentIntent.id,
          centerId: student.classId[0].center[0],
          payMethod: "CARD",
          amount: courseData.price
            ? toCents(courseData.price)
            : FIXEDPAYMENTINCENTS,
          receiptNo: "2023-1001",
          planTax: payableCalculation.planTax,
          setupFee: payableCalculation.setupFee,
          setupTax: payableCalculation.setupTax,
          discount: payableCalculation.discount,
          planQty: payableCalculation.planQty,
          setupQty: payableCalculation.setupQty,
          planTotalAmount: payableCalculation.planTotalAmount,
          setupTotalAmount: payableCalculation.setupTotalAmount,
          subTotal: payableCalculation.subTotal,
          discountTotalAmount: payableCalculation.discountTotalAmount,
          taxTotalAmount: payableCalculation.taxTotalAmount,
          payableAmount: payableCalculation.payableAmount,
          cardType: cardPaymentMethod.card.brand,
          last4: cardPaymentMethod.card.last4,
        });

        await newPayment.save();
        paymentReceiptVoucher(studentId, newPayment._id, true);
        return {
          success: true,
          message: "Payment successful. Thank you!",
          month: currentMonth,
          dueDate: dueDate.toLocaleDateString(),
          sessionsCount: 0,
          paymentAmt: courseData.price ? courseData.price : FIXEDPAYMENTINCENTS,
          payId: paymentIntent.id,
        };
      } else {
        // Payment failed

        return {
          success: false,
          message: "Payment failed. Please try again.",
          month: null,
          dueDate: null,
          sessionsCount: null,
          paymentAmt: null,
        };
      }
    }

    // Check if the student has an existing paid payment record
    const existingStudent = await paymentmodel.find({
      studentId,
      status: "paid",
    });
    // const existingPayment = await paymentmodel.findOne({
    // 	studentId,
    // 	createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    // 	status: 'paid',
    // })

    // if (existingPayment) {
    // 	return {
    // 		message: 'Payment for the current month has already been done.',
    // 		errorCode: 'PAYMENT_ALREADY_DONE',
    // 		status: false,
    // 	}
    // }

    // Student is a new student, calculate the payment amount based on sessions count
    // Fetch the student's information including the first card and sessions

    if (student.cardDetails?.length === 0) {
      throw new Error("Student card Details not found");
    }
    if (!student.cardDetails) {
      throw new Error("Student card Details not found");
    }
    const classId = student.classId[0]._id;

    const sessions = await sessionModel.find({
      class: classId,
      Date: { $gte: startOfDay(currentDate) },
      // fromTime: { $gte: addMinutes(currentDate, 30) }, // Assuming a minimum of 30 minutes before the current time
    });

    const cardPaymentMethod: any = await stripeInstance.paymentMethods.create({
      type: "card",
      card: {
        number: firstCard.cardNumber,
        exp_month: 12,
        exp_year: 2023,
        // cvc: firstCard.cvv.toString(),
      },
    });

    let paymentAmt: number;
    if (existingStudent.length > 0) {
      // Student is an existing paid student, set the payment amount to 179
      paymentAmt = FIXEDPAYMENTINCENTS;
    } else {
      if (sessions.length <= 4) {
        paymentAmt = FIXEDPARTPAYMENTCENTS * sessions.length;
      } else {
        paymentAmt = FIXEDPAYMENTINCENTS;
      }
    }

    if (paymentAmt === 0) {
      {
        return {
          success: false,
          message: "Payment failed. Please try again.",
          month: null,
          dueDate: null,
          sessionsCount: null,
          paymentAmt: null,
        };
      }
    }
    const payableCalculation: any = await calculatePayableAmount(paymentAmt);
    // Create a payment intent with the Stripe client using the card token
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: toCents(payableCalculation.payableAmount),
      confirm: true,
      currency: "sgd",
      payment_method: cardPaymentMethod.id,
      customer: student.cardDetails[0].paymentCusId,
    });

    // Check if the payment intent was successful
    if (paymentIntent.status === "succeeded") {
      // Get the current month and due date for the next month
      const currentMonth = new Date().toLocaleString("default", {
        month: "long",
      });
      const dueDate = new Date();
      dueDate.setDate(7);
      dueDate.setMonth(dueDate.getMonth() + 1);

      // Create a new payment record in the database
      const newPayment: any = new paymentmodel({
        studentId,
        month: currentMonth,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: "paid",
        classId: student.classId[0],
        parentId: student.parentId,
        centerId: student.classId[0].center[0],
        payId: paymentIntent.id,
        payMethod: "CARD",
        amount: paymentAmt,
        receiptNo: "2023-1001",
        planTax: payableCalculation.planTax,
        setupFee: payableCalculation.setupFee,
        setupTax: payableCalculation.setupTax,
        discount: payableCalculation.discount,
        planQty: payableCalculation.planQty,
        setupQty: payableCalculation.setupQty,
        planTotalAmount: payableCalculation.planTotalAmount,
        setupTotalAmount: payableCalculation.setupTotalAmount,
        subTotal: payableCalculation.subTotal,
        discountTotalAmount: payableCalculation.discountTotalAmount,
        taxTotalAmount: payableCalculation.taxTotalAmount,
        payableAmount: payableCalculation.payableAmount,
        cardType: cardPaymentMethod.card.brand,
        last4: cardPaymentMethod.card.last4,
      });

      await newPayment.save();
      paymentReceiptVoucher(studentId, newPayment._id, true);
      return {
        success: true,
        message: "Payment successful. Thank you!",
        month: currentMonth,
        dueDate: dueDate.toLocaleDateString(),
        sessionsCount: existingStudent.length > 0 ? 0 : sessions.length,
        paymentAmt,
        payId: paymentIntent.id,
      };
    } else {
      // Payment failed

      return {
        success: false,
        message: "Payment failed. Please try again.",
        month: null,
        dueDate: null,
        sessionsCount: null,
        paymentAmt: null,
      };
    }
  } catch (error: any) {
    console.log("====================================");
    console.log(error);
    console.log("====================================");
    throw new Error("Failed to make payment " + error?.toString());
  }
};

export const payByQr = async (
  _: any,
  { studentId }: { studentId: string }
): Promise<any> => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = new Date().getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const student: any = await studentmodel
      .findById(studentId)
      .populate("cardDetails")
      .populate("classId");

    if (!student) {
      throw new Error("Student not found");
    }
    // if (student.cardDetails?.length === 0) {
    // 	throw new Error('Student card Details not found')
    // }
    // if (!student.cardDetails) {
    // 	throw new Error('Student card Details not found')
    // }

    const classId = student.classId[0]._id;
    if (!student.classId[0].classType) {
      throw new Error("class Type not found");
    }
    // const firstCard = student.cardDetails[0] // Get the first card from the student's cards
    if (student.classId[0].classType === "Crash_Course_Class") {
      const existingPayment = await paymentmodel.findOne({
        studentId,
        // createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        status: "paid",
      });

      if (existingPayment) {
        return {
          message: "Payment for the current month has already been done.",
          errorCode: "PAYMENT_ALREADY_DONE",
          status: false,
        };
      }

      const getLead = await leadModel.findOne({
        student: student,
      });

      if (!getLead) {
        throw new Error("Error with student registration.");
      }
      const courseData = await WebsiteCourseModel.findOne({
        _id: getLead?.courseId,
      });

      if (!courseData) {
        throw new Error("Error with student registration and course.");
      }

      const payableCalculation: any = await calculatePayableAmount(
        courseData.price ? courseData.price : FIXEDPAYMENTINCENTS
      );

      const paymentIntent = await stripeInstance.paymentIntents.create({
        payment_method_types: ["paynow"],
        payment_method_data: {
          type: "paynow",
        },
        amount: toCents(payableCalculation.payableAmount),
        currency: "sgd",
      });

      // Check if the payment intent was successful
      if (paymentIntent.status === "requires_confirmation") {
        // Get the current month and due date for the next month
        const currentMonth = new Date().toLocaleString("default", {
          month: "long",
        });
        const dueDate = new Date();
        dueDate.setDate(7);
        dueDate.setMonth(dueDate.getMonth() + 1);

        // Create a new payment record in the database
        const newPayment: any = new paymentmodel({
          studentId,
          month: currentMonth,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          status: "not paid",
          classId: student.classId[0],
          centerId: student.classId[0].center[0],
          parentId: student.parentId,
          payId: paymentIntent.id,
          payMethod: "QR",
          amount: courseData.price ? courseData.price : FIXEDPAYMENTINCENTS,
          receiptNo: "2023-1001",
          planTax: payableCalculation.planTax,
          setupFee: payableCalculation.setupFee,
          setupTax: payableCalculation.setupTax,
          discount: payableCalculation.discount,
          planQty: payableCalculation.planQty,
          setupQty: payableCalculation.setupQty,
          planTotalAmount: payableCalculation.planTotalAmount,
          setupTotalAmount: payableCalculation.setupTotalAmount,
          subTotal: payableCalculation.subTotal,
          discountTotalAmount: payableCalculation.discountTotalAmount,
          taxTotalAmount: payableCalculation.taxTotalAmount,
          payableAmount: payableCalculation.payableAmount,
        });
        const paymentIntentAction = await stripeInstance.paymentIntents.confirm(
          paymentIntent.id
        );

        await newPayment.save();

        return {
          success: true,
          message: "QR Generated PayNow. Thank you!",
          month: currentMonth,
          dueDate: dueDate.toLocaleDateString(),
          sessionsCount: 0,
          paymentAmt: courseData.price
            ? toCents(courseData.price)
            : FIXEDPAYMENTINCENTS,
          payId: paymentIntent.id,
          qrCodeImageUrl:
            paymentIntentAction.next_action?.paynow_display_qr_code
              ?.image_url_png,
          qrCode:
            paymentIntentAction.next_action?.paynow_display_qr_code
              ?.hosted_instructions_url,
          clientSecret: paymentIntent.client_secret,
        };
      } else {
        // Payment failed

        return {
          success: false,
          message: "Payment failed. Please try again.",
          month: null,
          dueDate: null,
          sessionsCount: null,
          paymentAmt: null,
        };
      }
    }

    // Check if the student has an existing paid payment record
    const existingStudent = await paymentmodel.find({
      studentId,
      status: "paid",
    });
    const existingPayment = await paymentmodel.findOne({
      studentId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      status: "paid",
    });

    if (existingPayment) {
      return {
        message: "Payment for the current month has already been done.",
        errorCode: "PAYMENT_ALREADY_DONE",
        status: false,
      };
    }

    // Student is a new student, calculate the payment amount based on sessions count
    // Fetch the student's information including the first card and sessions

    const sessions = await sessionModel.find({
      class: classId,
      Date: { $gte: startOfDay(currentDate) },
      // fromTime: { $gte: addMinutes(currentDate, 30) }, // Assuming a minimum of 30 minutes before the current time
    });

    let paymentAmt: number;
    if (existingStudent.length > 0) {
      // Student is an existing paid student, set the payment amount to 179
      paymentAmt = FIXEDPAYMENTINCENTS;
    } else {
      if (sessions.length <= 4) {
        paymentAmt = FIXEDPARTPAYMENTCENTS * sessions.length;
      } else {
        paymentAmt = FIXEDPAYMENTINCENTS;
      }
    }

    // Create a payment intent with the Stripe client using the card token
    // const paymentIntent = await stripeInstance.paymentIntents.create({
    // 	amount: paymentAmt,
    // 	confirm: true,
    // 	currency: 'sgd',
    // 	payment_method: cardPaymentMethod.id,
    // 	customer: student.cardDetails[0].paymentCusId,
    // })
    const payableCalculation: any = await calculatePayableAmount(paymentAmt);

    const paymentIntent = await stripeInstance.paymentIntents.create({
      payment_method_types: ["paynow"],
      payment_method_data: {
        type: "paynow",
      },
      amount: toCents(payableCalculation.payableAmount),
      currency: "sgd",
    });

    // Check if the payment intent was successful
    if (paymentIntent.status === "requires_confirmation") {
      // Get the current month and due date for the next month
      const currentMonth = new Date().toLocaleString("default", {
        month: "long",
      });
      const dueDate = new Date();
      dueDate.setDate(7);
      dueDate.setMonth(dueDate.getMonth() + 1);

      // Create a new payment record in the database
      const newPayment = new paymentmodel({
        studentId,
        month: currentMonth,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: "not paid",
        classId: student.classId[0],
        centerId: student.classId[0].center[0],
        parentId: student.parentId,
        payId: paymentIntent.id,
        payMethod: "QR",
        amount: paymentAmt,
        receiptNo: "2023-1001",
        planTax: payableCalculation.planTax,
        setupFee: payableCalculation.setupFee,
        setupTax: payableCalculation.setupTax,
        discount: payableCalculation.discount,
        planQty: payableCalculation.planQty,
        setupQty: payableCalculation.setupQty,
        planTotalAmount: payableCalculation.planTotalAmount,
        setupTotalAmount: payableCalculation.setupTotalAmount,
        subTotal: payableCalculation.subTotal,
        discountTotalAmount: payableCalculation.discountTotalAmount,
        taxTotalAmount: payableCalculation.taxTotalAmount,
        payableAmount: payableCalculation.payableAmount,
      });

      await newPayment.save();
      const paymentIntentAction = await stripeInstance.paymentIntents.confirm(
        paymentIntent.id
      );

      return {
        success: true,
        message: "QR Generated PayNow. Thank you!",
        month: currentMonth,
        dueDate: dueDate.toLocaleDateString(),
        sessionsCount: existingStudent.length > 0 ? 0 : sessions.length,
        paymentAmt,
        payId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        qrCodeImageUrl:
          paymentIntentAction.next_action?.paynow_display_qr_code
            ?.image_url_png,
        qrCode:
          paymentIntentAction.next_action?.paynow_display_qr_code
            ?.hosted_instructions_url,
      };
    } else {
      // Payment failed

      return {
        success: false,
        message: "QR Generation failed. Please try again.",
        month: null,
        dueDate: null,
        sessionsCount: null,
        paymentAmt: null,
      };
    }
  } catch (error: any) {
    console.log("====================================");
    console.log(error);
    console.log("====================================");
    throw new Error("Failed to make payment " + error?.toString());
  }
};

export const paymentStatusById = async (
  _: any,
  { paymentId }: { paymentId: string }
): Promise<any> => {
  try {
    const existingStudent = await paymentmodel.findOne({
      payId: paymentId,
      status: "paid",
    });
    const list = await paymentmodel.find({
      // payId:paymentId,
      // status: 'paid',
    });
    console.log(list, "paymentId");

    const paymentIntent = await stripeInstance.paymentIntents.retrieve(
      paymentId
    );
    console.log(paymentIntent, "paymentIntent");

    if (paymentIntent.status === "succeeded") {
      if (!existingStudent) {
        const newExistingStudent = await paymentmodel.findOne({
          payId: paymentId,
        });
        if (newExistingStudent) {
          newExistingStudent.status = "paid";
          await newExistingStudent.save();
        }
      }
    }
    return paymentIntent;
  } catch (error: any) {
    console.log("====================================");
    console.log(error);
    console.log("====================================");
    throw new Error("Failed to check status " + error?.toString());
  }
};

async function paymentReceiptVoucher(
  studentId: any,
  paymentId: any,
  sendEmail = false
) {
  try {
    //------ Student Info ----------------
    const student: any = await studentmodel
      .findById(studentId)
      .populate("parentId");
    //------ Payment Info ----------------
    const payment: any = await paymentmodel.findOne({
      _id: paymentId,
      status: "paid",
    });
    // const logoImg = path.join(__dirname, '../../assets/images', 'logo.jpg')
    const logoImg = "http://143.110.242.57/INT-Emerge2/logo.jpg";
    const htmlFile: any = await ejs.renderFile(
      path.join(__dirname, "../../assets/pdf/", "payment_receipt_voucher.ejs"),
      {
        logoImg: logoImg,
        name: student.name,
        email: student.parentId.email,
        address: student.parentId.address,
        invoiceNo: payment.invoiceNo,
        receiptNo: payment.receiptNo,
        planTax: payment.planTax,
        setupFee: payment.setupFee,
        setupTax: payment.setupTax,
        discount: payment.discount,
        planQty: payment.planQty,
        setupQty: payment.setupQty,
        planTotalAmount: payment.planTotalAmount,
        setupTotalAmount: payment.setupTotalAmount,
        subTotal: payment.subTotal,
        discountTotalAmount: payment.discountTotalAmount,
        taxTotalAmount: payment.taxTotalAmount,
        payableAmount: payment.payableAmount,
        cardType: toTitleCase(payment.cardType),
        last4: payment.last4,
        planAmount: payment.amount,
        discountText: toTitleCase(numberToText(payment.discount)),
        payMethod: payment.payMethod,
        paymentDate: moment(payment.date).format("LL"),
      }
    );
    const pdfBuffer = await generatePDF.create(htmlFile);

    if (sendEmail) {
      await mail.send({
        from: "anumita.banerjee@indusnet.co.in",
        to: "sourabhnil.das@indusnet.co.in",
        subject: "Payment Confirmation",
        htmlBody:
          "Attached to this email, you will find your official receipt for your reference. Please keep this receipt for future correspondence and reimbursement purposes.",
        attachments: [
          {
            Name: payment.payId + ".pdf",
            Content: pdfBuffer.toString("base64"),
            ContentType: "application/pdf",
          },
        ],
      });
    } else {
      return pdfBuffer;
    }
  } catch (error) {
    console.log("Html error", error);
  }
}

export const generateReceiptVoucherPdf =  paymentReceiptVoucher

async function calculatePayableAmount(amount: number) {
  try {
    const feeConfig: any = await feeConfigModel.findOne({ isActive: true });
    const planTax = feeConfig.planTax ? feeConfig.planTax : 0;
    const planQty = 1;
    const planTotalAmount = amount * planQty;
    const planTotalTaxAmount = Number(percentage(planTax, planTotalAmount));

    const setupFee = feeConfig.setupFee ? feeConfig.setupFee : 0;
    const setupQty = 1;
    const setupTax = feeConfig.setupTax ? feeConfig.setupTax : 0;
    const setupTotalAmount = setupFee * setupQty;
    const setupTotalTaxAmount = Number(percentage(setupTax, setupTotalAmount));

    const subTotal = planTotalAmount + setupTotalAmount;

    const discount = feeConfig.discount ? feeConfig.discount : 0;
    const discountTotalAmount = Number(percentage(discount, subTotal));

    const taxTotalAmount = Number(
      percentage(planTax, subTotal - discountTotalAmount)
    );

    const payableAmount = Number(
      subTotal - discountTotalAmount + taxTotalAmount
    );

    console.log({
      planTax,
      planQty,
      planTotalAmount,
      planTotalTaxAmount,
      setupFee,
      setupQty,
      setupTax,
      setupTotalAmount,
      setupTotalTaxAmount,
      subTotal,
      discount,
      discountTotalAmount,
      taxTotalAmount,
      payableAmount,
    });
    return {
      planTax,
      planQty,
      planTotalAmount,
      planTotalTaxAmount,
      setupFee,
      setupQty,
      setupTax,
      setupTotalAmount,
      setupTotalTaxAmount,
      subTotal,
      discount,
      discountTotalAmount,
      taxTotalAmount,
      payableAmount,
    };
  } catch (error) {
    console.log("Html error", error);
  }
}

function percentage(percent: number, total: number) {
  return ((percent / 100) * total).toFixed(2);
}

function numberToText(number: number): string {
  const units: string[] = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const teens: string[] = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens: string[] = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  if (number === 0) {
    return "zero";
  }

  function convertBelowThousand(n: number): string {
    let result = "";

    if (n >= 100) {
      result += units[Math.floor(n / 100)] + " hundred ";
      n %= 100;
    }

    if (n >= 10 && n < 20) {
      result += teens[n - 10];
    } else {
      result += tens[Math.floor(n / 10)] + " ";
      n %= 10;
      result += units[n];
    }

    return result.trim();
  }

  let result = "";

  if (number < 0) {
    result = "minus ";
    number = Math.abs(number);
  }

  if (number >= 1e12) {
    result += convertBelowThousand(Math.floor(number / 1e12)) + " trillion ";
    number %= 1e12;
  }

  if (number >= 1e9) {
    result += convertBelowThousand(Math.floor(number / 1e9)) + " billion ";
    number %= 1e9;
  }

  if (number >= 1e6) {
    result += convertBelowThousand(Math.floor(number / 1e6)) + " million ";
    number %= 1e6;
  }

  if (number >= 1e3) {
    result += convertBelowThousand(Math.floor(number / 1e3)) + " thousand ";
    number %= 1e3;
  }

  result += convertBelowThousand(number);

  return result.trim();
}

function toTitleCase(inputString: string): string {
  if (!inputString) {
    return "";
  }

  return inputString
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, (match) => match.toUpperCase());
}
