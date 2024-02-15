// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { addDoc, collection, getDocs, getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASuFhL2KSFLhwfI7OfpgjLDrdFVoltu2w",
  authDomain: "itsusuru-686b1.firebaseapp.com",
  projectId: "itsusuru-686b1",
  storageBucket: "itsusuru-686b1.appspot.com",
  messagingSenderId: "715253804816",
  appId: "1:715253804816:web:a70e4bc9b88a58eb75ff95",
  measurementId: "G-9TXLH0VX2S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const db = getFirestore(app);

// Now you can use Firestore
async function getData(db) {
  const querySnapshot = await getDocs(collection(db, "events")).catch(
    (error) => {
      const errorMsg = `Error getting documents: , ${error}`;
      console.log(errorMsg);
      return Promise.reject(errorMsg);
    }
  );
  querySnapshot.forEach((doc) => {
    const { name, candidate_dates } = doc.data();
    console.log(doc.id, name, candidate_dates);
  });
}

async function addData(db) {
  try {
    const docRef = await addDoc(collection(db, "events"), {
      name: "テストだよ〜2",
      candidate_dates: [
        {
          date: "2022-01-01",
          time: "10:00",
        },
        {
          date: "2022-01-02",
          time: "10:00",
        },
      ],
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

await getData(db);

await addData(db);

await getData(db);
