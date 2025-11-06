const scoreElement = document.getElementById('score');
const messageElement = document.getElementById('message');

function updateScore(score) {
  scoreElement.innerText = `Score: ${score}`;
}

function showMessage(message) {
  messageElement.innerText = message;
  messageElement.style.display = 'block';
}

function hideMessage() {
  messageElement.style.display = 'none';
}

export { updateScore, showMessage, hideMessage };
