const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

const COLLECTION_NAME = {
  PRODUCTS: 'products',
  USERS: 'users',
  PERMISSIONS: 'permissions'
}

const app = express();
app.use(cors({ origin: true }));
var serviceAccount = require("./permission.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-api-9a206..firebaseio.com",
});
const db = admin.firestore();

// create
app.post(`/api/${COLLECTION_NAME.PRODUCTS}/create`, (req, res) => {
  (async () => {
    try {
      await db
        .collection(COLLECTION_NAME.PRODUCTS)
        .doc("/" + req.body.id + "/")
        .create({ item: req.body });
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// read item
app.get(`/api/${COLLECTION_NAME.PRODUCTS}/:item_id`, (req, res) => {
  (async () => {
    try {
      const document = db.collection(COLLECTION_NAME.PRODUCTS).doc(req.params.item_id);
      let item = await document.get();
      let response = item.data();
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// read all
app.get(`/api/${COLLECTION_NAME.PRODUCTS}`, (req, res) => {
  (async () => {
    try {
      let query = db.collection(COLLECTION_NAME.PRODUCTS);
      let response = [];
      await query.get().then((querySnapshot) => {
        let docs = querySnapshot.docs;
        for (let doc of docs) {
          const selectedItem = {
            id: doc.id,
            item: doc.data(),
          };
          response.push(selectedItem);
        }
      });
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// update
app.put(`/api/${COLLECTION_NAME.PRODUCTS}/:item_id`, (req, res) => {
  (async () => {
    try {
      const document = db.collection(COLLECTION_NAME.PRODUCTS).doc(req.params.item_id);
      await document.update({
        item: req.body.item,
      });
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// delete
app.delete(`/api/${COLLECTION_NAME.PRODUCTS}/:item_id`, (req, res) => {
  (async () => {
    try {
      const document = db.collection(COLLECTION_NAME.PRODUCTS).doc(req.params.item_id);
      await document.delete();
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

exports.app = functions.https.onRequest(app);
