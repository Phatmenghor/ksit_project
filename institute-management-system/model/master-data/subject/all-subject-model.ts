export interface  AllSubjectModel{
  content: SubjectModel[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface SubjectModel {
  id: number
  name: string
  status: string
  createdAt: string
  updatedAt: any
}