/**
 * Created by jorgeayala on 15/09/2019.
 */

const express = require('express');
const app = express();
const shortid = require('shortid');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const urlParse = require('url-parse');


// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));



// Logger module and parameter
let log4js = require('log4js');
const LOG_LOCATION = '/logs/metronom-dev.log';

log4js.configure({
    appenders: { 'metronom-dev': { type: 'file', filename: LOG_LOCATION } },
    categories: { default: { appenders: ['metronom-dev'], level: 'debug' } }
});

const LOG = log4js.getLogger('metronom-dev');



// Helpers:
function DBQuery(query, variables, callback) {
    let connection = mysql.createConnection({
        // // Production:
        // host    : 'api.xxx.com',
        // user    : 'dev',
        // password: '00000',

        // Development:
        host    : 'db-metronom-1.0',
        port    : '3306',
        user    : 'root',
        password: 'mypassword',

        database: 'metronom-dev'
    });

    try {
        connection.connect();
        connection.query(query, variables, (error, results, fields) => {

            let values = [];
            if (error) {
                LOG.error('Error ocurred.', error);
            } else {
                if (results.length > 0) {
                    results.forEach((item, index) => {
                        values.push(item);
                    });
                }
            }
            callback(values);
        });
    } catch (error) {
        LOG.error('ERROR DB Query: ' + error);
    } finally {
        connection.end();
    }
}

function generateShortUrl(url, callback) {
    let longUrl = url;


    // Check if url exists in DB:
    let query = 'SELECT * FROM url_shorter WHERE long_url = ? LIMIT 1';
    let params = [
        longUrl
    ];

    DBQuery(query, params, (values => {
        if (values.length > 0) {
            // If data found return the short_url_id
            let dataset = values[0];
            callback(dataset.short_url_id);
        } else {
            // If data not found insert new dataset
            let shortId = shortid.generate();

            let query = 'INSERT IGNORE INTO url_shorter (long_url, short_url_id, access_counter) VALUES (?, ?, ?)';
            let params = [
                longUrl,
                shortId,
                0
            ];

            DBQuery(query, params, (values) => {
                if (values != null)
                    LOG.info("Dataset updated.", values)
            });

            callback(shortId);
        }
    }));
}

// Endpoints
app.get('/', (req, res) => {

    // Get form
    res.sendFile(__dirname + "/public/index.html");
});

app.get('/link/:shortUrl', (req, res) => {
    let query = 'SELECT * FROM url_shorter WHERE short_url_id = ? LIMIT 1';
    let params = [
        req.params.shortUrl
    ];

    DBQuery(query, params, (values) => {
        if (values.length > 0) {
            // If url found, counter++ and persist on DB
            let dataset = values[0];
            dataset.access_counter++;

            let query = 'UPDATE url_shorter SET access_counter = ? WHERE id = ?';
            let params = [
                dataset.access_counter,
                dataset.id
            ];

            DBQuery(query, params, (values) => {
                if (values != null)
                    LOG.info("Dataset updated.", values);
                else
                    LOG.info("Error : ", values);

                let query = 'INSERT INTO url_short_timestamp (short_url_id, `timestamp`) VALUES (?, NOW())';

                let params = [
                    dataset.id
                ];

                DBQuery(query, params, (values) => {
                    if (values != null)
                        LOG.info    ("Dataset saved.", values)
                });
            });

            res.redirect(dataset.long_url)
        } else
            res.status(404).send('Error: shortlink not found on db.')
    })
});

app.get('/link/:shortUrl/stats', (req, res) => {
    // TODO : add stats here for links!!!!

    let htmlResponse = '';

    res.send(htmlResponse);
});

app.post('/generate-short-url', (req, res) => {

    let longUrl = urlParse(req.body.longUrl, true).href;

    if (longUrl.length > 0) {

        generateShortUrl(longUrl, (shortId) => {
            let shortUrl = '/link/' + shortId.valueOf();

            let htmlResponse = '';
            htmlResponse += 'Long url : <a href="' + longUrl + '">' + longUrl + '</a><br><br>';
            htmlResponse += 'Short url : <a href="' + shortUrl + '">' + shortUrl+ '</a><br>';

            res.send(htmlResponse);
        });
    }
    else
        res.status(404).send("Error : cannot parse url.")
});

// For all unknown endpoints
app.get('*', (req, res) => {
    res
        .status(404)
        .send("Error: endpoint not found");
});
// Start Server:
app.listen(5000, () => {
    LOG.info('Listening on port 5000...');
});