document.getElementById('generateButton').addEventListener('click', async () => {
    const prompt = document.getElementById('promptInput').value;
    
    // Send a request to your backend API
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    });
    
    if (response.ok) {
        const data = await response.json();
        document.getElementById('resultText').innerText = data.result; // Adjust based on your backend response
    } else {
        document.getElementById('resultText').innerText = 'Error generating content. Please try again.';
    }
});

