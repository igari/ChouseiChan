// import { logger } from 'firebase-functions';//TODO loggerの使い方を調べる
import { onRequest } from 'firebase-functions/v2/https'
import cors from 'cors'

import path from 'node:path'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { initializeApp } from 'firebase-admin/app'
import {
  CreateEventRequestParams,
  EventData,
  ParticipantData,
  ParticipantDataWithId,
  ResponseEventRequestParams,
} from './type'
import nunjucks from 'nunjucks'

nunjucks.configure(path.join(__dirname, '../templates'), { autoescape: true })

// CORSの設定
const corsMiddleware = cors({
  origin: ['https://itsusuru.com', 'http://127.0.0.1:5000'],
  optionsSuccessStatus: 200,
  credentials: true,
})

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

export const createEvent = onRequest(async (req, res): Promise<void> => {
  corsMiddleware(req, res, async () => {
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
  })
})

export const fetchEvent = onRequest(async (req, res): Promise<void> => {
  corsMiddleware(req, res, async () => {
    const id = req.query.id as string

    if (!id) {
      res.status(400).send('Bad Request')
      return
    }

    // TODO: to full url
    const url = req.url

    const eventData = await db
      .collection('events')
      .doc(id)
      .get()
      .then(async (docSnapshot) => {
        if (docSnapshot.exists) {
          console.log('Document data retrieved with ID: ', id)

          const event = docSnapshot.data() as EventData

          return event
        } else {
          const errorMessage = `No document found with ID: ${id}`
          console.error(errorMessage)
          res.sendStatus(404)
          return Promise.reject(new Error(errorMessage))
        }
      })

    const eventParticipantsData = await db
      .collection('events')
      .doc(id)
      .collection('participants')
      .get()
      .then((querySnapshot) => {
        const participants: ParticipantDataWithId[] = []
        querySnapshot.forEach((doc) => {
          const id = doc.id

          const participant = {
            id,
            ...(doc.data() as ParticipantData),
          } as ParticipantDataWithId

          participants.push(participant)
        })
        console.log('Participants retrieved for event ID: ', id)
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
      // TODO: stop to use `...`
      ...event,
      participants: participants.map((participant) => {
        return {
          ...participant,
          responses: Object.values(participant.responses),
        }
      }),
      url,
      id,
    })

    res.send(responseText)
  })
})

export const fetchEdit = onRequest(async (req, res): Promise<void> => {
  corsMiddleware(req, res, async () => {
    const id = (req.query.id as string) || ''
    const name = (req.query.name as string) || ''
    const participantId = (req.query.participantId as string) || ''
    const responses = ((req.query.responses as string) || '').split(',')

    if (!id) {
      res.status(400).send('Bad Request')
      return
    }

    const eventData = await db
      .collection('events')
      .doc(id)
      .get()
      .then(async (docSnapshot) => {
        if (docSnapshot.exists) {
          console.log('Document data retrieved with ID: ', id)

          const event = docSnapshot.data() as EventData

          return event
        } else {
          const errorMessage = `No document found with ID: ${id}`
          console.error(errorMessage)
          res.sendStatus(404)
          return Promise.reject(new Error(errorMessage))
        }
      })

    const eventParticipantsData = await db
      .collection('events')
      .doc(id)
      .collection('participants')
      .get()
      .then((querySnapshot) => {
        const participants: ParticipantDataWithId[] = []
        querySnapshot.forEach((doc) => {
          const id = doc.id

          const participant = {
            id,
            ...(doc.data() as ParticipantData),
          } as ParticipantDataWithId

          participants.push(participant)
        })
        console.log('Participants retrieved for event ID: ', id)
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

    const responseText = nunjucks.render('edit.njk', {
      // TODO: stop to use `...`
      ...event,
      participants,
      id, // duplicate
      participant: {
        name,
        responses,
        id: participantId,
      },
    })

    res.send(responseText)
  })
})

export const responseEvent = onRequest(async (req, res): Promise<void> => {
  corsMiddleware(req, res, async () => {
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
          const targetURL = `http://127.0.0.1:5000/event?id=${data.eventId}`
          res.redirect(303, targetURL)
        })
    } else {
      await participantsReference.add(response).then(() => {
        console.log('Document written with ID: ', data.eventId)
        const targetURL = `http://127.0.0.1:5000/event?id=${data.eventId}`
        res.redirect(303, targetURL)
      })
    }
  })
})

// export const fetchEventParticipants = onRequest(
//   options,
//   async (req, res): Promise<void> => {
//     const query = req.query as { eventId: string }
//     await db
//       .collection('events')
//       .doc(query.eventId)
//       .collection('participants')
//       .get()
//       .then((querySnapshot) => {
//         const participants: ParticipantData[] = []
//         querySnapshot.forEach((doc) => {
//           participants.push(doc.data() as ParticipantData)
//         })
//         console.log('Participants retrieved for event ID: ', query.eventId)
//         res.send(participants)
//       })
//       .catch((error) => {
//         console.error('Error fetching participants: ', error)
//         res.status(500).send('Error fetching participants')
//       })
//   }
// )
