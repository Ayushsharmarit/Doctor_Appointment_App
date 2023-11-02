const express = require('express');
const router = express.Router();
const {createAppointment, updateAppointment, getUserUpcomingAppointments} = require('../controller/appointmentController');
const { authenticateJWT } = require('../middleware/authenticate');

router.get('/upcoming-appointments/:role/:userId', authenticateJWT, getUserUpcomingAppointments);
router.post('/create', authenticateJWT, createAppointment);
router.put('/update/:id', authenticateJWT, updateAppointment);

module.exports = router;
