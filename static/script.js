function generateKeywords() {
    var baseKeyword = document.getElementById('keywordInput').value;
    var industry = document.getElementById('industryInput').value;
    var appeal = document.getElementById('appealInput').value;
    var prefecture = document.getElementById('prefectureInput').value;
    var city = document.getElementById('cityInput').value;
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
        body: JSON.stringify({ 'base_keyword': baseKeyword, 'industry': industry, 'appeal': appeal, 'prefecture':prefecture, 'city':city })
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
$(document).ready(function () {
    $('#prefectureInput').change(function () {
        var prefectureCode = $(this).val();
        var citySelect = $('#cityInput');
        citySelect.empty();

        if (prefectureCode) {
            fetch(`https://www.land.mlit.go.jp/webland/api/CitySearch?area=${prefectureCode}`)
                .then(response => response.json())
                .then(data => {
                    citySelect.append($('<option>', { value: '', text: '市区町村を選択' }));
                    data.data.forEach(function (city) {
                        citySelect.append($('<option>', { value: city.id, text: city.name }));
                    });
                })
                .catch(error => console.error('Error:', error));
        } else {
            citySelect.append($('<option>', { value: '', text: '市区町村を選択' }));
        }
    });
});
$(document).ready(function() {
    $('#regionInput').select2({
        placeholder: "配信地域を選択",
        allowClear: true
    });
});
    