import { body, param } from 'express-validator';
export { validate } from '../middleware/validate.js';

export const registerTeamValidation = [
  body('teamName').notEmpty().trim().escape(),
  body('track').isString(),
  body('leader.name').notEmpty().trim().escape(),
  body('leader.email').isEmail().normalizeEmail(),
  body('leader.phone').notEmpty().trim(),
  body('leader.registrationNumber').optional().trim().escape(),
  body('leader.residentialStatus').optional().isIn(['Hosteller', 'Day Scholar']),
  body('leader.messName').optional().trim().escape(),
  body('transactionRef').notEmpty().trim().escape(),
  body('paymentProofUrl').optional().isURL(),
  body('member2.name').optional().trim().escape(),
  body('member2.email').optional().isEmail().normalizeEmail(),
  body('member2.registrationNumber').optional().trim().escape(),
  body('member2.residentialStatus').optional().isIn(['Hosteller', 'Day Scholar']),
  body('member3.name').optional().trim().escape(),
  body('member3.email').optional().isEmail().normalizeEmail(),
  body('member3.registrationNumber').optional().trim().escape(),
  body('member3.residentialStatus').optional().isIn(['Hosteller', 'Day Scholar']),
  body('member4.name').optional().trim().escape(),
  body('member4.email').optional().isEmail().normalizeEmail(),
  body('member4.registrationNumber').optional().trim().escape(),
  body('member4.residentialStatus').optional().isIn(['Hosteller', 'Day Scholar']),
  body('member5.name').optional().trim().escape(),
  body('member5.email').optional().isEmail().normalizeEmail(),
  body('member5.registrationNumber').optional().trim().escape(),
  body('member5.residentialStatus').optional().isIn(['Hosteller', 'Day Scholar']),
];

export const projectSubmissionValidation = [
  body('title').notEmpty().trim().escape(),
  body('problemStatement').notEmpty().trim().escape(),
  body('solutionDescription').notEmpty().trim().escape(),
  body('githubUrl').isURL().trim(),
  body('tagline').optional().trim().escape(),
  body('deploymentUrl').optional().isURL().trim(),
  body('presentationUrl').optional().isURL().trim(),
  body('videoUrl').optional().isURL().trim(),
  body('techStack').optional().isArray(),
];

export const adminOtpRequestValidation = [
  body('email').isEmail().normalizeEmail(),
];

export const adminOtpVerifyValidation = [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
];

export const teamStatusUpdateValidation = [
  param('id').notEmpty(),
  body('paymentStatus').optional().isIn(['pending', 'verified', 'rejected']),
  body('checkedInVenue').optional().isBoolean(),
  body('ticketIssued').optional().isBoolean(),
  body('notes').optional().trim().escape(),
  body('amountPaid').optional().isInt({ min: 0 }),
];

export const scoreSubmissionValidation = [
  param('id').notEmpty(),
  body('innovation').isInt({ min: 0, max: 20 }),
  body('technicalComplexity').isInt({ min: 0, max: 20 }),
  body('uiUx').isInt({ min: 0, max: 20 }),
  body('presentation').isInt({ min: 0, max: 20 }),
  body('impact').isInt({ min: 0, max: 20 }),
  body('feedback').optional().trim().escape(),
];

export const announcementValidation = [
  body('title').notEmpty().trim().escape(),
  body('message').notEmpty().trim().escape(),
  body('category').optional().isIn(['urgent', 'schedule', 'food', 'mentorship', 'general']),
  body('sender').optional().trim().escape(),
];

export const whitelistAddValidation = [
  body('email').isEmail().normalizeEmail(),
  body('name').notEmpty().trim().escape(),
  body('role').optional().isIn(['Superadmin', 'Lead Organizer', 'Jury Chair', 'Operations Lead', 'Faculty Advisor']),
  body('department').optional().trim().escape(),
];