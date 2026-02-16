const StudentAvailability = require('../Model/StudentAvailability');

const createOrUpdateAvailability = async (req, res) => {
  try {
    const { groupId, groupName, weekStartDate, availability } = req.body;

    console.log("📝 Saving availability for group:", groupId, groupName);

    // Validate required fields
    if (!groupId || !groupName || !weekStartDate) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: groupId, groupName, weekStartDate' 
      });
    }

    // Validate availability structure
    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({ 
        success: false,
        message: 'Availability must be an array' 
      });
    }

    // Find existing availability for this group and week
    const existing = await StudentAvailability.findOne({
      groupId,
      weekStartDate: new Date(weekStartDate)
    });

    if (existing) {
      // Update existing
      existing.availability = availability;
      await existing.save();
      console.log("✅ Updated existing availability");
      res.json({ 
        success: true,
        message: 'Group availability updated successfully', 
        availability: existing 
      });
    } else {
      // Create new
      const newAvailability = new StudentAvailability({
        groupId,
        groupName,
        weekStartDate: new Date(weekStartDate),
        availability
      });
      await newAvailability.save();
      console.log("✅ Created new availability record");
      res.status(201).json({ 
        success: true,
        message: 'Group availability created successfully', 
        availability: newAvailability 
      });
    }
  } catch (error) {
    console.error('❌ Detailed error saving availability:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save availability',
      error: error.message 
    });
  }
};

const getGroupAvailability = async (req, res) => {
  try {
    const { groupId, weekStart } = req.params;
    console.log("📥 Fetching availability for group:", groupId, "week:", weekStart);
    
    const availability = await StudentAvailability.findOne({
      groupId,
      weekStartDate: new Date(weekStart)
    });
    
    console.log("✅ Found availability:", availability ? "Yes" : "No");
    res.json({ 
      success: true,
      data: availability || {} 
    });
  } catch (error) {
    console.error('❌ Error fetching group availability:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch group availability',
      error: error.message 
    });
  }
};

const getAvailabilityByWeek = async (req, res) => {
  try {
    const { weekStart } = req.params;
    const availability = await StudentAvailability.find({
      weekStartDate: new Date(weekStart)
    });
    res.json({ 
      success: true,
      data: availability 
    });
  } catch (error) {
    console.error('Error fetching weekly availability:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch weekly availability',
      error: error.message 
    });
  }
};

const checkTimeSlotAvailability = async (req, res) => {
  try {
    const { groupId, date, startTime, endTime } = req.body;
    
    console.log("🔍 Checking availability for:", { groupId, date, startTime, endTime });

    if (!groupId || !date || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false,
        message: 'groupId, date, startTime, and endTime are required' 
      });
    }

    // Convert date to week start (Monday)
    const scheduleDate = new Date(date);
    const dayOfWeek = scheduleDate.getDay();
    const weekStart = new Date(scheduleDate);
    weekStart.setDate(scheduleDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    
    // Get availability for this week
    const availability = await StudentAvailability.findOne({
      groupId,
      weekStartDate: weekStart
    });

    if (!availability) {
      console.log("ℹ️ No availability data found for group:", groupId);
      return res.json({ 
        success: true,
        available: true, 
        message: 'No availability data found - assuming available' 
      });
    }

    // Find the day in availability
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = days[scheduleDate.getDay()];
    
    const dayAvailability = availability.availability.find(avail => avail.day === targetDay);
    
    if (!dayAvailability) {
      console.log("❌ No availability set for", targetDay);
      return res.json({ 
        success: true,
        available: false, 
        message: `No availability set for ${targetDay}` 
      });
    }

    // Check if the requested time slot is available
    const isAvailable = dayAvailability.timeSlots.some(slot => {
      const slotStart = slot.startTime;
      const slotEnd = slot.endTime;
      
      // Check if time falls within an available slot
      const timeInRange = startTime >= slotStart && endTime <= slotEnd;
      return timeInRange && slot.isAvailable;
    });

    console.log(`⏰ Time slot ${startTime}-${endTime} available:`, isAvailable);

    res.json({ 
      success: true,
      available: isAvailable,
      message: isAvailable ? 'Time slot is available' : 'Time slot is not available'
    });

  } catch (error) {
    console.error('❌ Error checking availability:', error);
    res.status(500).json({ 
      success: false,
      available: false,
      message: 'Error checking availability',
      error: error.message 
    });
  }
};

// Add this function to reset collection if needed
const resetCollection = async (req, res) => {
  try {
    const db = require('mongoose').connection.db;
    
    // Drop the collection
    await db.dropCollection("studentavailabilities");
    console.log("🗑️ studentavailabilities collection dropped");
    
    res.json({ 
      success: true,
      message: "Collection reset successfully" 
    });
    
  } catch (error) {
    console.error("Error resetting collection:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

module.exports = {
  createOrUpdateAvailability,
  getGroupAvailability,
  getAvailabilityByWeek,
  checkTimeSlotAvailability,
  resetCollection
};
