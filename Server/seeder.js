const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Lead = require("./models/Lead");
const Deal = require("./models/Deal");
const Activity = require("./models/Activity");

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

const users = [
  { name: "Admin Manager", email: "admin@crm.com", role: "admin" },
  { name: "John Sales", email: "john@crm.com", role: "sales" },
  { name: "Sarah Sales", email: "sarah@crm.com", role: "sales" },
];

const leads = [
  { name: "Acme Corp", company: "Acme Corp", status: "New Lead", phone: "555-0101" },
  { name: "Globex Inc", company: "Globex Inc", status: "Contacted", phone: "555-0102" },
  { name: "Soylent Corp", company: "Soylent Corp", status: "Qualified", phone: "555-0103" },
  { name: "Initech", company: "Initech", status: "Proposal", phone: "555-0104" },
  { name: "Umbrella Corp", company: "Umbrella Corp", status: "Won", phone: "555-0105" },
];

const deals = [
  { title: "Enterprise License", value: 5000, stage: "Negotiation" },
  { title: "Basic Plan", value: 500, stage: "Closed" },
  { title: "Consulting Hours", value: 2000, stage: "Prospecting" },
];

const importData = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Lead.deleteMany({});
    await Deal.deleteMany({});
    await Activity.deleteMany({});

    const createdUsers = [];

    for (const userData of users) {
      const salt = await bcrypt.genSalt(10);
      const plainPassword = userData.role === "admin" ? "Admin@123" : "User@123";
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });

      createdUsers.push(user);
    }

    const salesUsers = createdUsers.filter(user => user.role === "sales");

    if (salesUsers.length === 0) {
      throw new Error("No sales users found");
    }

    const createdLeads = [];

    for (const leadData of leads) {
      const randomUser = salesUsers[Math.floor(Math.random() * salesUsers.length)];

      const lead = await Lead.create({
        ...leadData,
        assignedTo: randomUser._id,
      });

      createdLeads.push(lead);
    }

    for (const dealData of deals) {
      const randomLead = createdLeads[Math.floor(Math.random() * createdLeads.length)];

      await Deal.create({
        ...dealData,
        leadId: randomLead._id,
      });
    }

    console.log("Data Imported Successfully!");
    console.log("Admin Login: admin@crm.com / Admin@123");
    console.log("Sales Login: john@crm.com / User@123");

    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error.message);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Lead.deleteMany({});
    await Deal.deleteMany({});
    await Activity.deleteMany({});

    console.log("Data Destroyed!");
    process.exit();
  } catch (error) {
    console.error("Destroy Error:", error.message);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
