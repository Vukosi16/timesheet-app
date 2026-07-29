import { Request, Response } from "express";
import prisma from "../lib/prisma";

const createEntry = async(req: Request, res: Response) => {
    try{
        const userId = req.userInfo?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated user" });
        }

        const timesheetId = Number(req.params.timesheetId);
        const timesheet = await prisma.timesheet.findUnique({ where: { id: timesheetId } })
        
        if (!timesheet) {
            return res.status(404).json({ message: "Timesheet not found" });
        }

        if (timesheet.stage !== 'STAGING'){
            return res.status(403).json({ message: "Cannot add an entry to timesheet" });

        }

        const {date, activityType, description } = req.body;
        
        if (timesheet.userId !== userId){
            return res.status(403).json({
                message: "Unauthorised user"
            })
        }

        let amount;

        if (activityType === 'MISC'){
            amount = req.body.amount;
            if(!amount){
                return res.status(400).json({
                    message: "Amount not entered" 
                })
            }
        }else{
            const activity = await prisma.lookupActivity.findUnique({ where: { activity: activityType } });
            amount = activity?.price;
        }

        const entry = await prisma.timesheetEntry.create({ data: { timesheetId, date: new Date(date), activityType, amount, description } })
        res.status(201).json({
            message: "Timesheet entry created",
            entry
        })


   }catch(e){
        console.log(e);
        res.status(500).json({
            error: `${e}`,
            message : "Couldn't create a timesheet. Something went wrong"
        })
   }

}

const editEntry = async(req: Request, res: Response) => {
    try {
        const userId = req.userInfo?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated user" });
        }

        const timesheetId = Number(req.params.timesheetId);
        const timesheet = await prisma.timesheet.findUnique({ where: { id: timesheetId } })
        
        if (!timesheet) {
            return res.status(404).json({ message: "Timesheet not found" });
        }

        if (timesheet.userId !== userId){
            return res.status(403).json({
                message: "Unauthorised user"
            })
        }

        if (timesheet.stage !== 'STAGING'){
            return res.status(403).json({ message: "Cannot add an entry to timesheet" });

        }

        const entryId = Number(req.params.entryId);

        const timesheetEntry = await prisma.timesheetEntry.findUnique({ where: { id: entryId } })
        if (!timesheetEntry){
            return res.status(404).json({
                message: "Entry not found"
            })
        }

        if (timesheetEntry.timesheetId !== timesheetId){
            return res.status(403).json({
                message: "Entry doesn't belong to timesheet"
            })
        }

        const { date, description } = req.body;
        const updatedEntry = await prisma.timesheetEntry.update({ where: { id: entryId }, data: { date: new Date(date), description } })

        res.status(200).json({
            message: "Entry Updated",
            updatedEntry
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
    createEntry,
    editEntry
}