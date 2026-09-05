import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';


dotenv.config();    //call this function and it will findout .env file and read it 

const app = express();  //call the express function and it return a object that we store in app variable


//Middlewares 
app.use(cors());        // this function use to attach middleware(each request jo server tk aaye wo phle ye function chalao)
app.use(express.json());
app.use(cookieParser());


mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.log('MongoDB connection error:', err));



app.use('/api/auth', authRoutes);



app.get('/', (req, res) => {
    res.send('Server is running!');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


