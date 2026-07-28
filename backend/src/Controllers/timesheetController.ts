import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { array } from "zod";

const createTimesheet = async(req: Request, res: Response) => {
    try{
        const userId = req.userInfo?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated user" });
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

        const timesheetId: number = Number(req.params.id);

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

        const timesheetId = Number(req.params.id);
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

        const timesheetId = Number(req.params.id);
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



export default  {
    createTimesheet,
    deleteTimesheet,
    getCoachTimesheets,
    getTimesheetById,
    submitTimesheet
}