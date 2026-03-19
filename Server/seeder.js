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
  { name: "John Smith", email: "john@crm.com", role: "sales" },
  { name: "Sarah Johnson", email: "sarah@crm.com", role: "sales" },
  { name: "Mike Wilson", email: "mike@crm.com", role: "sales" },
  { name: "Emily Davis", email: "emily@crm.com", role: "sales" },
  { name: "David Chen", email: "david@crm.com", role: "sales" },
  { name: "Jessica Brown", email: "jessica@crm.com", role: "sales" },
];

const leadsData = [
  { name: "Robert Chen", email: "robert.chen@techcorp.com", company: "TechCorp Inc", phone: "555-0101" },
  { name: "Lisa Anderson", email: "lisa@globex.io", company: "Globex Solutions", phone: "555-0102" },
  { name: "James Wilson", email: "jwilson@soylent.co", company: "Soylent Corp", phone: "555-0103" },
  { name: "Maria Garcia", email: "maria.g@initech.com", company: "Initech LLC", phone: "555-0104" },
  { name: "David Brown", email: "david.brown@umbrella.net", company: "Umbrella Corp", phone: "555-0105" },
  { name: "Jennifer Taylor", email: "jtaylor@acme.com", company: "Acme Industries", phone: "555-0106" },
  { name: "Michael Lee", email: "m.lee@startup.io", company: "Startup Labs", phone: "555-0107" },
  { name: "Amanda White", email: "awhite@enterprise.com", company: "Enterprise Solutions", phone: "555-0108" },
  { name: "Chris Martinez", email: "cmartinez@fintech.co", company: "FinTech Partners", phone: "555-0109" },
  { name: "Rachel Green", email: "rachel.green@retail.com", company: "Retail Dynamics", phone: "555-0110" },
  { name: "Kevin Thompson", email: "kthompson@media.com", company: "Media Group Inc", phone: "555-0111" },
  { name: "Nicole Brown", email: "nbrown@healthtech.io", company: "HealthTech Systems", phone: "555-0112" },
  { name: "Daniel Kim", email: "dkim@cloudtech.com", company: "CloudTech Systems", phone: "555-0113" },
  { name: "Sophia Martinez", email: "smartinez@dataflow.com", company: "DataFlow Analytics", phone: "555-0114" },
  { name: "Andrew Parker", email: "aparker@nexgen.com", company: "NexGen Industries", phone: "555-0115" },
  { name: "Emma Rodriguez", email: "erodriguez@innovate.com", company: "Innovate Tech", phone: "555-0116" },
  { name: "Ryan Cooper", email: "rcooper@digital.com", company: "Digital Solutions", phone: "555-0117" },
  { name: "Olivia Harris", email: "oharris@smartbiz.com", company: "SmartBiz Inc", phone: "555-0118" },
];

const dealsData = [
  { title: "Enterprise License Deal", value: 50000, stage: "Negotiation" },
  { title: "Starter Package", value: 2500, stage: "Won" },
  { title: "Annual Subscription", value: 12000, stage: "Prospect" },
  { title: "Custom Integration", value: 35000, stage: "Negotiation" },
  { title: "Premium Support", value: 8000, stage: "Won" },
  { title: "Basic Plan", value: 1500, stage: "Lost" },
  { title: "Team License", value: 18000, stage: "Prospect" },
  { title: "Consulting Services", value: 25000, stage: "Negotiation" },
  { title: "Platform Access", value: 5000, stage: "Won" },
  { title: "Training Package", value: 3500, stage: "Lost" },
  { title: "Migration Project", value: 45000, stage: "Prospect" },
  { title: "API Integration", value: 15000, stage: "Negotiation" },
  { title: "White-label Solution", value: 75000, stage: "Won" },
  { title: "Pilot Program", value: 5000, stage: "Lost" },
  { title: "Cloud Deployment", value: 22000, stage: "Prospect" },
  { title: "Security Audit", value: 12000, stage: "Won" },
  { title: "Data Analytics Suite", value: 35000, stage: "Negotiation" },
  { title: "CRM Implementation", value: 28000, stage: "Prospect" },
  { title: "Mobile App Development", value: 65000, stage: "Negotiation" },
  { title: "Automation Tools", value: 15000, stage: "Won" },
  { title: "E-commerce Platform", value: 42000, stage: "Prospect" },
  { title: "Support Contract", value: 9000, stage: "Won" },
  { title: "Custom Dashboard", value: 18000, stage: "Negotiation" },
  { title: "AI Integration", value: 85000, stage: "Prospect" },
  { title: "Quarterly Maintenance", value: 12000, stage: "Won" },
  { title: "Infrastructure Upgrade", value: 55000, stage: "Negotiation" },
  { title: "Performance Optimization", value: 20000, stage: "Lost" },
  { title: "DevOps Services", value: 35000, stage: "Won" },
  { title: "Training Program", value: 8000, stage: "Prospect" },
  { title: "Data Migration", value: 25000, stage: "Negotiation" },
  { title: "SaaS License", value: 45000, stage: "Won" },
  { title: "Consulting Hours", value: 15000, stage: "Lost" },
  { title: "Custom Features", value: 30000, stage: "Prospect" },
  { title: "Annual Renewal", value: 22000, stage: "Won" },
  { title: "Scalability Package", value: 40000, stage: "Negotiation" },
  { title: "Reporting Module", value: 12000, stage: "Won" },
  { title: "UI/UX Overhaul", value: 55000, stage: "Prospect" },
  { title: "API Access Tier", value: 8500, stage: "Won" },
  { title: "Multi-tenant Setup", value: 60000, stage: "Negotiation" },
  { title: "Legacy System Upgrade", value: 95000, stage: "Prospect" },
  { title: "Compliance Package", value: 35000, stage: "Won" },
  { title: "Disaster Recovery", value: 45000, stage: "Negotiation" },
  { title: "Onboarding Services", value: 10000, stage: "Won" },
  { title: "Extended Warranty", value: 7500, stage: "Lost" },
  { title: "Premium SLA", value: 25000, stage: "Prospect" },
  { title: "Database Optimization", value: 18000, stage: "Won" },
  { title: "Real-time Analytics", value: 38000, stage: "Negotiation" },
  { title: "IoT Integration", value: 72000, stage: "Prospect" },
];

