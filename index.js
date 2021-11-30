const express = require('express');
const bodyParser = require('body-parser');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

aws.config.update({
    accessKeyId: 'ASIAXT2EXUQHZESFYQKX',
    secretAccessKey: 'UOrob8mPVMZBNG75vPQG/AsAe5dO/wlVumpz0JGr',
    sessionToken: 'FwoGZXIvYXdzELX//////////wEaDP1DNdvyH2UKn+1HTyLPAZ7KQJEyF5ghee+WXbbeo+lwZ5AsjtQnC5Gq1xdObTNDbh1E6kpP1tOK3AH9VjgPIbUX52tII7YNNib8DDbdgeOTTOZX1Dvk7MmZN3sNzZFVdZ95oFwUZ4iWQc+Fyi+qg0rVfwNvPxx3RAWqRT9kYWbl55uow/2wANizy6bQrV6GrpdbCtbfsk7jdXhoUWLsoV1b7Sgq2E+/fgmYfT4L0Y2YOw8/DPHIezlQWReagpWHh6MHvkquV5OMWIOK7R3AhLlwEBQLFC6pe7R4brZZZCil/vuMBjItm9hrAlIdiZ+mVkIIGdthfQmEy/eA6wBpzZEHwSV7LN09Folta3zakBYZUHLg',
    region: 'us-east-1',
    signatureVersion: 'v4',
});

const s3 = new aws.S3();
const upload = multer({
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/octet-stream' || file.mimetype === 'video/mp4'
            || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    },
    storage: multerS3({
        acl: 'public-read',
        s3,
        bucket: 'rek-hwng',
        key: function (req, file, cb) {
            req.file = Date.now() + file.originalname;
            cb(null, Date.now() + file.originalname);
        }
    })
});


app.post('/api/upload', upload.array('file', 1), (req, res) => {
    res.send({ file: req.file});
});

const rekognition = new aws.Rekognition();
// rekognition.detectLabels(params, function (err, data) {
//     if(err) console.log(err,err.stack);
//     else console.log(data);
// });
app.post('/api/data', (req, res) => {
    var params = {
        Image: {
            S3Object: {
                Bucket: "rek-hwng",
                Name: req.body.name,

            }
        },
        MaxLabels: 5,
        MinConfidence: 80,
    }
    console.log(req.body.name);
    rekognition.detectLabels(params, function (err, data) {
        if(err) console.log(err,err.stack);
        else res.send({ data: data });
        console.log(data);
    });
});

app.post('/api/text', (req, res) => {
	var params = {
		Image: {
			S3Object: {
				Bucket: 'rek-hwng',
				Name: req.body.name,
			},
		},
		// MaxLabels: 5,
		// MinConfidence: 80,
	};
	console.log(req.body.name);

	//detectText
	rekognition.detectText(params, (err, data) => {
		if (err) console.log(err, err.stack);
		else res.send({ data: data });
        console.log(data);
	});
});
app.post('/api/compare', (req, res) => {
	var params = {
		SimilarityThreshold: 90, 
        SourceImage: {
            S3Object: {
            Bucket: "rek-hwng", 
            Name: "mysourceimage"
            }
        }, 
        TargetImage: {
            S3Object: {
                Bucket: "rek-hwng", 
                Name: req.body.name,
            }
        }
	};

	rekognition.compareFaces(params, (err, data) => {
        if (err) console.log(err, err.stack);
        else res.send({ data: data });
        console.log(data);
    });
});
app.post('/api/faces',(req, res)=>{
    var params = {
        Image: {
         S3Object: {
          Bucket: "rek-hwng", 
          Name: req.body.name,
         }
        },
        Attributes: [
            "ALL"
          ]
       };
       rekognition.detectFaces(params,(err, data) =>{
         if (err) console.log(err, err.stack); // an error occurred
          else res.send({data: data})    
          console.log(JSON.stringify(data, null, '\t'));   
        });
});
app.post('/api/celeb',(req, res)=>{
    var params = {
        Image: {
         S3Object: {
          Bucket: "rek-hwng", 
          Name: req.body.name,
         }
        },
       };
       rekognition.recognizeCelebrities(params,(err, data) =>{
         if (err) console.log(err, err.stack); // an error occurred
          else res.send({data: data})    
          console.log(data);   
        });
});

app.listen(5000, () => {
    console.log('Server listening on port 5000!');
});