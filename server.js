const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
var profile = require('./profile');
var request = require('superagent');
require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded ({ extended: true }));
app.use(bodyParser.json());

//here we are setting the views directly to be ./views
//thereby letting the app know where to find the template files
app.set('views', './views');

//here we are setting the default engine to be ejs
//note we don't need to require it, express wil that for us.
app.set('view engine', 'ejs');

//now instead of using res.send we can use
//res.render to send the output of the template by filename
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

const mailchimpInstance = 'us19';
const listUniqueId = '0826a3eac6';
const mailchimpApiKey = process.env.APIKEY;

app.post('/thanks', (req, res) => {
    request
        .post('https://' + mailchimpInstance + '.api.mailchimp.com/3.0/lists/' + listUniqueId + '/members/')
        .set('Content-type', 'applicatoin/json;charset=utf-8')
        .set('Authorization', 'Basic ' + new Buffer('any:' + mailchimpApiKey ).toString('base64'))
        .send({
            'email_address': req.body.email,
            'status': 'subscribed',
            'merge_fields': {
                'FNAME': req.body.firstName,
                'LNAME': req.body.lastName
            }
        })
        .end(function (err, response) {
            if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
                res.render('thanks', { contact: req.body });
                console.log('Success!', { contact: req.body });
            } else {
                res.send('Sign Up Failed :(');
            }
        });
});

//define the route that will use the custom router
app.use('/profile', profile);

app.listen(8080, () => {
    console.log('listening at http://localhost:8080');
});



