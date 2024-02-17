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

export interface EventData {
  name: string
  candidateDates: string
  createdAt: FieldValue
}

export type CreateEventRequestParams = EventData

export interface ResponseEventRequestParams extends ParticipantData {
  event: DocumentReference<DocumentData>
}
