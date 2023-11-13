var express = require('express');
var app = express();
var favicon = require('serve-favicon'); 
const fs = require('fs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const { auth } = require('./middlewares/auth');
const { nullCheck, updateInfo,isDuplicated,updateRank } = require('./function');

//Mysql Setting
const data = fs.readFileSync('./config.json');
const conf = JSON.parse(data);
const mysql      = require('mysql');
const SECRET_KEY = conf.secretKey;
const connection = mysql.createConnection({
    host     : conf.host,
    user     : conf.user,
    password : conf.password,
    database : conf.database
});
app.use(favicon(path.join(__dirname, 'public' ,'favicon.ico')));
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(cookieParser());
app.set("view engine", "ejs");

// login
app.get('/login', function(req, res){
    res.sendFile(__dirname + '/public/login.html');
});
app.post('/login',function(req,res){
    var id = req.body.name;
    var pw = req.body.pass;

    if (!nullCheck(id,pw)) {
        return res.send("<script>alert('빈값일 수 없습니다.');location.href='/login'</script>");
    }
    else {
        connection.query('SELECT * from users WHERE uid=? AND upw=?;',[id,pw], (error, rows, fields) => {
            myinfo = rows[0]
            if (error) throw error;
            else if (rows.length> 0) {
                token = jwt.sign({uid: id,rank: myinfo.ranking,'win':myinfo.win,'lose':myinfo.lose}, SECRET_KEY, {expiresIn: '20m'});
                res.cookie('token', token);
                return res.status(200).redirect('/');
            }else {
                console.log("fail: ",rows);
                return res.send("<script>alert('로그인 실패');location.href='/login'</script>");
            }
        });
    }
})

//logout
app.get('/logout', auth,function (req,res) {
    res.cookie('token','',{maxAge:0});
    res.redirect('/login');
});

//register
app.get('/register', function(req,res) {
    res.sendFile(__dirname + '/public/register.html');
});
app.post('/register',function(req,res){
    var id = req.body.name;
    var pw = req.body.pass;
    var checkpw = req.body.passConfirm;
    let insertQuery = 'INSERT INTO users (uid,upw,ranking,is_admin,win,lose,rating) VALUES (?,?,100,0,0,0,0);';

    if (!nullCheck(id,pw)) {
        return res.send("<script>alert('빈값일 수 없습니다.');location.href='/register'</script>");
    }
    else if (isDuplicated(connection,id)) {
        return res.send("<script>alert('중복된 아이디입니다.');location.href='/register'</script>");
    }
    else {
        if (pw === checkpw) {
            connection.query(insertQuery,[id,pw], (error, rows) => {
                if (error) throw error;
                else {
                    return res.status(200).send("<script>alert('회원가입 성공');location.href='/login'</script>");
                }
            });
        } else {
            return res.send("<script>alert('비밀번호를 확인해주세요');location.href='/register'</script>");
        }
        
    }
});

//비밀번호 찾기
app.get('/resetPw' ,function (req,res) {
    res.sendFile(__dirname+'/public/rp.html');
});
app.post('/resetPw' ,function (req,res) {
    
});

//오목
app.get('/omok',auth, function(req, res){
    res.sendFile(__dirname + '/public/omok.html');
});

//바둑
app.get('/baduk',auth, function(req, res){
    res.sendFile(__dirname + '/public/baduk.html');
});

// index
app.get('/', auth, function(req, res){  
    var mydata = jwt.verify(req.cookies.token, SECRET_KEY);
    connection.query('SELECT * from users order by ranking asc limit 0,3;', (error, rows, fields) => {
        if (error) throw error;
        
        res.render(__dirname + '/public/main.ejs',
        {'uid':mydata.uid,
        'ranking':mydata.rank,
        'win':mydata.win,'lose':mydata.lose,
        'r1':rows[0].uid,
        'r2':rows[1].uid,
        'r3':rows[2].uid}
    );
    });
});

//server + socket
var server = app.listen(80, function() {
    console.log('Connect 80 port');
    updateRank(connection);
});
const socket = require(__dirname + '/socket');
socket(server);