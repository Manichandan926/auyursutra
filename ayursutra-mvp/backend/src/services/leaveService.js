const Leave = require('../models/Leave');
const datastore = require('../data/datastore');
const auditLogger = require('../utils/logger');

class LeaveService {
  /**
   * Submit leave request (doctor/practitioner)
   */
  submitLeaveRequest(data, userId, userRole) {
    const leave = new Leave({
      ...data,
      userId,
      userRole,
      status: 'PENDING'
    });

    datastore.addLeave(leave);

    auditLogger.createLog(
      userId,
      userRole,
      'LEAVE_REQUESTED',
      leave.id,
      `${userRole} requested leave from ${data.fromDate} to ${data.toDate}`
    );

    return leave;
  }

  /**
   * Get all pending leaves
   */
  getPendingLeaves() {
    return datastore.getPendingLeaves();
  }

  /**
   * Get user leaves
   */
  getUserLeaves(userId) {
    return datastore.getUserLeaves(userId);
  }

  /**
   * Approve leave request (admin only)
   */
  approveLeave(leaveId, adminId) {
    const leave = datastore.updateLeave(leaveId, {
      status: 'APPROVED',
      approvedBy: adminId,
      approvedAt: new Date().toISOString()
    });

    if (!leave) {
      throw new Error('Leave request not found');
    }

    auditLogger.createLog(
      adminId,
      'ADMIN',
      'LEAVE_APPROVED',
      leaveId,
      `Approved leave for ${leave.userId} from ${leave.fromDate} to ${leave.toDate}`
    );

    return leave;
  }

  /**
   * Reject leave request (admin only)
   */
  rejectLeave(leaveId, reason, adminId) {
    const leave = datastore.updateLeave(leaveId, {
      status: 'REJECTED',
      approvedBy: adminId,
      approvedAt: new Date().toISOString()
    });

    if (!leave) {
      throw new Error('Leave request not found');
    }

    auditLogger.createLog(
      adminId,
      'ADMIN',
      'LEAVE_REJECTED',
      leaveId,
      `Rejected leave: ${reason}`
    );

    return leave;
  }

  /**
   * Check if user is on approved leave on given date
   */
  isUserOnLeave(userId, date) {
    const userLeaves = datastore.getUserLeaves(userId);
    const checkDate = new Date(date);

    return userLeaves.some(leave => {
      if (leave.status !== 'APPROVED') return false;
      const fromDate = new Date(leave.fromDate);
      const toDate = new Date(leave.toDate);
      return checkDate >= fromDate && checkDate <= toDate;
    });
  }
}

module.exports = new LeaveService();
