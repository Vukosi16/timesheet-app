import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';;

interface requestBody{
    email: string,
    password: string
}

const login = async (req: Request<{},{},requestBody, {}>, res: Response) => {
    try{
        const {email, password} = req.body;

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user){
            return res.status(401).json({
                message: "No user found"
            })
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch){
            return res.status(401).json({
                message: "PasswordIssue"
            })
        }

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role }, 
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        )

        res.cookie('token', accessToken, { httpOnly: true });
        res.status(200).json({ 
            message: 'Successful login',
        });

    }catch (e){
        console.log(e);
        res.status(500).json({
            error: e,
            message : "Couldn't register, some error occured."
        })
    }
    
}

export default {
    login
};