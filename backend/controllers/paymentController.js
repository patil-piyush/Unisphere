// const Event = require("../models/Event");
// const EventRegistration = require("../models/EventRegistration");
// const SeatReservation = require("../models/SeatReservation");
// const Payment = require("../models/Payment");
// const crypto = require("crypto");

// const Razorpay = require("razorpay");
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY,
//   key_secret: process.env.RAZORPAY_SECRET
// });

// // Create order + atomic seat lock
// const createPaymentOrder = async (req, res) => {
//   const userId = req.userId;

//   try {
//     const { eventId } = req.params;
//     const user = req.user;
//     const isFree = user.email.endsWith("@pccoepune.org");

//     const event = await Event.findById(eventId);
//     if (!event || event.isClosed || event.registeredCount >= event.max_capacity) {
//       return res.status(400).json({ message: "Event closed or full" });
//     }

//     if (isFree) {
//       await Event.findOneAndUpdate(
//         { _id: eventId, isClosed: false, registeredCount: { $lt: event.max_capacity } },
//         { $inc: { registeredCount: 1 } }
//       );
//       await EventRegistration.create({ event_id: eventId, user_id: userId });
//       await Payment.create({ event_id: eventId, user_id: userId, amount: 0, status: "success", transaction_id: "FREE_DOMAIN_REG" });

//       return res.status(200).json({ message: "Free event registered" });
//     }

//     const updatedEvent = await Event.findOneAndUpdate(
//       { _id: eventId, isClosed: false, registeredCount: { $lt: event.max_capacity } },
//       { $inc: { registeredCount: 1 } },
//       { new: true }
//     );
//     if (!updatedEvent) return res.status(400).json({ message: "Event full or closed" });

//     const expires = new Date(Date.now() + 10 * 60 * 1000);
//     await SeatReservation.create({ event_id: eventId, user_id: userId, expiresAt: expires, status: "locked" });

//     const order = await razorpay.orders.create({
//       amount: event.price * 100,
//       currency: "INR",
//       receipt: `PAY_${eventId}_${userId}`
//     });

//     await Payment.create({ event_id: eventId, user_id: userId, amount: event.price, status: "pending", transaction_id: order.id });

//     res.status(200).json({ message: "Order created, seat locked", order });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Verify payment + confirm registration (real provider validation)
// const verifyEventPayment = async (req, res) => {
//   const userId = req.userId;
//   const { eventId } = req.params;
//   const { paymentId, razorpayOrderId, razorpaySignature } = req.body;

//   try {
//     const seat = await SeatReservation.findOne({ event_id: eventId, user_id: userId, status: "locked" });
//     if (!seat) return res.status(410).json({ message: "Seat lock expired or not found" });

//     const payment = await razorpay.payments.fetch(paymentId);
//     if (payment.status !== "captured") {
//       await rollbackSeat(eventId, userId);
//       return res.status(400).json({ message: "Payment not captured, seat released" });
//     }

//     const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
//     hmac.update(razorpayOrderId + "|" + paymentId);
//     const generatedSig = hmac.digest("hex");

//     if (generatedSig !== razorpaySignature) {
//       await rollbackSeat(eventId, userId);
//       return res.status(400).json({ message: "Invalid signature, seat released" });
//     }

//     const updatedEvent = await Event.findOne({ _id: eventId, isClosed: false });
//     if (!updatedEvent) throw new Error("Event closed or invalid");

//     await EventRegistration.create({ event_id: eventId, user_id: userId });
//     await seat.updateOne({ status: "confirmed", expiresAt: new Date(Date.now() + 5000) });
//     await Payment.updateOne({ event_id: eventId, user_id: userId }, { status: "success", transaction_id: paymentId });

//     res.status(200).json({ message: "Payment verified, registration confirmed" });

//   } catch (err) {
//     await rollbackSeat(eventId, userId);
//     res.status(500).json({ message: err.message });
//   }
// };

// // Atomic rollback helper
// const rollbackSeat = async (eventId, userId) => {
//   await Event.updateOne({ _id: eventId }, { $inc: { registeredCount: -1 } });
//   await Payment.updateOne({ event_id: eventId, user_id: userId }, { status: "failed" });
//   await SeatReservation.updateOne({ event_id: eventId, user_id: userId }, { status: "released" });
// };

// module.exports = { createPaymentOrder, verifyEventPayment };