const activitiesData = [
  { type: "Call", description: "Initial discovery call - discussed pain points and requirements" },
  { type: "Meeting", description: "Product demo presentation to the technical team" },
  { type: "Note", description: "Budget approval expected by end of month" },
  { type: "Follow-up", description: "Send pricing proposal and case studies" },
  { type: "Call", description: "Follow-up call to discuss proposal questions" },
  { type: "Meeting", description: "Executive meeting with C-level stakeholders" },
  { type: "Note", description: "Competitor comparison requested - preparing analysis" },
  { type: "Follow-up", description: "Schedule technical deep-dive session" },
  { type: "Call", description: "Contract negotiation discussion" },
  { type: "Meeting", description: "Contract review and signing meeting" },
  { type: "Note", description: "Legal review completed, minor changes requested" },
  { type: "Follow-up", description: "Implementation planning call scheduled" },
  { type: "Call", description: "Quarterly business review" },
  { type: "Meeting", description: "Partnership expansion discussion" },
  { type: "Note", description: "Requested additional features - logged for roadmap" },
  { type: "Follow-up", description: "Schedule renewal discussion for next quarter" },
  { type: "Call", description: "Support escalation - resolved connectivity issue" },
  { type: "Meeting", description: "Onboarding session for new team members" },
  { type: "Note", description: "Customer satisfaction survey - NPS score 9/10" },
  { type: "Follow-up", description: "Send reference customer contact info" },
  { type: "Call", description: "Demo walkthrough with product team" },
  { type: "Meeting", description: "Strategic planning session" },
  { type: "Note", description: "Technical requirements documented" },
  { type: "Follow-up", description: "Send technical specification document" },
  { type: "Call", description: "Budget discussion with finance team" },
  { type: "Meeting", description: "Security compliance review" },
  { type: "Note", description: "Integration timeline agreed" },
  { type: "Follow-up", description: "Schedule kickoff meeting" },
  { type: "Call", description: "Pricing negotiation call" },
  { type: "Meeting", description: "Final presentation to board" },
  { type: "Note", description: "ROI analysis completed" },
  { type: "Follow-up", description: "Send contract for signature" },
  { type: "Call", description: "Check-in call - project on track" },
  { type: "Meeting", description: "Milestone review meeting" },
  { type: "Note", description: "Training materials prepared" },
  { type: "Follow-up", description: "Schedule user training sessions" },
  { type: "Call", description: "Issue resolution follow-up" },
  { type: "Meeting", description: "Success planning session" },
  { type: "Note", description: "Expansion opportunity identified" },
  { type: "Follow-up", description: "Prepare upgrade proposal" },
  { type: "Call", description: "Performance review discussion" },
  { type: "Meeting", description: "Annual contract renewal meeting" },
  { type: "Note", description: "Feature requests documented" },
  { type: "Follow-up", description: "Connect with technical lead" },
  { type: "Call", description: "Stakeholder introduction call" },
  { type: "Meeting", description: "Requirements gathering session" },
  { type: "Note", description: "Project scope defined" },
  { type: "Follow-up", description: "Send project proposal" },
  { type: "Call", description: "Proof of concept demonstration" },
  { type: "Meeting", description: "Implementation review" },
  { type: "Note", description: "Change request logged" },
  { type: "Follow-up", description: "Confirm go-live date" },
];

