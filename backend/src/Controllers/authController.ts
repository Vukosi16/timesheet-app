import { Role } from '@prisma/client';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
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


interface RegisterBody{
    name: string,
    email: string,
    role: Role
}

const register = async (req: Request<{}, {}, RegisterBody, {}>, res: Response) => {
    try {
        const {name, email, role} = req.body;

        const user = await prisma.user.findUnique({ where: { email } })
        if(user){
            return res.status(409).json({
                error: "User already exists"
            })
        }

        const plainPassword = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

         const newUser = await prisma.user.create({ data: { name, email, role, password: hashedPassword } })

        res.status(201).json({
            message: "User created",
            email: newUser.email,
            tempPassword: plainPassword
        })

    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: `${e}`,
            message : "Couldn't register, some error occured."
        })
    }

    //temp user created details:
    // "message": "User created",
    // "email": "vukosimohlabini@gmail.com",
    // "tempPassword": "91c573216da5c768"


}

export default {
    login,
    register
};