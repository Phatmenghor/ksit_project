export interface RequestStudentScoreModel {
  scheduleId: number;
}

export interface UpdateScoreModel {
  id: number;
  assignmentScore: number;
  midtermScore: number;
  finalScore: number;
  comments: string;
}

export interface CreateScoreModel {
  studentId: number;
  scoreSessionId: number;
}

export interface SubmitScoreModel {
  id: number;
  status: string;
  teacherComments?: string;
  staffComments?: string;
}
