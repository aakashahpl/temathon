import express from "express";
import bodyParser from "body-parser";
import {connectToDB} from "./utils/db";
import userRoute from "./route/user";
// import bookingRoute from "./route/dustbin";
import dustbinRoute from "./route/dustbin";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

dotenv.config();
const app = express();


const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  };

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get("/test",async(req,res)=>{
    res.send("API working");
})


app.use("/dustbin",dustbinRoute);



connectToDB();

// initialize MySql tables if they don't exist in database
// createTables();


const PORT = process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`server is running on Port ${PORT}`);
}) 