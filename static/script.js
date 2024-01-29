/////////////////////////
//キーワード作成画面の関数
/////////////////////////
function generateKeywords() {
    var baseKeyword = document.getElementById('keywordInput').value; //キーワードを取得
    var industry = document.getElementById('industryInput').value; //業界を取得
    var appeal = document.getElementById('appealInput').value; //訴求内容を取得
    var prefectureName = $("#prefectureInput option:selected").text(); // 都道府県名を取得
    var city = $("#cityInput option:selected").text(); // 市区町村名を取得
    var generateButton = document.getElementById('generateButton'); //生成ボタン
    var loadingButton = document.getElementById('loadingButton'); //生成ボタン（Lording中）
    var keywordsDisplay = document.getElementById('keywordsDisplay'); //生成結果

    // ボタンの表示を切り替え
    generateButton.style.display = 'none';
    loadingButton.style.display = 'block';

    // POSTリクエスト
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
/////////////////////////////////////
// 都道府県から、市区町村を読み込む関数
/////////////////////////////////////
$(document).ready(function () {
    $('#prefectureInput').change(function () {
        var prefectureCode = $(this).val();
        var citySelect = $('#cityInput');
        citySelect.empty();

        if (prefectureCode) {
            fetch(`https://www.land.mlit.go.jp/webland/api/CitySearch?area=${prefectureCode}`) // 国土地理院のAPI
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
$(document).ready(function () {
    $('#regionInput').select2({
        placeholder: "配信地域を選択",
        allowClear: true
    });
});

////////////////////////////////
// クリップボードにコピーする関数
////////////////////////////////
function copyToClipboard() {
    var textToCopy = document.getElementById('keywordsDisplay').innerText;
    navigator.clipboard.writeText(textToCopy).then(function () {
        // コピー成功時のアラート
        alert('コピーしました');
    }).catch(function (err) {
        // コピー失敗時のエラーハンドリング
        console.error('コピーに失敗しました: ', err);
        alert('コピーに失敗しました');
    });
}

///////////////////////////////////////////////////////////
//Ajaxに対して、メインコンテンツを変更するためのリクエスト送信
///////////////////////////////////////////////////////////
$(document).ready(function () {
    $('.nav-link').click(function (e) {
        e.preventDefault(); // デフォルトのリンク動作を防止

        // アクティブなスタイルの切り替え
        $('.nav-link').removeClass('active');
        $(this).addClass('active');

        // コンテンツセクションの表示切り替え
        var targetId = $(this).attr('href').substring(1);
        $('.content-section').hide();
        $('#' + targetId).show();
    });
});

//////////////////////////
// 入力内容をクリアする関数
//////////////////////////
function clearInputs() {
    document.getElementById("keywordInput").value = '';
    document.getElementById("industryInput").value = '';
    document.getElementById("appealInput").value = '';
    document.getElementById("prefectureInput").selectedIndex = 0; // 最初のオプションを選択
    document.getElementById("cityInput").selectedIndex = 0; // 最初のオプションを選択
}

/////////////////////
// モーダルを開く関数
/////////////////////
function openModal() {
    document.getElementById("myModal").style.display = "block";
}

///////////////////////
// モーダルを閉じる関数
///////////////////////
function closeModal() {
    document.getElementById("myModal").style.display = "none";
}
///////////////////////////////////
// 画面外のクリックでモーダルを閉じる
///////////////////////////////////
window.onclick = function(event) {
    if (event.target == document.getElementById("myModal")) {
        document.getElementById("myModal").style.display = "none";
    }
}
function toggleSidebar() {
    var sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("closed");

    var menuIcon = document.getElementById("menu-icon");
    if (sidebar.classList.contains("closed")) {
        menuIcon.textContent = "menu_open";
    } else {
        menuIcon.textContent = "menu";
    }
}

