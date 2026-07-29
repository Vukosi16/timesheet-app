import express from 'express';
import authRoute from './Routes/authRoutes';
import timesheetRoute from './Routes/timesheetRoutes';
import entryRoute from './Routes/entryRoutes';
import userRoute from './Routes/userRoutes';
import cookieParser from 'cookie-parser';
import cors from 'cors';


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173', // your frontend's actual dev URL
  credentials: true // REQUIRED — allows cookies (your httpOnly JWT!) to be sent cross-origin
}));

const PORT = 3000;


app.use('/auth', authRoute);
app.use('/timesheet', timesheetRoute);
app.use('/entry', entryRoute);
app.use('/user', userRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});