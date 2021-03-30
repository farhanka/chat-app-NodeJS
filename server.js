var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

mongoose.Promise = Promise;
var dbUrl = 'mongodb://localhost:27017/belajar_nodejs';

var Message = mongoose.model('Message', {
    nama: String,
    message: String
});

var Badword = mongoose.model('Badword', {
    kata: String,
    sensor: String
})

app.get('/message', function (req, res) {
    Message.find({}, function (err, message) {
        res.send(message)
    })
});

app.post('/message', async function (req, res) {
    try {
        var data = new Message(req.body);
        await Badword.find({}, (err, words) => {
            words.forEach(badword => {
                let regex = new RegExp(badword.kata.toString(), "ig")
                req.body.message = req.body.message.toString().replace(regex, badword.sensor.toString())
                data.message = req.body.message
                
            })
        })

        await data.save();
        io.emit('message', req.body);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
        return console.log(error);
    }
});

io.on('connection', socket => {
    console.log('Connected')
});

mongoose.connect(dbUrl, function (err) {
    console.log("connect to mongoDb successfull")
})

var server = http.listen(3000, function () {
    console.log(`Copy this to your browser : http://localhost:${server.address().port}/`);
});