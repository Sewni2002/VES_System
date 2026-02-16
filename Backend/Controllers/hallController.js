const Hall = require('../Model/Hall');

const addHall = async (req, res) => {
  try {
    const { hallNumber } = req.body;

    let hall = await Hall.findOne({ hallNumber });

    if (hall) {
      return res.status(400).json({ message: "Hall already exists" });
    }

    hall = new Hall({ 
      hallNumber,
      isActive: true  // This will automatically set availability through the schema setter
    });

    await hall.save();
    res.status(201).json({ success: true, message: "Hall added successfully", hall });
  } catch (error) {
    console.error('Add hall error:', error);
    res.status(500).json({ message: "Failed to add hall" });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { hallNumber, date } = req.params;
    const hall = await Hall.findOne({ hallNumber });

    if (!hall) return res.status(404).json({ message: "Hall not found" });

    const availableSlots = hall.slots.filter(slot => {
      const slotDateStr = slot.date.toISOString().split('T')[0];
      return slotDateStr === date && !slot.booked;
    });

    res.json({ availableSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching available slots" });
  }
};

const getAllHalls = async (req, res) => {
  try {
    console.log('GET /api/halls - Fetching all halls');
    
    const halls = await Hall.find({}).sort({ hallNumber: 1 });
    console.log('Found halls:', { count: halls.length, halls });

    res.status(200).json({ 
      success: true,
      halls,
      count: halls.length
    });
  } catch (error) {
    console.error('Get all halls error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch halls",
      error: error.message
    });
  }
};

const updateHallStatus = async (req, res) => {
  try {
    const { hallNumber } = req.params;
    const { isActive } = req.body;

    console.log('Received request to update hall status:', { 
      hallNumber, 
      isActive,
      requestBody: req.body
    });

    const hall = await Hall.findOne({ hallNumber });
    
    if (!hall) {
      console.log('Hall not found:', hallNumber);
      return res.status(404).json({ 
        success: false,
        message: "Hall not found" 
      });
    }

    // Update both fields to stay in sync
    hall.isActive = isActive;  // This will automatically update availability through the schema setter
    const updatedHall = await hall.save();

    console.log('Hall updated successfully:', updatedHall);
    res.status(200).json({ 
      success: true, 
      message: `Hall ${hallNumber} ${isActive ? 'enabled' : 'disabled'} successfully`,
      hall: updatedHall
    });
  } catch (error) {
    console.error('Error updating hall status:', error);
    res.status(500).json({ message: "Failed to update hall status" });
  }
};

// const bookSlot = async (req, res) => {
//   try {
//     const { hallNumber, date, startTime, endTime } = req.body;

//     const hall = await Hall.findOne({ hallNumber });
//     if (!hall) return res.status(404).json({ message: "Hall not found" });

//     const slot = hall.slots.find(
//       (s) =>
//         s.date === date &&
//         s.startTime === startTime &&
//         s.endTime === endTime
//     );

//     if (!slot) {
//       return res.status(404).json({ message: "Slot not found" });
//     }

//     if (slot.booked) {
//       return res.status(400).json({ message: "Slot already booked" });
//     }

//     slot.booked = true;

//     const allBooked = hall.slots
//       .filter((s) => s.date === date)
//       .every((s) => s.booked);

//     if (allBooked) hall.availability = false;

//     await hall.save();

//     res.json({ message: "Slot booked successfully", hall });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to book slot" });
//   }
// };

module.exports = { addHall, getAvailableSlots, getAllHalls, updateHallStatus };
