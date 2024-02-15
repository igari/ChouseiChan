import { logger } from 'firebase-functions';
import { onRequest } from 'firebase-functions/v2/https';

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

const firebaseConfig = {
  apiKey: 'AIzaSyASuFhL2KSFLhwfI7OfpgjLDrdFVoltu2w',
  authDomain: 'itsusuru-686b1.firebaseapp.com',
  projectId: 'itsusuru-686b1',
  storageBucket: 'itsusuru-686b1.appspot.com',
  messagingSenderId: '715253804816',
  appId: '1:715253804816:web:a70e4bc9b88a58eb75ff95',
  measurementId: 'G-9TXLH0VX2S',
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export const helloWorld = onRequest((request, response) => {
  logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

export const createEvent = onRequest(
  // { cors: [/firebase\.com$/, "flutter.com"] },
  async (request, response): Promise<void> => {
    const data = request.body;
    const event = {
      name: data.name,
      candidate_dates: data.candidate_dates, // 候補日の配列
      createdAt: FieldValue.serverTimestamp(),
    };

    await db.collection('events')
      .add(event)
      .then((docRef) => {
        console.log('Document written with ID: ', docRef.id);
        response.send({ eventId: docRef.id, event });
      });
  }
);
