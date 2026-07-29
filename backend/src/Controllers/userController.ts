import { Request, Response } from "express";
import prisma from "../lib/prisma";

const addBankDetails = async(req: Request, res: Response) => {
    try {
        const userId = req.userInfo?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated user" });
        }

        const { bankName, accountType, accountNumber } = req.body;
        const updatedUser = await prisma.user.update({
             where: { id: userId }, 
            data: { bankName, accountType, accountNumber }, 
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                bankName: true,
                accountType: true,
                accountNumber: true
            } 
        })

        return res.status(200).json({
            message: "Banking details added",
            updatedUser
        })

    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: `${e}`,
            message : "Couldn't update a user details. Something went wrong"
        })
    }
}

const getUser = async(req: Request, res: Response) => {
    try {
        const userId = req.userInfo?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated user" });
        }

        const user =  await prisma.user.findUnique({where: { id: userId },
            select : {
                id: true,
                name: true,
                email: true,
                role: true,
                bankName: true,
                accountType:true,
                accountNumber: true,
                timesheets: true
            }
        })
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        return res.status(200).json({
            message: "User found",
            user
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: `${e}`,
            message : "Couldn't fetch user details. Something went wrong"
        })
    }
}

const viewAllCoaches = async(req: Request, res: Response) => {
    try {
        const userId = req.userInfo?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated user" });
        }

        const coaches = await prisma.user.findMany({ where: { role: 'COACH' }, select: { 
            id: true,
                name: true,
                email: true,
                role: true,
                bankName: true,
                accountType:true,
                accountNumber: true,
         } })
         res.status(200).json({
            message: "Coaches are here", 
            coaches
         })

    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: `${e}`,
            message : "Couldn't fetch user details. Something went wrong"
        })
    }
}




export default {
    addBankDetails,
    getUser,
    viewAllCoaches
}