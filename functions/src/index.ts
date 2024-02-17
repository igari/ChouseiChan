// import { logger } from 'firebase-functions';//TODO loggerの使い方を調べる
import { onRequest } from 'firebase-functions/v2/https'

import path from 'node:path'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { initializeApp } from 'firebase-admin/app'
import {
  CreateEventRequestParams,
  EventData,
  ParticipantData,
  ResponseEventRequestParams,
} from './type'
import nunjucks from 'nunjucks'

nunjucks.configure(path.join(__dirname, '../templates'), { autoescape: true })

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: 'itsusuru-686b1.firebaseapp.com',
  projectId: 'itsusuru-686b1',
  storageBucket: 'itsusuru-686b1.appspot.com',
  messagingSenderId: '715253804816',
  appId: '1:715253804816:web:a70e4bc9b88a58eb75ff95',
  measurementId: 'G-9TXLH0VX2S',
}

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)

const options = { cors: ['https://itsusuru.com'] }

export const createEvent = onRequest(
  options,
  async (req, res): Promise<void> => {
    const data = req.body
    const event: CreateEventRequestParams = {
      name: data.name,
      candidateDates: data.candidateDates, // 候補日の配列
      createdAt: FieldValue.serverTimestamp(),
    }

    await db
      .collection('events')
      .add(event)
      .then((docRef) => {
        const targetURL = `http://127.0.0.1:5000/event?id=${docRef.id}`
        res.redirect(303, targetURL)
      })
  }
)

export const responseEvent = onRequest(
  options,
  async (req, res): Promise<void> => {
    const data = req.body

    const eventReference = db.collection('events').doc(data.eventId)

    const participantsReference = eventReference.collection('participants')

    const response: ResponseEventRequestParams = {
      event: eventReference,
      name: data.name,
      responses: data.responses,
    }

    await participantsReference.add(response).then((docRef) => {
      console.log('Document written with ID: ', docRef.id)
      res.set('HX-Trigger', 'fetchEventParticipants')
      res.sendStatus(200)
    })
  }
)

export const fetchEvent = onRequest(
  options,
  async (req, res): Promise<void> => {
    const id = req.query.id as string

    if (!id) {
      res.status(400).send('Bad Request')
      return
    }

    const url = req.url

    await db
      .collection('events')
      .doc(id)
      .get()
      .then(async (docSnapshot) => {
        if (docSnapshot.exists) {
          console.log('Document data retrieved with ID: ', id)

          const event = docSnapshot.data() as EventData

          const responseText = nunjucks.render('event.njk', {
            ...event,
            url,
            id,
          })

          res.send(responseText)
        } else {
          console.log('No document found with ID: ', id)
          res.status(404).send('Document not found')
        }
      })
  }
)

export const fetchEventParticipants = onRequest(
  options,
  async (req, res): Promise<void> => {
    const query = req.query as { eventId: string }
    const participantsReference = db
      .collection('events')
      .doc(query.eventId)
      .collection('participants')

    await participantsReference
      .get()
      .then((querySnapshot) => {
        const participants: ParticipantData[] = []
        querySnapshot.forEach((doc) => {
          participants.push(doc.data() as ParticipantData)
        })
        console.log('Participants retrieved for event ID: ', query.eventId)
        res.send(participants)
      })
      .catch((error) => {
        console.error('Error fetching participants: ', error)
        res.status(500).send('Error fetching participants')
      })
  }
)
