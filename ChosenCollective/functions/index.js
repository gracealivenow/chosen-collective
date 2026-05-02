const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { Expo } = require('expo-server-sdk');

initializeApp();
const expo = new Expo();

async function sendPushToAll(title, body) {
  const db = getFirestore();
  const usersSnap = await db.collection('users').get();
  const messages = [];

  usersSnap.forEach(doc => {
    const token = doc.data().expoPushToken;
    if (token && Expo.isExpoPushToken(token)) {
      messages.push({
        to: token,
        sound: 'default',
        title,
        body,
        data: {},
      });
    }
  });

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
  }
}

exports.onNewAnnouncement = onDocumentCreated('announcements/{id}', async (event) => {
  const data = event.data.data();
  await sendPushToAll('📣 ' + data.title, data.detail || 'New announcement posted!');
});

exports.onNewEvent = onDocumentCreated('events/{id}', async (event) => {
  const data = event.data.data();
  await sendPushToAll('📅 New Event: ' + data.title, data.time + ' · ' + data.location);
});

exports.onNewDevo = onDocumentCreated('devotionals/{id}', async (event) => {
  const data = event.data.data();
  await sendPushToAll('📖 New Devotional', data.title);
});