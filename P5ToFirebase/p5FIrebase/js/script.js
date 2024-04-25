// Create a reference to the 'count' document
const countRef = db.collection('people').doc('count');

// Set up a listener for real-time updates
countRef.onSnapshot((doc) => {
  if (doc.exists) {
    const newData = doc.data();
    const newCount = newData.count;
  }
});


let video;
let poseNet;
let poses = [];
let peopleCount = 0;
let lastCountTime = 0;
const countInterval = 15000; // 15 seconds in milliseconds

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, { detectionType: 'multi', architecture: 'ResNet50', outputStride: 32, maxPoseDetections: 10, scoreThreshold: 0.7 }, modelLoaded);
  poseNet.on('pose', function(results) {
    poses = results;
  });

  video.hide();

  // Call countPeople() on setup to initialize peopleCount
  countPeople();
}

function modelLoaded() {
  console.log('Model Loaded!');
}

function countPeople() {
  peopleCount = poses.length;

  if(peopleCount > 4){
    peopleCount = 4;
  }

  // Update Firebase Firestore with the new count
  countRef.set({
    count: peopleCount
  })
}

function draw() {
  image(video, 0, 0, width, height);

  // Update the count once every five seconds
  if (millis() - lastCountTime >= countInterval) {
    countPeople();
    lastCountTime = millis();
  }

  // Display the number of people detected
  fill(255);
  textSize(20);
  text('People Count: ' + peopleCount, 10, 30);
  console.log(peopleCount);
}