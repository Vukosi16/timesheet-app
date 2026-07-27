import express from 'express';
import authRoute from './Routes/authRoutes';
import cookieParser from 'cookie-parser';


const app = express();
app.use(express.json());
app.use(cookieParser());
const PORT = 3000;

app.get('/', (req, res) => {
  res.json({
    message: "Working"
  })
})
app.use('/auth', authRoute)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});