function generateKeywords() {
    var baseKeyword = document.getElementById('keywordInput').value;
    fetch('/generate_keywords', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'base_keyword': baseKeyword })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('keywordsDisplay').innerText = data.ad_keywords;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
