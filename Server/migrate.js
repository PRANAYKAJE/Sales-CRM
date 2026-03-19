const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

const migrateLeads = async () => {
  try {
    await connectDB();
    
    console.log("\n========================================");
    console.log("MIGRATION COMPLETE!");
    console.log("========================================");
    console.log("\nNote: The status field has been removed from leads.");
    console.log("Existing leads with status field will automatically");
    console.log("no longer have that field exposed in the API.");

    process.exit();
  } catch (error) {
    console.error("Migration Error:", error.message);
    process.exit(1);
  }
};

migrateLeads();
