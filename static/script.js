function generateKeywords() {
    var baseKeyword = document.getElementById('keywordInput').value;
    var industry = document.getElementById('industryInput').value;
    var region = document.getElementById('regionInput').value;
    var appeal = document.getElementById('appealInput').value;
    var generateButton = document.getElementById('generateButton');
    var loadingButton = document.getElementById('loadingButton');
    var keywordsDisplay = document.getElementById('keywordsDisplay');
    
    // ボタンの表示を切り替え
    generateButton.style.display = 'none';
    loadingButton.style.display = 'block';

    fetch('/generate_keywords', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'base_keyword': baseKeyword, 'industry': industry, 'region': region, 'appeal':appeal })
    })
    .then(response => response.json())
    .then(data => {
        keywordsDisplay.innerText = data.ad_keywords;
    })
    .catch((error) => {
        console.error('Error:', error);
        keywordsDisplay.innerText = 'エラーが発生しました。';
    })
    .finally(() => {
        // ボタンの表示を元に戻す
        loadingButton.style.display = 'none';
        generateButton.style.display = 'block';
    });
}
