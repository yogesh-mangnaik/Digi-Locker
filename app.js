//Required modules
const ipfsAPI = require('ipfs-api');
const express = require('express');
const fs = require('fs');
const multer = require('multer')
const app = express();
const bodyParser = require('body-parser');

var upload = multer({
    dest: 'uploads/'
})

//Connceting to the ipfs network via infura gateway
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {
    protocol: 'https'
})

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

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
    res.sendFile("C:\\Users\\yoges\\Desktop\\Final Year Project\\DigiLocker\\index.html");
})

//Getting the uploaded file via hash code.
app.get('/getfile', function (req, res) {

    //This hash is returned hash of addFile router.
    const validCID = 'QmTKxq5ac8Jc6UkRo2wyLa7TTX4MRBCb6SuZwo7Hbck1Zy'

    ipfs.files.get(validCID, function (err, files) {
        files.forEach((file) => {
            console.log(file.path)
            console.log(file.content.toString('utf8'))
            fs.writeFile(filepath + filename, new Buffer(file.content.toString('utf-8')), (err) => {
                if (err) {
                    throw err;
                }
                res.download(filepath + filename);
            })
        })
    })
})

app.get('/myfiles', function(req, res){

})

app.get('/loginpage', function(req, res){
    res.sendFile(__dirname+'/public/login.html')
})

app.post('/fileupload', upload.single('datafile'), function (req, res, next) {
    const file = fs.readFileSync(__dirname + "\\" + req.file.path);
    let fileBuffer = new Buffer(file);
    ipfs.files.add(fileBuffer, function (err, file) {
        if (err) {
            console.log(err);
        }
        console.log(file)
        res.send(file);
    })
    res.send("File Successfully Uploaded");
})

app.post('/login', function(req, res){
    console.log(req.body.username)
})

app.use(express.static(__dirname + '/public'));
app.listen(3000, () => console.log('App listening on port 3000!'))
