import { TranscriptModel, Course, Semester } from "@/model/request/request-transcript";
import type { TranscriptExtraInfo } from "@/utils/pdf/transcript-pdf-exporter";

/**
 * Full static transcript data for review / preview.
 * TODO: replace with live API data once the endpoint is wired up.
 *
 * 4 academic years × 2 semesters = 8 semesters, fully populated.
 */

let _cid = 1;
function mkCourse(
  courseCode: string,
  courseName: string,
  credit: number,
  letterGrade: string,
): Course {
  return {
    courseId: _cid++,
    courseCode,
    courseName,
    courseNameKH: "",
    credit,
    theory: 0,
    execute: 0,
    apply: 0,
    totalHour: credit * 16,
    scheduleId: 0,
    dayOfWeek: "",
    timeSlot: "",
    roomName: "",
    teacherName: "",
    totalScore: 0,
    letterGrade,
    gradePoints: 0,
    status: "COMPLETED",
    attendanceScore: 0,
    assignmentScore: 0,
    midtermScore: 0,
    finalScore: 0,
  };
}

function mkSemester(
  academyYear: number,
  yearLevel: string,
  semester: string,
  gpa: number,
  courses: Course[],
): Semester {
  return {
    academyYear,
    semester,
    semesterName: semester === "SEMESTER_2" ? "Semester 2" : "Semester 1",
    yearLevel,
    totalCredits: courses.reduce((s, c) => s + c.credit, 0),
    gpa,
    gpax: gpa,
    courses,
  };
}

export const MOCK_TRANSCRIPT_DATA: TranscriptModel = {
  studentId: 1,
  studentName: "Miss KAT SOKNA",
  studentCode: "232502001",
  className: "BCT-2021",
  majorName: "Computer Technology",
  departmentName: "Information Technology",
  dateOfBirth: "2003-11-24",
  nationality: "Cambodian",
  placeOfBirth: "Kampong Speu Province",
  degree: "BACHELOR",
  dateOfAdmission: "2021",
  dateOfGraduation: "2025",
  numberOfCreditsStudied: 148,
  numberOfCreditsTransferred: 0,
  totalNumberOfCreditsEarned: 148,
  cumulativeGradePointAverage: 2.86,
  academicStatus: "GRADUATED",
  generatedAt: "2026-06-20",
  semesters: [
    // ── Year 1 ──────────────────────────────────────────────────────────────
    mkSemester(2021, "FIRST_YEAR", "SEMESTER_1", 2.45, [
      mkCourse("GEN100", "English for Communication I", 2, "B"),
      mkCourse("GEN101", "Khmer Studies", 2, "C"),
      mkCourse("GEN102", "Mathematics I", 3, "C+"),
      mkCourse("GEN103", "Physics", 3, "B"),
      mkCourse("CT100", "Introduction to Information Technology", 3, "B+"),
      mkCourse("CT101", "Computer Fundamentals", 2, "B"),
      mkCourse("CT102", "Programming Fundamentals (C)", 3, "C+"),
    ]),
    mkSemester(2021, "FIRST_YEAR", "SEMESTER_2", 2.62, [
      mkCourse("GEN104", "English for Communication II", 2, "B"),
      mkCourse("GEN105", "Mathematics II", 3, "C"),
      mkCourse("GEN106", "Statistics and Probability", 3, "C+"),
      mkCourse("CT103", "Object-Oriented Programming (Java)", 3, "B"),
      mkCourse("CT104", "Discrete Mathematics", 3, "B"),
      mkCourse("CT105", "Digital Logic Design", 3, "C+"),
    ]),
    // ── Year 2 ──────────────────────────────────────────────────────────────
    mkSemester(2022, "SECOND_YEAR", "SEMESTER_1", 2.78, [
      mkCourse("GEN200", "English for Academic Purposes", 2, "B"),
      mkCourse("CT200", "Data Structures and Algorithms", 3, "B+"),
      mkCourse("CT201", "Database Systems I", 3, "B"),
      mkCourse("CT202", "Computer Architecture", 3, "C+"),
      mkCourse("CT203", "Web Programming I", 3, "B+"),
      mkCourse("CT204", "Operating Systems", 3, "B"),
    ]),
    mkSemester(2022, "SECOND_YEAR", "SEMESTER_2", 2.90, [
      mkCourse("CT205", "Database Systems II", 3, "A"),
      mkCourse("CT206", "Web Programming II", 3, "B+"),
      mkCourse("CT207", "Computer Networks", 3, "B"),
      mkCourse("CT208", "Software Engineering I", 3, "B+"),
      mkCourse("CT209", "Object-Oriented Analysis and Design", 3, "B"),
      mkCourse("GEN201", "Research Methodology", 2, "C+"),
    ]),
    // ── Year 3 ──────────────────────────────────────────────────────────────
    mkSemester(2023, "THIRD_YEAR", "SEMESTER_1", 3.05, [
      mkCourse("CT300", "Mobile Application Development", 3, "A"),
      mkCourse("CT301", "Software Engineering II", 3, "B+"),
      mkCourse("CT302", "Network Security", 3, "B"),
      mkCourse("CT303", "Cloud Computing", 3, "B+"),
      mkCourse("CT304", "Human-Computer Interaction", 2, "A"),
      mkCourse("CT305", "Operating Systems Administration", 3, "B"),
    ]),
    mkSemester(2023, "THIRD_YEAR", "SEMESTER_2", 3.18, [
      mkCourse("CT306", "Artificial Intelligence", 3, "B+"),
      mkCourse("CT307", "Data Mining", 3, "A"),
      mkCourse("CT308", "Distributed Systems", 3, "B"),
      mkCourse("CT309", "Information Systems Management", 3, "B+"),
      mkCourse("CT310", "Project Management", 2, "A"),
      mkCourse("CT311", "Internship I", 3, "S"),
    ]),
    // ── Year 4 ──────────────────────────────────────────────────────────────
    mkSemester(2024, "FOURTH_YEAR", "SEMESTER_1", 3.30, [
      mkCourse("CT400", "Machine Learning", 3, "A"),
      mkCourse("CT401", "Big Data Analytics", 3, "B+"),
      mkCourse("CT402", "Enterprise Application Development", 3, "A"),
      mkCourse("CT403", "Cybersecurity Management", 3, "B+"),
      mkCourse("CT404", "IT Entrepreneurship", 2, "A"),
      mkCourse("CT405", "Thesis I", 3, "B+"),
    ]),
    mkSemester(2024, "FOURTH_YEAR", "SEMESTER_2", 3.45, [
      mkCourse("CT406", "Internship II", 4, "S"),
      mkCourse("CT407", "Thesis II", 6, "A"),
    ]),
  ],
};

export const MOCK_TRANSCRIPT_EXTRA: TranscriptExtraInfo = {
  nationality: "Cambodian",
  placeOfBirth: "Kampong Speu Province",
  dateOfAdmission: "2021-11-01",
  dateOfGraduation: "2025-08-07",
  directorName: "HARTH Bunhe, PhD",
  issueCity: "Kampong Speu",
};
