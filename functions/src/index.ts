// import { logger } from 'firebase-functions';//TODO loggerの使い方を調べる
import path from 'node:path'
import { config } from 'firebase-functions'
import { HttpsFunction, Request, onRequest } from 'firebase-functions/v2/https'
import cors from 'cors'
import express from 'express'

import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { initializeApp } from 'firebase-admin/app'

import nunjucks from 'nunjucks'
import {
  CreateEventRequestParams,
  EventData,
  ParticipantData,
  ParticipantDataWithId,
  ResponseEventRequestParams,
  UpdateEventRequestParams,
} from './type'
import 'dotenv/config'

const env = nunjucks.configure(path.join(__dirname, '../templates'), {
  autoescape: true,
})

env.addGlobal(
  'API_BASE_URL',
  process.env.NODE_ENV === 'production'
    ? process.env.API_BASE_URL_PRD
    : process.env.API_BASE_URL_DEV
)

const corsMiddleware = cors({
  origin: ['https://itsusuru.com', 'http://127.0.0.1:5000'],
  optionsSuccessStatus: 200,
  credentials: true,
})

const isProduction = process.env.NODE_ENV === 'production'

// specify the region for your functions
const region = isProduction ? 'asia-northeast1' : undefined

const app = initializeApp({
  // AppOptionsにapiKeyがないが、公式のサンプルにはapiKeyがあるし、実際に使えるので無視する
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  apiKey:
    process.env.NODE_ENV === 'production'
      ? config().api.key
      : process.env.API_KEY,
  authDomain: 'itsusuru-686b1.firebaseapp.com',
  projectId: 'itsusuru-686b1',
  storageBucket: 'itsusuru-686b1.appspot.com',
  messagingSenderId: '715253804816',
  appId: '1:715253804816:web:a70e4bc9b88a58eb75ff95',
  measurementId: 'G-9TXLH0VX2S',
})

const db = getFirestore(app)

const onRequestWrapper = (
  handler: (
    request: Request,
    response: express.Response
  ) => void | Promise<void>
): HttpsFunction => {
  return onRequest({ region }, async (req, res): Promise<void> => {
    corsMiddleware(req, res, async () => {
      handler(req, res)
    })
  })
}

export const fetchHome = onRequestWrapper(async (req, res): Promise<void> => {
  const eventId = req.query.eventId as string

  if (eventId) {
    const event = await db
      .collection('events')
      .doc(eventId)
      .get()
      .then(async (docSnapshot) => {
        if (docSnapshot.exists) {
          console.log('Document data retrieved with ID: ', eventId)

          return docSnapshot.data() as EventData
        } else {
          const errorMessage = `No document found with ID: ${eventId}`
          console.error(errorMessage)
          res.sendStatus(404)
          return Promise.reject(new Error(errorMessage))
        }
      })

    const responseText = nunjucks.render('index.njk', {
      event: {
        id: eventId,
        name: event.name,
        candidateDates: event.candidateDates
          .map(({ date, time }) => `${date} ${time}`)
          .join(','),
      },
    })

    res.send(responseText)
  } else {
    const responseText = nunjucks.render('index.njk')

    res.send(responseText)
  }
})

export const createEvent = onRequestWrapper(async (req, res): Promise<void> => {
  const data = req.body as EventData

  const event: CreateEventRequestParams = {
    name: data.name,
    candidateDates: data.candidateDates,
    createdAt: FieldValue.serverTimestamp(),
  }

  await db
    .collection('events')
    .add(event)
    .then((docRef) => {
      // TODO: 何故これが動いているのか調べる。APIサーバからのレスポンスでブラウザに別ドメインにリダイレクト実行できているのは何故
      // TODO: オリジンを変数可する
      const targetURL = `http://127.0.0.1:5000/event?eventId=${docRef.id}`
      res.redirect(303, targetURL)
    })
})

export const updateEvent = onRequestWrapper(async (req, res): Promise<void> => {
  const data = req.body as UpdateEventRequestParams

  const event: EventData = {
    name: data.name,
    candidateDates: data.candidateDates,
  }

  await db
    .collection('events')
    .doc(data.eventId)
    .set(event)
    .then(() => {
      const targetURL = `http://127.0.0.1:5000/event?eventId=${data.eventId}`
      res.redirect(303, targetURL)
    })
})

