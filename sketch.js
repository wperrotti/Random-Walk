let randomWalks = [];
let numWalks = 0;
let isHeads = false;
let stepSizeSlider;
let sliderLabel;
let speedSlider; // speed slider variable
let timer;
let timerIsDone = false;
let color1, color2; // Variables for the gradient colors
let message = ""; // Variable for completion message
let messageDisplayed = false; // Add a flag to track if the message has been displayed
let warningLabel; // Global variable for the warning label
let introVisible = true; // Flag to track if the intro page is visible

function setup() {
  createCanvas(windowWidth, windowHeight); // Create a canvas that fills the window
  noLoop(); // Prevent the draw loop from running until the user makes a choice
  generateRandomColors(); // Generate initial random colors
  setInterval(generateRandomColors, 2000); // Change colors every 2 seconds
  
  // Create a warning label
  warningLabel = createDiv('Caution: This artwork features flashing visuals that may not be suitable for those who are sensitive to light.');
  warningLabel.position(20, height - 100); // Position above the bottom of the screen
  warningLabel.style('font-size', '16px');
  warningLabel.style('color', 'red'); // Set the color to red for visibility
  warningLabel.style('font-family', 'Arial, sans-serif');
  warningLabel.style('padding', '10px');
}

//will run evey frame 
function draw() {
  if (!introVisible) { 
    // proceeds with the art if the intro is no longer visible
    if (timerIsDone) {
      if (!messageDisplayed) { // Checks if the message hasn't been displayed yet
        // Display completion message
        textFont('Dancing Script'); // Set the font for the message
        fill(255); // White text color
        stroke(0); // Black outline
        textSize(32);
        textAlign(CENTER);
        text("Time's up! Your art journey is complete.", width / 2, height / 2);
        messageDisplayed = true; // Set the flag to true after displaying the message
      }
      return; // this stops drawing after the timer is done
    }

    if (randomWalks.length === 0) {
      return; // Don't draw anything until the walks are initialized
    }

    // Create a gradient background
    for (let i = 0; i < height; i++) {
      let inter = map(i, 0, height, 0, 1);
      let c = lerpColor(color1, color2, inter); // Use the random colors for the gradient
      stroke(c);
      line(0, i, width, i);
    }

    // Update and display each random walk
    for (let walk of randomWalks) {
      walk.update(stepSizeSlider.value()); // Use the slider value for step size
      walk.display();
    }

    // Check if 3 minutes (180000 milliseconds) have passed
    if (millis() - timer >= 180000) {
      timerIsDone = true; // Set timer flag to true
      console.log("Time's up! The art is complete.");
    }
  }
}

// Function to start the sketch when the user clicks heads or tails
function startSketch(choice) {
  let intro = document.getElementById("intro");
  intro.style.display = "none"; // Hide the intro screen
  introVisible = false; // Set the flag to indicate the intro is no longer visible

  // Hide the warning label on the second screen instead of removing it
  warningLabel.hide(); // Hide the warning label rather than removing it entirely

  if (choice === "heads") {
    numWalks = floor(random(3, 11)) * 2; // Even number of walks (6 to 20)
    isHeads = true;
  } else if (choice === "tails") {
    numWalks = floor(random(4, 10)) * 2 - 1; // Odd number of walks (7 to 19)
    isHeads = false;
  }

  for (let i = 0; i < numWalks; i++) {
    randomWalks.push(new RandomWalk()); // Initialize the RandomWalk class instances
  }

  // Create a slider for step size
  stepSizeSlider = createSlider(1, 20, 5); // Step size range from 1 to 20, default 5
  stepSizeSlider.position(20, height - 40); // Position the slider near the bottom
  stepSizeSlider.style('width', '200px');

  // Create a label for the step size slider
  sliderLabel = createDiv('Adjust Step Size:');
  sliderLabel.position(20, height - 70); // Position above the slider
  sliderLabel.style('font-size', '16px');
  sliderLabel.style('color', 'white');
  sliderLabel.style('font-family', 'Arial, sans-serif');

  // Create a slider for speed control
  speedSlider = createSlider(1, 10, 1); // Speed range from 1 to 10, default 1 (slow)
  speedSlider.position(240, height - 40); // Position the speed slider next to the step size slider
  speedSlider.style('width', '200px');

  // Create a label for the speed slider
  const speedLabel = createDiv('Adjust Speed:');
  speedLabel.position(240, height - 70); // Position above the speed slider
  speedLabel.style('font-size', '16px');
  speedLabel.style('color', 'white');
  speedLabel.style('font-family', 'Arial, sans-serif');

  // Create Start Over button
  const startOverButton = createButton('Start Over');
  startOverButton.position(windowWidth - 200, windowHeight - 60); // Move left from the bottom right corner
  startOverButton.mousePressed(() => location.reload()); // Refresh the page on press
  startOverButton.style('padding', '10px'); // Add padding to the button
  startOverButton.style('font-size', '16px');
  startOverButton.style('color', 'white');
  startOverButton.style('background-color', 'rgba(0, 0, 0, 0.5)'); // Semi-transparent background
  startOverButton.style('border', 'none');

  // Start the timer for 3 minutes
  timer = millis();

  timerIsDone = false; // Reset timer flag
  loop(); // Start the draw loop now that the user made a choice
}

// Random Walk class
class RandomWalk {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.color = color(255); // Start as white
    this.history = []; // Store history of positions
  }

  update(stepSize) {
    // Save current position for history
    this.history.push(this.position.copy());

    // Move randomly
    let step = p5.Vector.random2D();
    step.mult(stepSize); // Use the step size from the slider
    this.position.add(step);

    // Wrap around edges
    this.position.x = (this.position.x + width) % width;
    this.position.y = (this.position.y + height) % height;

    // Check for collisions with other walks
    for (let other of randomWalks) {
      if (other !== this && this.isIntersecting(other)) {
        this.color = color(random(255), random(255), random(255)); // Change to a random color
        other.color = this.color; // Change other walk color
      }
    }
  }

  isIntersecting(other) {
    for (let pos of other.history) {
      if (this.position.dist(pos) < 10) { // Increase distance threshold for intersection
        return true;
      }
    }
    return false;
  }

  display() {
    stroke(this.color);
    strokeWeight(5); // Increase point size for visibility
    point(this.position.x, this.position.y); // Draw current position

    // Draw history without fading out
    for (let i = 0; i < this.history.length; i++) {
      stroke(this.color);
      strokeWeight(3); // Slightly smaller trail size
      point(this.history[i].x, this.history[i].y);
    }
  }
}

// Function to generate random colors for the gradient
function generateRandomColors() {
  color1 = color(random(255), random(255), random(255)); // Random color 1
  color2 = color(random(255), random(255), random(255)); // Random color 2
}

// Add event listeners to the buttons
window.addEventListener('load', () => {
  document.getElementById("headsButton").addEventListener("click", () => startSketch('heads'));
  document.getElementById("tailsButton").addEventListener("click", () => startSketch('tails'));
});

// Resize the canvas when the window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Resize the canvas
}





















