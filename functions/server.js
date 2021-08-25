const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios")
admin.initializeApp();
exports.sendToApi  = functions.pubsub.schedule('every minute').onRun(async(request, response) => {
    const db = admin.firestore();
    
    const urlFramaTechUAT = "https://mail.framatech.canplast.net/api/get_email_firebase"
    const collection =  await db.collection('queue_emails').limit(1).get()
    let emails = []
    collection.forEach((doc)=>{
        let docData = {
            _id: doc.id,
            email:doc.data()
        }
        console.log("Firebase Data Modified", JSON.stringify(docData))
        emails.push(docData)
        return emails
    })

    if(emails.length <=0){
        response.status(200).send({message: "There's not emails on queue"})
    }else{

        let config_email = {
            method: 'POST',
            url: urlFramaTechUAT,
            data : emails[0]
        }

        axios(config_email).then(function(data){
            response.status(200).send(data.data)
        }).catch(function(error){
            // Error 😨
            if (error.response) {
                /*
                * The request was made and the server responded with a
                * status code that falls out of the range of 2xx
                * console.log("data", error.response.data);
                console.log("status", error.response.status);
                console.log("headers", error.response.headers);
                */
                let se_err = error.response.data.error
                console.log("Ship Engine Error Complete", se_err)
                response.status(200).send({ se_err: se_err})
            } else if (error.request) {
                /*
                * The request was made but no response was received, `error.request`
                * is an instance of XMLHttpRequest in the browser and an instance
                * of http.ClientRequest in Node.js
                */
                console.log("Error Axios Request", error.request);
                response.status(200).send({ error: error.request})
            } else {
                // Something happened in setting up the request and triggered an Error
                console.log('Error Message', error.message);
                response.status(200).send({ error: error.message})
            }
        })
    }
  })


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
