function generateKeywords() {
    var baseKeyword = document.getElementById('keywordInput').value;
    var industry = document.getElementById('industryInput').value;
    var appeal = document.getElementById('appealInput').value;
    var prefectureName = $("#prefectureInput option:selected").text(); // 都道府県名を取得
    var city = $("#cityInput option:selected").text(); // 市区町村名を取得
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
        body: JSON.stringify({ 
            'base_keyword': baseKeyword, 
            'industry': industry, 
            'region': city, 
            'appeal': appeal,
            'prefecture': prefectureName 
        })
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
        var prefectureName = $("#prefectureInput option:selected").text(); // 選択された都道府県の名前
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
function copyToClipboard() {
    var textToCopy = document.getElementById('keywordsDisplay').innerText;
    navigator.clipboard.writeText(textToCopy).then(function() {
        // コピー成功時のアラート
        alert('コピーしました');
    }).catch(function(err) {
        // コピー失敗時のエラーハンドリング
        console.error('コピーに失敗しました: ', err);
        alert('コピーに失敗しました');
    });
}
    