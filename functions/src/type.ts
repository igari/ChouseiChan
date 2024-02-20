import { FieldValue } from 'firebase-admin/firestore'

type ResponseType = 'YES' | 'NO' | 'MAYBE'

export interface ParticipantData {
  name: string
  responses: {
    [datetime: string]: ResponseType
  }
}

export interface ParticipantDataWithId extends ParticipantData {
  id: string
}

export interface CandidateDate {
  date: string
  time: string
}

export interface EventData {
  name: string
  candidateDates: CandidateDate[]
}
export interface EventDataWithId extends EventData {
  id: string
}

export interface CreateEventRequestParams extends EventData {
  createdAt: FieldValue
}

export interface UpdateEventRequestParams extends EventData {
  eventId: string
}

export interface ResponseEventRequestParams {
  eventId: string
  participantId?: string
  name: string
  responses: {
    [datetime: string]: ResponseType
  }
}
