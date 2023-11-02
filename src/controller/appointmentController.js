const Appointment = require('../model/appointmentModel');
const { response } = require('../utils/responseService');


async function createAppointment(req, res) {
  try {
    const { patient, doctor, date, reason } = req.body;
    const appointment = new Appointment({ patient, doctor, date, reason });
    await appointment.save();
    return response(res, true, 201, 'Appointment created', appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return response(res, false, 500, 'Failed to create appointment');
  }
}

async function updateAppointment(req, res) {
  try {
    const appointmentId = req.params.id;
    const { date, reason, status } = req.body;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return response(res, false, 404, 'Appointment not found');
    }

    if (date) {
      appointment.date = date;
    }
    if (reason) {
      appointment.reason = reason;
    }
    if (status) {
      appointment.status = status;
    }

    await appointment.save();
    return response(res, true, 200, 'Appointment updated', appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return response(res, false, 500, 'Failed to update appointment');
  }
}

async function getUserUpcomingAppointments(req, res) {
    try {
      const userId = req.params.userId;
      const appointments = await Appointment.find({
        $or: [{ patient: userId }, { doctor: userId }],
        date: { $gte: new Date() },
      }).populate('doctor patient', 'name'); 
      return response(res, true, 200, 'Upcoming appointments for the user', appointments);
    } catch (error) {
      console.error('Error fetching upcoming appointments for the user:', error);
      return response(res, false, 500, 'Failed to fetch upcoming appointments');
    }
  }
module.exports = { createAppointment, updateAppointment, getUserUpcomingAppointments };
