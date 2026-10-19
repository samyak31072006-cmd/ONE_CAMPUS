import { describe, it, expect } from "vitest";
import { assessmentScoreEntrySchema, assessmentCreateSchema } from "@/lib/validations";

describe("Academic Marks & Assessment Validation", () => {
  const validAssessmentId = "a0000000-0000-4000-8000-000000000001";
  const validStudentId = "b0000000-0000-4000-8000-000000000001";
  const validOfferingId = "c0000000-0000-4000-8000-000000000001";

  it("accepts valid assessment scores within bounds", () => {
    const validData = {
      assessmentId: validAssessmentId,
      studentId: validStudentId,
      marksObtained: 18.5,
      maxMarks: 20,
      remarks: "Great work",
    };

    const parsed = assessmentScoreEntrySchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("rejects assessment scores exceeding maximum marks", () => {
    const invalidData = {
      assessmentId: validAssessmentId,
      studentId: validStudentId,
      marksObtained: 25, // Exceeds maxMarks 20!
      maxMarks: 20,
    };

    const parsed = assessmentScoreEntrySchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.errors[0].message).toContain("cannot exceed maximum allowed marks");
    }
  });

  it("rejects negative marks obtained", () => {
    const negativeData = {
      assessmentId: validAssessmentId,
      studentId: validStudentId,
      marksObtained: -5,
      maxMarks: 50,
    };

    const parsed = assessmentScoreEntrySchema.safeParse(negativeData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.errors[0].message).toContain("Marks cannot be negative");
    }
  });

  it("validates assessment creation rules", () => {
    const validAssessment = {
      courseOfferingId: validOfferingId,
      title: "Midterm Exam",
      assessmentType: "midterm" as const,
      maxMarks: 50,
      weightage: 30,
    };

    const validResult = assessmentCreateSchema.safeParse(validAssessment);
    expect(validResult.success).toBe(true);

    const zeroMaxMarks = {
      courseOfferingId: validOfferingId,
      title: "Invalid Quiz",
      assessmentType: "quiz" as const,
      maxMarks: 0, // Must be positive!
    };

    expect(assessmentCreateSchema.safeParse(zeroMaxMarks).success).toBe(false);
  });
});
