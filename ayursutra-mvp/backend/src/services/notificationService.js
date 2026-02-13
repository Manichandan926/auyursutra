const Notification = require('../models/Notification');
const datastore = require('../data/datastore');

class NotificationService {
  /**
   * Create notification
   */
  createNotification(userId, type, title, message, relatedId = null) {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedId
    });

    datastore.addNotification(notification);
    return notification;
  }

  /**
   * Get user notifications
   */
  getUserNotifications(userId, unreadOnly = false) {
    return datastore.getUserNotifications(userId, unreadOnly);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    return datastore.markNotificationAsRead(notificationId);
  }

  /**
   * Send therapy reminder to patient
   */
  sendTherapyReminder(patientId, therapyId, therapyDetails) {
    const notification = this.createNotification(
      patientId,
      'SESSION_REMINDER',
      'Upcoming Therapy Session',
      `Your next therapy session is scheduled for ${therapyDetails.date}. Room: ${therapyDetails.room}`,
      therapyId
    );
    return notification;
  }

  /**
   * Notify user about leave approval
   */
  notifyLeaveApproved(userId, leaveDetails) {
    const notification = this.createNotification(
      userId,
      'LEAVE_APPROVED',
      'Leave Request Approved',
      `Your leave request from ${leaveDetails.fromDate} to ${leaveDetails.toDate} has been approved`,
      leaveDetails.leaveId
    );
    return notification;
  }

  /**
   * Notify user about leave rejection
   */
  notifyLeaveRejected(userId, leaveDetails) {
    const notification = this.createNotification(
      userId,
      'LEAVE_REJECTED',
      'Leave Request Rejected',
      `Your leave request from ${leaveDetails.fromDate} to ${leaveDetails.toDate} has been rejected`,
      leaveDetails.leaveId
    );
    return notification;
  }

  /**
   * Notify user about therapy assignment
   */
  notifyTherapyAssigned(patientId, therapyDetails) {
    const notification = this.createNotification(
      patientId,
      'THERAPY_ASSIGNED',
      'New Therapy Assigned',
      `You have been assigned ${therapyDetails.type} therapy. Room: ${therapyDetails.room}`,
      therapyDetails.therapyId
    );
    return notification;
  }
}

module.exports = new NotificationService();
