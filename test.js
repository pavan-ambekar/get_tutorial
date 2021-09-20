const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const {
  firestore
} = require('firebase-admin');
const db = admin.firestore();
const feedbackApp = express();
feedbackApp.use(cors({
  origin: true
}));

feedbackApp.post('/', (req, res) => {
  var data = req.body;
  var title = data['Title'];
  var college = data['College'];
  var date = data['Date'];
  var time = data['Time'];
  var participents = data['Participents'];
  var departments = data['Departments'];
  var link = data['Link'];
  let snapshot;

  feedbackdata = {
    Title: [title],
    Date: [date],
    Time: [time],
    Departments: [departments],
    Link: [link],
  }

  if (participents.length === 4) {
    participents.forEach((element) => {
      snapshot = db.collection('Identifier').doc(college).collection('Person').doc(element).get().then((value) => {
        ids.concat(Object.keys(value.data()));
        return;
      });

    });
  } else {
    participents.forEach((element) => {
      // console.log(element);
      db.collection('Identifier').doc(college).collection('Person').doc(element).get().then(data => {
        snapshot = data;

        let partiicipentsids = []

        let val = Object.values(data.data());
        let dept = feedbackdata['Departments'];

        val.forEach(element => {
          if (dept.includes(element['Dept'])) {
            partiicipentsids.push(element['ID']);
          }

        });

        sendFeedback(partiicipentsids, feedbackdata, college);
        return;
      }).catch((error) => {
        console.log(error);
      });


    });
  }

});

function sendFeedback(ids, feedbackdata, college) {
  // let date=feedbackdata['Date'];

  // let expiry=
  feedbackdata['Type'] = 'Feedback';
  // let a = feedbackdata['Date']
  // let nextDate =  (new Date(new Date(Number(a.split("-")[2]),(Number(a.split("-")[1])-1),Number(a.split("-")[0])).setDate(new Date(Number(a.split("-")[2]),(Number(a.split("-")[1])-1),Number(a.split("-")[0])).getDate()+ 10)));
  // let updatedDate =String(nextDate.getDate()).padStart(2, "0") + "-" + String(nextDate.getMonth()+1).padStart(2, "0") + "-" + nextDate.getFullYear();
  // console.log(updatedDate);
  feedbackdata['Expiry'] = feedbackdata['Date']
  ids.forEach(e => {
    db.collection(college).doc('CollegeDetails').collection(e).doc('Dashboard').set({
      Reminder: firestore.FieldValue.arrayUnion(feedbackdata)
    }, {
      merge: true
    }).catch(e => {
      console.log(e);
    });
    // db.collection(college).doc('CollegeDetails').collection(e).doc('Circular').collection(year).doc('Circulars').set({ [feedbackdata['AuthorID']+';'+feedbackdata['Date']+';'+feedbackdata['Time']]:feedbackdata},{merge:true}).catch(e=>{
    //     console.log(e);
    // });
  });
}

exports.Feedback = functions.https.onRequest(feedbackApp);