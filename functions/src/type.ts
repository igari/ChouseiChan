import {
  DocumentData,
  DocumentReference,
  FieldValue,
} from 'firebase-admin/firestore'

type ResponseType = 'YES' | 'NO' | 'MAYBE'

export interface ParticipantData {
  name: string
  responses: { [datetime: string]: ResponseType }[]
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

export interface CreateEventRequestParams extends EventData {
  createdAt: FieldValue
}

export interface UpdateEventRequestParams extends EventData {
  eventId: string
}

export interface ResponseEventRequestParams extends ParticipantData {
  event: DocumentReference<DocumentData>
}
