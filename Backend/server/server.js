import passport from './config/passport.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import upvoteRoutes from './routes/upvoteRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';


dotenv.config();    //call this function and it will findout .env file and read it 

const app = express();  //call the express function and it return a object that we store in app variable


//Middlewares 
//app.use(cors());        // this function use to attach middleware(each request jo server tk aaye wo phle ye function chalao)
app.use(cors({ 
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());


mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.log('MongoDB connection error:', err));



app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notificatons', notificationRoutes);
app.use('/api/upvotes', upvoteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/feedback', feedbackRoutes);


app.get('/', (req, res) => {
    res.send('Server is running!');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


