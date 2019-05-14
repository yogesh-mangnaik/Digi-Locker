//Required modules
const ipfsAPI = require('ipfs-api');
const express = require('express');
const fs = require('fs');
const multer = require('multer')
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
var mongoClient = require('mongodb').MongoClient;

var upload = multer({
    dest: 'uploads/'
})

//Connceting to the ipfs network via infura gateway
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {
    protocol: 'https'
})

const filepath = "C:\\Users\\yoges\\Desktop\\Final Year Project\\Digi-Locker\\public\\myFiles.html"
let testBuffer = new Buffer(filepath);

app.set('view-engine', 'ejs');

app.use(session({
    secret: 'ssshhhhh'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var sess;

//Addfile router for adding file a local file to the IPFS network without any local node
app.get('/addfile', function (req, res) {
    ipfs.files.add(testBuffer, function (err, file) {
        if (err) {
            console.log(err);
        }
        console.log(file)
        res.send(file);
    })
})

app.get('/upload', function (req, res) {
    if (!req.session.username) {
        res.redirect('/loginpage');
    }
    res.render("upload.ejs");
})

//Getting the uploaded file via hash code.
app.get('/getfile', function (req, res) {

    //This hash is returned hash of addFile router.
    const validCID = 'QmTKxq5ac8Jc6UkRo2wyLa7TTX4MRBCb6SuZwo7Hbck1Zy'

    ipfs.files.get(validCID, function (err, files) {
        files.forEach((file) => {
            console.log(file.path)
            console.log(file.content.toString('utf8'))
            fs.writeFile("C:\\Users\\yoges\\Desktop\\Final Year Project\\Certificate_Issuance_And_Verification_On_Blockchain\\data" + "\\temp.json", new Buffer(file.content.toString('utf-8')), (err) => {
                if (err) {
                    throw err;
                }
                res.download("C:\\Users\\yoges\\Desktop\\Final Year Project\\Certificate_Issuance_And_Verification_On_Blockchain\\data" + "\\temp.json");
            })
        })
    })
})

app.get('/myfiles', function (req, res) {
    if (!req.session.username) {
        //res.redirect('/loginpage');
    }
    console.log("Username : " + req.session.username);
    mongoClient.connect("mongodb://localhost:27017", function (err, client) {
        var db = client.db('mydb');
        var user = "asdf";
        db.collection('users', function (err, collection) {
            if (err) {
                res.send("Error");
            }
            collection.findOne({username : user}, function(err, items){
                if(err){
                    console.log("Error");
                }
                else{
                    var namedata = []
                    var hashdata = []
                    for(var i=0; i<items.documents.length; i++){
                        var x = items.documents[i].split(',');
                        hashdata.push(x[0]);
                        namedata.push(x[1]);
                    }
                    console.log(namedata);
                    console.log(hashdata);
                    res.render('myfiles.ejs')
                }
            });
            //res.render("succesful.ejs");
        })
    })
    res.render('myfiles.ejs')
})

app.get('/loginpage', function (req, res) {
    res.render('login.ejs')
})

app.post('/fileupload', upload.single('datafile'), function (req, res, next) {
    if (!req.session.username) {
        res.redirect("/loginpage");
    }
    var username = req.session.username;
    console.log("Username = " + username)
    const file = fs.readFileSync(__dirname + "\\" + req.file.path);
    console.log(file);
    let fileBuffer = new Buffer(file);
    ipfs.files.add(fileBuffer, function (err, file) {
        if (err) {
            console.log(err);
            res.send("Error occured");
        }
        console.log(file);
        mongoClient.connect("mongodb://localhost:27017", function (err, client) {
            var db = client.db('mydb');
            var user = req.session.username;
            db.collection('users', function (err, collection) {
                if (err) {
                    console.log("Error in database");
                    res.send("Error");
                    return;
                }
                collection.update({
                    username: user
                }, {
                    $push: {
                        documents: file[0].path + "," + req.body.filename
                    }
                })
                res.send("Successful");
            })
        })
    })
})

app.post('/login', function (req, res) {
    mongoClient.connect("mongodb://localhost:27017", function (err, client) {
        var db = client.db('mydb');
        db.collection('users', function (err, collection) {
            var user = req.body.username;
            var pass = req.body.password;
            //var firstname = req.body.lastname;
            collection.find({
                username: user,
                password: pass
            }).limit(1).count().then(function (numItems) {
                console.log(numItems);
                if(numItems == 1){
                    sess = req.session;
                    req.session.username = user;
                    req.session.pass = pass;
                    res.redirect('/myFiles');
                }
                else{
                    res.redirect('/loginpage');
                }
            })
        })
    })
})

app.get('/logout', function(req, res){
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        }
        res.redirect('/loginpage');
    })
})

app.post('/signup', function (req, res) {
    mongoClient.connect("mongodb://localhost:27017", function (err, client) {
        var db = client.db('mydb');
        db.collection('users', function (err, collection) {
            var user = req.body.username;
            var pass = req.body.password;
            var firstname = req.body.firstname;
            var lastname = req.body.lastname;
            collection.insert({
                username: user,
                password: pass,
                fn: firstname,
                ln: lastname
            })
            res.send("Successful");
        })
    })
})

app.get('/signuppage', function (req, res) {
    res.render('signuppage.ejs');
})

app.use(express.static(__dirname + '/public'));
app.listen(3000, () => console.log('App listening on port 3000!'))
