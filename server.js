const express = require('express');
const request = require('request');
const requestPromise = require('request-promise');
const Sentiment = require('sentiment');

const sentiment = new Sentiment();

const app = express();
const port = process.env.PORT || 5000;

app.get('/api/about', (req, res) => {
  res.send({express:"Developed by Chris Germano (@chris_germano)"});
});

app.get('/api/:stock/:numArticles', (req, res) => {

  function formatDate(date) {
    var date = new Date(date);
    var year = date.getFullYear();
    var month = date.getMonth();
    var date = date.getDate();
    month = month < 10 ? "0" + month : month;
    date = date < 10 ? "0" + date : date;
    return year + month.toString() + date;
  }

  function pullNewsData(symbol,count) {

    var promObj = new Promise(function(res, rej) {

      requestPromise('https://api.iextrading.com/1.0/stock/' + symbol + '/news/last/' + count,
        { json: true }, (apiErr, apiRes, body) => {

          if (apiErr) {
            rej(apiErr);
          }

          var snapshots = [];

          for (var key in body) {
            if (body.hasOwnProperty(key) &&
              body[key].summary != '' &&
              body[key].summary != 'No summary available.') {

                var articleDate = formatDate(body[key].datetime);
                var articleSentiment = sentiment.analyze(body[key].summary);

                var articleSnapshot = {
                  'symbol' : symbol,
                  'date' : formatDate(body[key].datetime),
                  'url' : body[key].url,
                  'sentiment_score' : articleSentiment.score,
                  'sentiment_strength' : articleSentiment.comparative
                }

                snapshots.push(articleSnapshot);

              }
          }

          (function openCloseLoop(index) {

            if (index < snapshots.length) {

              request('https://api.iextrading.com/1.0/stock/' + snapshots[index].symbol + '/chart/date/' + snapshots[index].date,
                { json: true }, (apiErr, apiRes, body) => {

                  if (apiErr) console.log(apiErr);

                  if (body.length > 0) {
                    snapshots[index].open = body[0].marketOpen;
                    snapshots[index].close = body[body.length - 1].marketClose;
                  } else {
                    snapshots[index].open = -1;
                    snapshots[index].close = -1;
                  }

                  openCloseLoop(index + 1);

                })

            } else {
              res(snapshots);
            }

          })(0);

        })

    })

    return promObj;

  }



  function returnPromiseData(data) {
    res.send({express:data});
  }

  function errorHandler(data) {
    res.send({express:data});
  }


  pullNewsData(req.params.stock,req.params.numArticles).then(returnPromiseData, errorHandler);


})

app.listen(port, () => console.log(`Listening on port ${port}`));