const importData = async () => {
  try {
    await connectDB();

    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Lead.deleteMany({});
    await Deal.deleteMany({});
    await Activity.deleteMany({});

    console.log("\n========================================");
    console.log("CREATING USERS");
    console.log("========================================");
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
      console.log(`  ✓ ${user.name} (${user.role})`);
    }

    const salesUsers = createdUsers.filter(user => user.role === "sales");
    console.log(`\nTotal users: ${createdUsers.length} (1 Admin, ${salesUsers.length} Sales)`);

    console.log("\n========================================");
    console.log("CREATING LEADS");
    console.log("========================================");
    const createdLeads = [];

    for (let i = 0; i < leadsData.length; i++) {
      const leadData = leadsData[i];
      const assignedUser = salesUsers[i % salesUsers.length];
      
      const lead = await Lead.create({
        ...leadData,
        assignedTo: assignedUser._id,
      });

      createdLeads.push(lead);
      console.log(`  ✓ ${lead.name} @ ${lead.company} - Assigned: ${assignedUser.name}`);
    }
    console.log(`\nTotal leads: ${createdLeads.length}`);

    console.log("\n========================================");
    console.log("CREATING DEALS (2-3 per lead)");
    console.log("========================================");
    const createdDeals = [];
    const dealStageCycle = ["Prospect", "Negotiation", "Won", "Lost"];

    for (let leadIndex = 0; leadIndex < createdLeads.length; leadIndex++) {
      const lead = createdLeads[leadIndex];
      const numDeals = Math.floor(Math.random() * 2) + 2;
      
      for (let d = 0; d < numDeals; d++) {
        const baseDeal = dealsData[(leadIndex * 2 + d) % dealsData.length];
        const deal = await Deal.create({
          title: baseDeal.title,
          value: baseDeal.value + Math.floor(Math.random() * 10000) - 5000,
          stage: dealStageCycle[(leadIndex + d) % dealStageCycle.length],
          leadId: lead._id,
        });

        createdDeals.push(deal);
        console.log(`  ✓ "${deal.title}" - $${deal.value.toLocaleString()} (${deal.stage})`);
      }
    }
    console.log(`\nTotal deals: ${createdDeals.length} (avg ${(createdDeals.length / createdLeads.length).toFixed(1)} per lead)`);

    console.log("\n========================================");
    console.log("CREATING ACTIVITIES (3-5 per lead)");
    console.log("========================================");
    const createdActivities = [];
    const activityTypeCycle = ["Call", "Meeting", "Note", "Follow-up"];

    for (let i = 0; i < createdLeads.length; i++) {
      const lead = createdLeads[i];
      const assignedUser = salesUsers[i % salesUsers.length];
      const numActivities = Math.floor(Math.random() * 3) + 3;

      for (let a = 0; a < numActivities; a++) {
        const activityData = activitiesData[(i * 3 + a) % activitiesData.length];
        
        const activity = await Activity.create({
          leadId: lead._id,
          userId: assignedUser._id,
          type: activityTypeCycle[(i + a) % activityTypeCycle.length],
          description: activityData.description,
        });

        createdActivities.push(activity);
      }
      console.log(`  ✓ ${numActivities} activities created for ${lead.name}`);
    }
    console.log(`\nTotal activities: ${createdActivities.length}`);

    const totalValue = createdDeals.reduce((sum, d) => sum + d.value, 0);
    const wonDeals = createdDeals.filter(d => d.stage === "Won");
    const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);

    console.log("\n========================================");
    console.log("SEEDING COMPLETE!");
    console.log("========================================");
    console.log("\n📊 DASHBOARD SUMMARY:");
    console.log(`   Total Users: ${createdUsers.length}`);
    console.log(`   Sales Users: ${salesUsers.length}`);
    console.log(`   Total Leads: ${createdLeads.length}`);
    console.log(`   Total Deals: ${createdDeals.length}`);
    console.log(`   Total Activities: ${createdActivities.length}`);
    console.log(`   Total Pipeline Value: $${totalValue.toLocaleString()}`);
    console.log(`   Won Deals: ${wonDeals.length} ($${wonValue.toLocaleString()})`);
    
    console.log("\n🔐 LOGIN CREDENTIALS:");
    console.log("   Admin:  admin@crm.com / Admin@123");
    salesUsers.forEach(u => {
      console.log(`   Sales:  ${u.email} / User@123`);
    });
    console.log("========================================");

    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error.message);
    console.error(error.stack);
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

    console.log("All Data Destroyed Successfully!");
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
