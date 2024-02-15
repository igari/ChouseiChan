"use strict";
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeuppercase = exports.addmessage = void 0;
var https_1 = require("firebase-functions/v2/https");
var firebase_functions_1 = require("firebase-functions");
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
var firestore_1 = require("firebase-functions/v2/firestore");
// The Firebase Admin SDK to access Firestore.
var app_1 = require("firebase-admin/app");
var firestore_2 = require("firebase/firestore");
// FirebaseのWebアプリ設定
// Firebase JS SDK v7.20.0以降、measurementIdはオプションです
var firebaseConfig = {
    apiKey: 'AIzaSyASuFhL2KSFLhwfI7OfpgjLDrdFVoltu2w',
    authDomain: 'itsusuru-686b1.firebaseapp.com',
    projectId: 'itsusuru-686b1',
    storageBucket: 'itsusuru-686b1.appspot.com',
    messagingSenderId: '715253804816',
    appId: '1:715253804816:web:a70e4bc9b88a58eb75ff95',
    measurementId: 'G-9TXLH0VX2S',
};
(0, app_1.initializeApp)(firebaseConfig);
var db = (0, firestore_2.getFirestore)();
// Start writing functions
// https://firebase.google.com/docs/functions/typescript
// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addmessage = (0, https_1.onRequest)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var writeResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, firestore_2.addDoc)((0, firestore_2.collection)(db, 'events'), {
                    name: 'テストだよ〜2',
                    candidate_dates: [
                        {
                            date: '2022-01-01',
                            time: '10:00',
                        },
                        {
                            date: '2022-01-02',
                            time: '10:00',
                        },
                    ],
                })];
            case 1:
                writeResult = _a.sent();
                // Send back a message that we've successfully written the message
                // Send back a message that we've successfully written the message
                res.json({ result: "Message with ID: ".concat(writeResult.id, " added.") });
                return [2 /*return*/];
        }
    });
}); });
// Listens for new messages added to /messages/:documentId/original
// and saves an uppercased version of the message
// to /messages/:documentId/uppercase
exports.makeuppercase = (0, firestore_1.onDocumentCreated)('/messages/{documentId}', function (event) {
    // Grab the current value of what was written to Firestore.
    var original = event.data.data().original;
    // Access the parameter `{documentId}` with `event.params`
    firebase_functions_1.logger.log('Uppercasing', event.params.documentId, original);
    var uppercase = original.toUpperCase();
    // You must return a Promise when performing
    // asynchronous tasks inside a function
    // such as writing to Firestore.
    // Setting an 'uppercase' field in Firestore document returns a Promise.
    return event.data.ref.set({ uppercase: uppercase }, { merge: true });
});
