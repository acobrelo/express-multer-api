'use strict';

const fs = require('fs');
const fileType = require('file-type');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const mimeType = (data) => {
  return Object.assign({
    ext: 'bin',
    mime: 'application/octet-stream'
  }, fileType(data));
  //{} on left gets pushed into {} on right
};
//so we write this in to take in a buffer and return an object

let filename = process.argv[2] || '';
//reminder: this is how you get stuff FROM the command line

const readFile = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(data);
    });
  });
};

const awsUpload = (file) => {
  const options = {
    ACL: "public-read",
    Body: file.data,
    Bucket: '1.ga.wdi.12.abl',
    ContentType: file.mime,
    Key: `test/test.${file.ext}`,
  };

  return new Promise((resolve, reject) => {
    s3.upload(options, (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(data);
    });
  });
  //return Promise.resolve(options);
  //return options
};

readFile(filename)
.then((data) => {
  let file = mimeType(data);
  //custom object, file, mimeType, looks at the ext and headers
  //of a buffer to determine content type....
  //readfile gives us back a buffer
  //used to be an object file = {}, function needs to return an object for the
  //extra shit to work
  file.data = data;
  //pass cust obj the data
  return file;
})
//.then(awsUpload)
.then(console.log)
//.then((data) => console.log(`${filename} is ${data.length} bytes long`))
.catch(console.error);
