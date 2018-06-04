const fs = require('fs');
const AWS = require('aws-sdk');
const watch = require('watch');
const chokidar = require('chokidar');
const readline = require('readline');
const debug = require('debug');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


rl.question('What file directory do you want to monitor?', (answer) => {
    // TODO: Log the answer in a database maybe?
    console.log(`monitoring: ${answer}`);

    rl.close();
});

debug(answer);

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var watcher = chokidar.watch(answer, {
    ignored: /(^|[\/\\])\../,
    persistent: true
});

var log = console.log.bind(console);
var paths = [];
// Add event listeners.
watcher
  .on('add', path => log(`File ${path} has been added`) && paths.push(path))
  .on('error', error => log(`Watcher error: ${error}`));

for (i = 0; i < paths.length ; i++) {

    const fileName = paths[i];
    const uploadFile = () => {
        fs.readFile(fileName, (err, data) => {
            if (err) throw err;
            const params = {
                Bucket: 'xxxxx', // pass your bucket name
                Key: 'xxxxx', // file will be saved as testBucket/contacts.csv
                Body: JSON.stringify(data, null, 2)
            };
            s3.upload(params, function (s3Err, data) {
                if (s3Err) throw s3Err
                console.log(`File uploaded successfully at ${data.Location}`)
            });
        });
    };

    uploadFile();
}