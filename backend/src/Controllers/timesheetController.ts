import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ParamsDictionary } from 'express-serve-static-core';

const createTimesheet = async(req: Request, res: Response) => {
    try{
        const userId = req.userInfo?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated user" });
        }

        const existingStaging = await prisma.timesheet.findFirst({
            where: { userId, stage: 'STAGING'}
        });

        if (existingStaging) {
            return res.status(409).json({
                message: "You already have an unsubmitted timesheet."
            })
        }

        const {periodMonth} = req.body;
        const inputDate = new Date(periodMonth);
        const normalizedPeriod = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);



        let newTimesheet;

        try {
            newTimesheet = await prisma.timesheet.create({ data: {  userId: userId,periodMonth: normalizedPeriod} })
        } catch (e: any) {
            if (e.code === 'P2002') { // Prisma's error code for unique constraint violations
                return res.status(409).json({ message: "A timesheet already exists for this month" });
            }
        }

        
        return res.status(201).json({
            message: `Time sheet the the month of ${inputDate.getMonth() + 1} has been created.`,
            newTimesheet
        })

    }catch(e){ 
        console.log(e);
        res.status(500).json({
            error: `${e}`,
            message : "Couldn't create a timesheet. Something went wrong"
        })
    }

}

const deleteTimesheet = async(req: Request, res: Response) => {
    try {
        const userId = req.userInfo?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated user" });
        }

        const timesheetId = Number(req.params.timesheetId);//tko

        const timesheet = await prisma.timesheet.findUnique({ where: { id: timesheetId } })
        if (!timesheet) {
            return res.status(404).json({ message: "Timesheet not found" });
        }

        if (timesheet.userId !== userId || timesheet.stage !== 'STAGING') {
            return res.status(403).json({ message: "Cannot delete this timesheet" });
        }
        const deletedTimesheet = await prisma.timesheet.delete({where: {id: timesheetId}})
        
        return res.status(200).json({
            message: "Timesheet deleted",
            deletedTimesheet
        })


    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: `${e}`,
            message : "Couldn't create a timesheet. Something went wrong"
        })
    }
}

const getCoachTimesheets = async(req: Request, res: Response) => {
    try {
        const userId = req.userInfo?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated user" });
        }

        const timesheets = await prisma.timesheet.findMany({ where: { userId }, include: { timesheetEntry: true } });
        if (!timesheets){
            return res.status(404).json({ message: "Timesheets not found" });
        }

        return res.status(200).json({
            message: "Timesheets retrieved",
            timesheets
         })


    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: `${e}`,
            message : "Couldn't create a timesheet. Something went wrong"
        })
    }
}

const getTimesheetById = async(req: Request, res: Response) => {
    try {
        const userId = req.userInfo?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated user" });
        }

        const timesheetId = Number(req.params.timesheetId);//tko
        const timesheet = await prisma.timesheet.findUnique({ where: { id: timesheetId }, include: { timesheetEntry: true } })

        if (!timesheet){
            return res.status(404).json({ message: "Timesheet not found" });
        }  
        
        if (timesheet.userId !== userId) {
            return res.status(403).json({ message: "Cannot view this timesheet" });
        }

        return res.status(200).json({
            message: "Timesheets retrieved",
            timesheet
         })


    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: `${e}`,
            message : "Couldn't create a timesheet. Something went wrong"
        })
    }
}

const submitTimesheet = async(req: Request, res: Response) => {
    try {
        const userId = req.userInfo?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated user" });
        }

        const timesheetId = Number(req.params.timesheetId);//tko
        const timesheet = await prisma.timesheet.findUnique({ where: { id: timesheetId }, include: { timesheetEntry: true } })

         if (!timesheet){
            return res.status(404).json({ message: "Timesheet not found" });
        }  
        

        if (timesheet.userId !== userId) {
            return res.status(403).json({ message: "This is not your timesheet" });
        }

        if (timesheet.stage !== "STAGING") {
            return res.status(403).json({ message: "Timesheet has already been submitted" });
        }

        if (timesheet.timesheetEntry.length === 0) {
            return res.status(403).json({ message: "Cannot submit an empty timesheet" });
        }

        const submitedTimesheet = await prisma.timesheet.update({ where: { id:timesheetId }, data: { stage: 'SUBMITTED', submittedDate: new Date() } })

        res.status(200).json({
            message: "Timesheet submited",
            submitedTimesheet
        })


    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: `${e}`,
            message : "Couldn't create a timesheet. Something went wrong"
        })
    }
}

const getSubmittedTimesheets = async (req: Request, res: Response) => {
    try {
        const userId = req.userInfo?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated user" });
        }

        const timesheets = await prisma.timesheet.findMany({
            where: { stage: 'SUBMITTED' },
            include: { timesheetEntry: true }
        });

        res.status(200).json({
            message: "Timesheets retireved",
            timesheets
        })

    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: `${e}`,
            message : "Couldn't create a timesheet. Something went wrong"
        })
    }

}

interface ReviewBody {
  decision: "APPROVE" | "REJECT";
  adminMessage?: string;
}

interface ReviewParams extends ParamsDictionary {
  id: string;
}

const reviewTimesheet = async(req: Request<ReviewParams, {}, ReviewBody, {}>, res: Response) => {
   try {
        const timesheetId = Number(req.params.timesheetId);
        const { decision, adminMessage } = req.body;

        const timesheet = await prisma.timesheet.findUnique({ where: { id: timesheetId }, include: { timesheetEntry: true } })
        if (!timesheet){
            return res.status(404).json({ message: "Timesheet not found" });
        }  

        if (timesheet.stage !== "SUBMITTED") {
            return res.status(403).json({ message: "Timesheet has not been submitted" });
        }

         if (decision !== "APPROVE" && decision !== "REJECT") {
            return res.status(400).json({ message: "Invalid decision value" });
        }

        let newTimesheet;
        if (decision === "APPROVE"){
            newTimesheet = await prisma.timesheet.update({ where: { id:timesheetId }, data: { stage: 'APPROVED'} })
            return res.status(200).json({
                message: "Timesheet approved",
                newTimesheet
            })
        }

        if (decision === "REJECT"){
            newTimesheet = await prisma.timesheet.update({ where: { id:timesheetId }, data: { stage: 'STAGING', adminMessage} })
            return res.status(200).json({
                message: "Timesheet rejected",
                adminMessage: adminMessage,
                newTimesheet
            })
        }

       

   } catch (e) {
        console.log(e);
        res.status(500).json({
            error: `${e}`,
            message : "Couldn't create a timesheet. Something went wrong"
        })
   }

}

const markPaid = async(req: Request, res: Response) => {
    try {
        const timesheetId = Number(req.params.timesheetId);

        const timesheet = await prisma.timesheet.findUnique({ where: { id: timesheetId }, include: { timesheetEntry: true } })
        if (!timesheet){
            return res.status(404).json({ message: "Timesheet not found" });
        }  

        if (timesheet.stage !== "APPROVED") {
            return res.status(403).json({ message: "Timesheet must be approved before it can be marked as paid" });
        }

        const newTimesheet =  await prisma.timesheet.update({ where: { id:timesheetId }, data: { paid: true} })
        return res.status(200).json({
            message: "Marked as paid",
            newTimesheet
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: `${e}`,
            message : "Couldn't create a timesheet. Something went wrong"
        })
    }
}



export default {
    createTimesheet,
    deleteTimesheet,
    getCoachTimesheets,
    getTimesheetById,
    submitTimesheet,
    getSubmittedTimesheets,
    reviewTimesheet,
    markPaid
}