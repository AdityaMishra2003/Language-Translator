// public/script.js

function fetchHistory() {
    fetch('/history')
      .then(response => response.json())
      .then(data => {
        const historyDiv = document.getElementById('history');
        historyDiv.innerHTML = '';
        data.forEach(item => {
          historyDiv.innerHTML += `<p>${item.inputText} - ${item.translatedText}</p>`;
        });
      })
      .catch(error => console.error('Error fetching history:', error));
  }
  