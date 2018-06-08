const express = require('express');
const request = require('request');
const Sentiment = require('sentiment');

const sentiment = new Sentiment();

const app = express();
const port = process.env.PORT || 5000;

app.get('/api/about', (req, res) => {
  res.send({express:"Developed by Chris Germano (@chris_germano)"});
});

app.get('/api/:stock/:numArticles', (req, res) => {


  function ajaxPromise(symbol,numArticles) {

    var promiseObj = new Promise(function(resolve, reject) {

      request('https://api.iextrading.com/1.0/stock/'+symbol+'/news/last/'+numArticles,
        { json: true }, (err, response, body) => {

        if (err) { reject(err); }

        var snapshots = [];

        for (var key in body) {
          if (body.hasOwnProperty(key) &&
              body[key].summary != '' &&
              body[key].summary != 'No summary available.') {

              var senti = sentiment.analyze(body[key].summary);

              var snapshot = {
                'url' : body[key].url,
                'sentiment_score' : senti.score,
                'sentiment_strength' : senti.comparative
              }

              snapshots.push(snapshot);
          }
        }

        resolve(snapshots);
      });

    });

    return promiseObj;

  }

  function returnPromiseData(data) {
    res.send({express:data});
  }

  function errorHandler(data) {
    res.send('error');
  }


  ajaxPromise(req.params.stock,req.params.numArticles).then(returnPromiseData, errorHandler);


})

app.listen(port, () => console.log(`Listening on port ${port}`));
