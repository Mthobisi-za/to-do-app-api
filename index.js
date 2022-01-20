const express = require('express');
const body = require('body-parser');
const { engine } = require('express-handlebars');
const session = require('express-session');
const app = express();
const cors = require('cors');
var passwordHash = require('password-hash');
require('dotenv').config();
const { Pool } = require('pg');
app.use(express.static('public'));
app.use(body.urlencoded({ extended: false }));
app.use(body.json());
app.use(cors({
    origin: "*"
}));
app.engine('handlebars', engine({ layoutsDir: 'views/layouts', defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
    })
);
var connectionstr = process.env.DATABASE_URL;
var pool;
if (connectionstr) {
    pool = new Pool({
        connectionString: connectionstr,
        ssl: { rejectUnauthorized: false },
    });
} else {
    pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        port: 5432,
        password: 'mthobisi',
        database: 'users',
        ssl: false,
    });
}
const useDb = require('./db')(pool, passwordHash);
app.get('/', (req, res) => {
    res.render('index');
})
app.get('/admin/:accessName', (req, res) => {
    var name = process.env.USER_NAME;
    if (name == req.params.accessName) {
        res.json({ status: 'succsess' })
    } else {
        res.json({ status: 'failed' })
    }
});
//sign Up user
app.get('/register/:username/:password', async(req, res) => {
    var username = req.params.username;
    var password = req.params.password;
    await useDb.registerUser(username, password);
    var user = await useDb.getUser(username);
    if (user.status == 'ok') {
        res.json({ status: 'succsess', data: user.data });
    } else {
        res.json({ status: user.status });
    }
});

app.get('/login/:username/:password', async(req, res) => {
    var username = req.params.username;
    var password = req.params.password;
    var user = await useDb.getUser(username);
    if (user.status == 'ok') {
        var hashedPasswords = await user.data.password;
        var condition = passwordHash.verify(password, hashedPasswords);
        if (condition) {
            res.json({
                user: user.data.auth_token
            });
        } else
            res.json({ status: 'failed' })
    } else {
        res.json({ status: user.status });
    }
});

app.get('/addTask/:task', async(req, res) => {
    var task = req.params.task;
    var auth = 'mthobisisha1$4c359801$1$755fbb9f759b1730e649a8ff0a952aea7e1919bb'
    await useDb.addTask(task, auth)
    res.json({});
});

app.get('/delete/:task', async(req, res) => {
    var task = req.params.task;
    var auth = 'mthobisisha1$4c359801$1$755fbb9f759b1730e649a8ff0a952aea7e1919bb'
    useDb.deleteTask(task, auth);
    res.json({});
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server started on ' + PORT);
});