export const fetchEvent = onRequestWrapper(async (req, res): Promise<void> => {
  const eventId = req.query.eventId as string

  if (!eventId) {
    res.status(400).send('Bad Request')
    return
  }

  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`

  const eventData = await db
    .collection('events')
    .doc(eventId)
    .get()
    .then(async (docSnapshot) => {
      if (docSnapshot.exists) {
        console.log('Document data retrieved with ID: ', eventId)

        const event = docSnapshot.data() as EventData

        return event
      } else {
        const errorMessage = `No document found with ID: ${eventId}`
        console.error(errorMessage)
        res.sendStatus(404)
        return Promise.reject(new Error(errorMessage))
      }
    })

  const eventParticipantsData = await db
    .collection('events')
    .doc(eventId)
    .collection('participants')
    .get()
    .then((querySnapshot) => {
      const participants: ParticipantDataWithId[] = []
      querySnapshot.forEach((docRef) => {
        const data = docRef.data() as ParticipantData
        const participant: ParticipantDataWithId = {
          id: docRef.id,
          name: data.name,
          responses: data.responses,
        }
        participants.push(participant)
      })
      console.log('Participants retrieved for event ID: ', eventId)
      return participants
    })
    .catch((error) => {
      console.error('Error fetching participants: ', error)
      res.status(500).send('Error fetching participants')
      return Promise.reject(error)
    })

  const [event, participants] = await Promise.all([
    eventData,
    eventParticipantsData,
  ])

  const responseText = nunjucks.render('event.njk', {
    event: {
      id: eventId,
      name: event.name,
      candidateDates: event.candidateDates,
    },
    participants: participants.map((participant) => {
      return {
        ...participant,
        responses: Object.values(participant.responses),
      }
    }),
    url,
  })

  res.send(responseText)
})

export const fetchEdit = onRequestWrapper(async (req, res): Promise<void> => {
  const eventId = (req.query.eventId as string) || ''
  const participantId = (req.query.participantId as string) || ''

  if (!eventId) {
    res.status(400).send('Bad Request')
    return
  }

  const eventData = await db
    .collection('events')
    .doc(eventId)
    .get()
    .then(async (docSnapshot) => {
      if (docSnapshot.exists) {
        console.log('Document data retrieved with ID: ', eventId)

        const event = docSnapshot.data() as EventData

        return event
      } else {
        const errorMessage = `No document found with ID: ${eventId}`
        console.error(errorMessage)
        res.sendStatus(404)
        return Promise.reject(new Error(errorMessage))
      }
    })

  const eventParticipantsData = await db
    .collection('events')
    .doc(eventId)
    .collection('participants')
    .get()
    .then((querySnapshot) => {
      const participants: ParticipantDataWithId[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data() as ParticipantData
        const participant: ParticipantDataWithId = {
          id: doc.id,
          name: data.name,
          responses: data.responses,
        }
        participants.push(participant)
      })
      console.log('Participants retrieved for event ID: ', eventId)
      return participants
    })
    .catch((error) => {
      console.error('Error fetching participants: ', error)
      res.status(500).send('Error fetching participants')
      return Promise.reject(error)
    })

  const [event, participants] = await Promise.all([
    eventData,
    eventParticipantsData,
  ])

  const participant = participants.find((p) => {
    return p.id === participantId
  })

  if (participant) {
    const responseText = nunjucks.render('edit.njk', {
      event: {
        id: eventId,
        name: event.name,
        candidateDates: event.candidateDates,
      },
      participants,
      participant: {
        id: participant.id,
        name: participant.name,
        responses: Object.values(participant.responses),
      },
    })

    res.send(responseText)
  } else {
    const responseText = nunjucks.render('edit.njk', {
      event: {
        id: eventId,
        name: event.name,
        candidateDates: event.candidateDates,
      },
      participants,
    })

    res.send(responseText)
  }
})

export const responseEvent = onRequestWrapper(
  async (req, res): Promise<void> => {
    const data = req.body

    const eventReference = db.collection('events').doc(data.eventId)

    const participantsReference = eventReference.collection('participants')

    const response: ResponseEventRequestParams = {
      event: eventReference,
      name: data.name,
      responses: data.responses,
    }

    if (data.participantId) {
      await participantsReference
        .doc(data.participantId)
        .set(response)
        .then(() => {
          console.log('Document updated with ID: ', data.participantId)
          const targetURL = `http://127.0.0.1:5000/event?eventId=${data.eventId}`
          res.redirect(303, targetURL)
        })
    } else {
      await participantsReference.add(response).then(() => {
        console.log('Document written with ID: ', data.eventId)
        const targetURL = `http://127.0.0.1:5000/event?eventId=${data.eventId}`
        res.redirect(303, targetURL)
      })
    }
  }
)
