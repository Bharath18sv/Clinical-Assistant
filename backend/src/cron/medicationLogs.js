import cron from "node-cron";
import mongoose from "mongoose";
import { createMedicationLogsForCurrentPeriod } from "../services/medicationLogScheduler.js";
import dotenv from "dotenv";
import path from "path";
import connectDB from "../db/index.js";

dotenv.config({ path: path.resolve(".env") });  
connectDB();

async function main() {
  try {
    // Schedule job to run every hour at minute 0
    cron.schedule("0 * * * *", async () => {
      console.log("Cron job running: createMedicationLogsForCurrentPeriod");
      try {
        await createMedicationLogsForCurrentPeriod();
      } catch (error) {
        console.error("Error running medication log creation:", error);
      }
    });

    console.log("Cron job scheduled. Waiting...");
  } catch (error) {
    console.error("Failed to connect to MongoDB for cron job:", error);
  }
}

main();
