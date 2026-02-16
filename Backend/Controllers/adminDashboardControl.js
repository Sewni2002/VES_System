const {
  Student,
  Y01_Sem01Stud,
  Y01_Sem02Stud,
  Y02_Sem01Stud,
  Y02_Sem02Stud,
  Y03_Sem01Stud,
  Y03_Sem02Stud,
} = require("../Model/Student");

const Scheduler = require("../Model/Scheduler");
const Instructor = require("../Model/Instructor"); //  Import Instructor model
const Submission = require("../Model/StudentSubmission");
exports.getDashboardData = async (req, res) => {
  try {
    // 📊 Student counts
    const totalStudents = await Student.countDocuments();

    const semesterCounts = {
      Y01_Sem01: await Y01_Sem01Stud.countDocuments(),
      Y01_Sem02: await Y01_Sem02Stud.countDocuments(),
      Y02_Sem01: await Y02_Sem01Stud.countDocuments(),
      Y02_Sem02: await Y02_Sem02Stud.countDocuments(),
      Y03_Sem01: await Y03_Sem01Stud.countDocuments(),
      Y03_Sem02: await Y03_Sem02Stud.countDocuments(),
    };

    // Instructor count
    const totalInstructors = await Instructor.countDocuments();

    const Totalsubmissions = await Submission.countDocuments();
    // cheduler stats
    const completedSessions = await Scheduler.countDocuments({ completed: true });
    const notCompletedSessions = await Scheduler.countDocuments({ completed: false });

    //Status summary (Dean approvals)
    const statusCounts = {
      pending: await Scheduler.countDocuments({ status: "Pending" }),
      accepted: await Scheduler.countDocuments({ status: "Accepted" }),
      rejected: await Scheduler.countDocuments({ status: "Rejected" }),
    };

    // 🗓️ Upcoming schedules (future sessions)
    const currentDate = new Date();
    const upcomingSchedules = await Scheduler.find({
      scheduledDateTime: { $gte: currentDate },
    })
      .select("sessionId instructorId groupId scheduledDateTime")
      .sort({ scheduledDateTime: 1 })
      .limit(10);

    // ✅ Send response
    res.status(200).json({
      totalStudents,
      totalInstructors, 
      semesterCounts,
      completedSessions,
      notCompletedSessions,
      statusCounts,
      Totalsubmissions,
      upcomingSchedules,
    });
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};
