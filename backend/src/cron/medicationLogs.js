import cron from "node-cron";
import mongoose from "mongoose";
import { createMedicationLogsForCurrentPeriod } from "../services/medicationLogScheduler.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

// Connect to your MongoDB (adjust connection string as per your config)
const MONGODB_URI = process.env.MONGODB_URI;
console.log("mongodb uri: ", MONGODB_URI);

async function main() {
  try {
    await mongoose.connect(`${MONGODB_URI}`);
    console.log("MongoDB connected for cron job.");

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
