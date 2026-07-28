import express from 'express';
import authRoute from './Routes/authRoutes';
import timesheetRoute from './Routes/timesheetRoutes';
import cookieParser from 'cookie-parser';


const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = 3000;


app.use('/auth', authRoute);
app.use('/timesheet', timesheetRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});