// CampusOne Form & Request Validation Schemas (Zod)

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid academic email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "faculty", "admin"]).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter your registered college email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const studentProfileUpdateSchema = z.object({
  phone: z.string().regex(/^[+0-9\s-]{8,20}$/, "Invalid phone format").or(z.literal("")),
  emergencyContact: z.string().max(100).optional(),
});

export type StudentProfileUpdateFormData = z.infer<typeof studentProfileUpdateSchema>;

export const exemptionRequestSchema = z.object({
  classSessionId: z.string().uuid("Please select a valid class session"),
  reason: z.string().min(10, "Reason must provide sufficient explanation (min 10 characters)").max(500),
  documentUrl: z.string().optional(),
  documentFilename: z.string().optional(),
});

export type ExemptionRequestFormData = z.infer<typeof exemptionRequestSchema>;

export const exemptionReviewSchema = z.object({
  requestId: z.string().uuid(),
  action: z.enum(["approved", "rejected", "review_started"]),
  comments: z.string().min(5, "A decision comment of at least 5 characters is required"),
});

export type ExemptionReviewFormData = z.infer<typeof exemptionReviewSchema>;

export const assessmentCreateSchema = z.object({
  courseOfferingId: z.string().uuid("Please select a course offering"),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  assessmentType: z.enum(["quiz", "assignment", "midterm", "final", "project"]),
  maxMarks: z.coerce.number().positive("Maximum marks must be greater than 0").max(1000),
  weightage: z.coerce.number().min(0).max(100).optional(),
  dueDate: z.string().optional(),
});

export type AssessmentCreateFormData = z.infer<typeof assessmentCreateSchema>;

export const assessmentScoreEntrySchema = z.object({
  assessmentId: z.string().uuid(),
  studentId: z.string().uuid(),
  marksObtained: z.coerce.number().min(0, "Marks cannot be negative"),
  maxMarks: z.coerce.number().positive(),
  remarks: z.string().max(255).optional(),
}).refine((data) => data.marksObtained <= data.maxMarks, {
  message: "Marks obtained cannot exceed maximum allowed marks",
  path: ["marksObtained"],
});

export type AssessmentScoreEntryData = z.infer<typeof assessmentScoreEntrySchema>;

export const batchAttendanceEntrySchema = z.object({
  classSessionId: z.string().uuid(),
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(["present", "absent", "late", "excused"]),
      remarks: z.string().max(255).optional(),
    })
  ).min(1, "At least one student record is required"),
});

export type BatchAttendanceEntryData = z.infer<typeof batchAttendanceEntrySchema>;

export const timetableEntrySchema = z.object({
  courseOfferingId: z.string().uuid(),
  dayOfWeek: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Valid time format required (HH:MM)"),
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Valid time format required (HH:MM)"),
  room: z.string().min(2, "Room identifier required"),
  effectiveStartDate: z.string(),
  effectiveEndDate: z.string().optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export type TimetableEntryFormData = z.infer<typeof timetableEntrySchema>;

export const userManagementSchema = z.object({
  collegeId: z.string().min(3),
  email: z.string().email(),
  fullName: z.string().min(2),
  role: z.enum(["student", "faculty", "admin"]),
  departmentId: z.string().uuid().optional(),
  semester: z.coerce.number().min(1).max(12).optional(),
  section: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type UserManagementFormData = z.infer<typeof userManagementSchema>;
