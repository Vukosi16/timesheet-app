import express from 'express';
import authRoute from './Routes/authRoutes';
import timesheetRoute from './Routes/timesheetRoutes';
import entryRoute from './Routes/entryRoutes'
import cookieParser from 'cookie-parser';


const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = 3000;


app.use('/auth', authRoute);
app.use('/timesheet', timesheetRoute);
app.use('/entry', entryRoute)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});