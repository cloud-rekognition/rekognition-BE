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
    accessKeyId: 'ASIAXT2EXUQHWWOJSDVC',
    secretAccessKey: '3wX61L4QLtvdIDkUTCKIT0A8Q0NAvUNw2Ri9ZqRY',
    sessionToken: 'FwoGZXIvYXdzEBEaDLQuNuh3mnjY/nEzFCLPAbG2mR2Qa2a9+tvunleHj85sPwhawEJtQSiZJ7TWNaxErlLNZh/BRrindpO/2goedVS+WAL12dz6XqzaZrNH0LNgwgp4kQw88+HpSS0uBeB6hpvg+8cnCpFVHcJ2b4iZm0cYd56hMeyd2Ys3GyCMBaqzYGJVb8q4hPAlXpnZTuuJnJqo/wTTnockw8Ig3FDBR4OOL+ptTC4npdZMGZkBRdAkvzk1JUTBU3utvDTp0dVGcJ9m7W5NsyfTBxZ9CrfZBROAFzookT2ezbrL22MFvyjbjdiMBjIt1NtYuJgxSIVV6vUwvat944yWG/RokYncYHKm5LAPiGiZj+sIOT0ln+OkjhyK',
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


app.listen(5000, () => {
    console.log('Server listening on port 5000!');
});