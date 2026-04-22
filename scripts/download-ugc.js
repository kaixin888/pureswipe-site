const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function download(url, filename) {
  const response = await axios.get(url, { responseType: 'stream' });
  const writer = fs.createWriteStream(path.join('public/images/reviews', filename));
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function run() {
  const urls = [
    "https://m.media-amazon.com/images/I/41PtXXdyndL.jpg",
    "https://m.media-amazon.com/images/I/41mrOqiBAqL.jpg",
    "https://m.media-amazon.com/images/I/31DoRLrThvL.jpg",
    "https://m.media-amazon.com/images/I/31vW92SG49L.jpg",
    "https://m.media-amazon.com/images/I/31f-bvkg7RL.jpg"
  ];
  
  if (!fs.existsSync('public/images/reviews')) {
    fs.mkdirSync('public/images/reviews', { recursive: true });
  }

  for (let i = 0; i < urls.length; i++) {
    await download(urls[i], `amazon-ugc-${i+1}.jpg`);
    console.log(`Downloaded ${urls[i]}`);
  }
}

run();
