const express = require('express');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const fs = require('fs');
const https = require('https');
const forceSsl = require('express-force-ssl');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolver/index');
const isAuth = require('./middleware/is-auth');

const app = express();

const options = {
    key : fs.readFileSync('./keys/key.pem'),
    cert : fs.readFileSync('./keys/cert.pem'),
    passphrase: '1234'
};
  
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    if(req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(forceSsl);
app.use(isAuth);

app.use('/api', graphqlHttp({
    // define real endpoint
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
}));

mongoose.connect('mongodb+srv://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASSWORD + '@node-rest-shop-zqnku.mongodb.net/' + process.env.MONGO_DB + '?retryWrites=true', 
{ useNewUrlParser: true})
.then( () =>  {
    app.listen(8000);
})
.catch(err=> {
    console.log(err);
});

https.createServer(options, app).listen(8001);