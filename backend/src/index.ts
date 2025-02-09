import express from "express";
import bodyParser from "body-parser";
import {connectToDB} from "./utils/db";
import userRoute from "./route/user";
// import bookingRoute from "./route/dustbin";
import dustbinRoute from "./route/dustbin";
import truckRoute from "./route/truck";
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

app.use("/truck",truckRoute);
app.use("/",dustbinRoute);

app.get('/center/:location', async (req, res) => {
    const { location } = req.params;
  
    try {
      // Query the database for recycling centers with the given location
      const centers = await prisma.recycling_centers.findMany({
        where: {
          location: location,
        },
      });
  
      if (centers.length === 0) {
        return res.status(404).json({ message: "No centers found for the given location." });
      }
  
      res.status(200).json({
        message: "Recycling centers fetched successfully.",
        data: centers,
      });
    } catch (error) {
      console.error("Error fetching recycling centers:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });
  


connectToDB();

// initialize MySql tables if they don't exist in database
// createTables();


const PORT = process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`server is running on Port ${PORT}`);
}) 