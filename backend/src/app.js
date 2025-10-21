import e from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = e();

// CORS configuration - simplified and more standard
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3001",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "X-Requested-With",
    ],
  })
);

app.use(e.json({ limit: "16kb" }));

app.use(
  //encode the incoming request(like forms)
  e.urlencoded({
    extended: true, //easier to handle complex data
    limit: "16kb",
  })
);

app.use(e.static("public")); //serve static files in the public folder

app.use(cookieParser()); //helps read cookies from the browser

//import routes
import patientRouter from "./routes/patient.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import adminRouter from "./routes/admin.routes.js";
import authRouter from "./routes/auth.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";
import prescriptionRouter from "./routes/prescription.routes.js";
import vitalsRouter from "./routes/vitals.routes.js";
import medicationLogsRouter from "./routes/medicationLogs.routes.js";
import symptomsRouter from "./routes/symptoms.routes.js";
import adrRouter from "./routes/adr.routes.js";

//routes
app.use("/api/patients", patientRouter); //routes should always start with /
app.use("/api/doctors", doctorRouter);
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/prescriptions", prescriptionRouter);
app.use("/api/vitals", vitalsRouter);
app.use("/api/medicationLogs", medicationLogsRouter);
app.use("/api/symptoms", symptomsRouter);
app.use("/api/adr", adrRouter);

export default app;
