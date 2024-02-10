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
$(document).ready(function() {
    // メニューバーのリンクにクリックイベントリスナーを追加
    $('.nav-link').click(function(e) {
        e.preventDefault(); // デフォルトのアンカー動作をキャンセル
        var targetId = $(this).data('target'); // リンクのdata-target属性からIDを取得
        $('.content-section').hide(); // すべてのコンテンツセクションを非表示にする
        $('#' + targetId).show(); // クリックされたリンクに対応するコンテンツセクションを表示
    });

    // ページ読み込み時に最初のコンテンツセクションを表示
    $('.content-section').hide(); // 最初にすべて非表示
    $('#homeContent').show(); // homeContentだけ表示
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
    var mainContent = document.getElementById("main_content");

    // サイドバーの表示状態を切り替え
    sidebar.classList.toggle("closed");

    // メニューアイコンの表示を切り替え
    var menuIcon = document.getElementById("menu-icon");
    if (sidebar.classList.contains("closed")) {
        menuIcon.textContent = "menu_open";
        mainContent.style.width = "100%";
        mainContent.style.marginLeft = "0";
    } else {
        menuIcon.textContent = "menu";
        mainContent.style.width = "calc(100% - 250px)"; // サイドバーの幅を考慮
        mainContent.style.marginLeft = "250px";
    }
}
document.addEventListener('click', function(event) {
    var sidebar = document.getElementById('sidebarMenu');
    var openSidebarMenu = document.getElementById('openSidebarMenu');
    var sidebarIconToggle = document.querySelector('.sidebarIconToggle');
    var isClickInsideSidebar = sidebar.contains(event.target);
    var isSidebarCheckbox = event.target === openSidebarMenu;
    var isToggleIcon = sidebarIconToggle.contains(event.target);

    // サイドバーの外側をクリックし、サイドバーを開くためのチェックボックスやトグルアイコンではない場合
    if (!isClickInsideSidebar && !isSidebarCheckbox && !isToggleIcon) {
        // サイドバーを閉じる
        openSidebarMenu.checked = false;
    }
});
////////////////
//ニュースの表示
////////////////
$(document).ready(function() {
    $.getJSON('/get_rss_feed', function(data) {
        var items = [];
        $.each(data, function(index, val) {
            // 日付を単純な文字列として表示
            var listItem = "<li class='news_list_item'>" +
                           "<div class='news_list_date'>" + val.pubDate + "</div>" +
                           "<a href='" + val.link + "'target='_blank'>" +
                           "<br /><p>" + val.title + "</p>" +
                           "</a></li>";
            items.push(listItem);
        });
        $("#webAdNewsList").html(items.join(""));
    });
});
////////////////////////////
//規定チェックのトグル関数
////////////////////////////
$(document).ready(function() {
    // 最初にG検索以外を隠す
    $("#infoGDN, #infoYSA, #infoYDA").hide();

    // トグルボタンのクリックイベントハンドラーを設定
    $(".toggle-btn").click(function() {
        // クリックされたボタンに対応する情報のIDを取得
        var targetId = $(this).data("target");
        
        // すべてのトグルコンテンツを隠す
        $(".toggle-content").hide();
        
        // ターゲットのトグルコンテンツを表示
        $("#" + targetId).show();
    });
});
////////////////////
//文字数カウント関数
////////////////////
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('textCounterInput').addEventListener('input', function() {
        const text = this.value;
        let halfWidthCount = 0;
        let fullWidthCount = 0;
        let totalCount = 0;

        for (let i = 0; i < text.length; i++) {
            const char = text.charAt(i);
            if (char.match(/[^\x01-\x7E\xA1-\xDF]/)) {
                fullWidthCount += 1;
                totalCount += 2; // 全角文字は2としてカウント
            } else {
                halfWidthCount += 1;
                totalCount += 1; // 半角文字は1としてカウント
            }
        }

        document.getElementById('halfWidthCount').textContent = halfWidthCount;
        document.getElementById('fullWidthCount').textContent = fullWidthCount;
        document.getElementById('textCharCount').textContent = totalCount;

        // 文字数が30を超えた場合の処理
        if (totalCount > 30) {
            this.style.borderColor = 'red'; // テキストボックスの枠を赤くする
            document.getElementById('textAlert').style.display = 'block'; // アラートを表示
        } else {
            this.style.borderColor = ''; // テキストボックスの枠を元に戻す
            document.getElementById('textAlert').style.display = 'none'; // アラートを非表示
        }
    });
});
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('selectOption').addEventListener('change', function() {
        // 全てのテキストボックスを非表示にする
        document.getElementById('textGSearch').style.display = 'none';
        document.getElementById('textGDN').style.display = 'none';
        document.getElementById('textYSA').style.display = 'none';
        document.getElementById('textYDN').style.display = 'none';

        // 選択されたオプションに応じてテキストボックスを表示
        const selectedOption = this.value;
        if (selectedOption === 'GSearch') {
            document.getElementById('textGSearch').style.display = 'block';
        } else if (selectedOption === 'GDN') {
            document.getElementById('textGDN').style.display = 'block';
        } else if (selectedOption === 'YSA') {
            document.getElementById('textYSA').style.display = 'block';
        } else if (selectedOption === 'YDN') {
            document.getElementById('textYDN').style.display = 'block';
        }
    });
});
//////////////////////////
//G検索テキストボックス拡張
//////////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const gsaadTitlesContainer = document.getElementById('gsaadTitlesContainer');
    const gsaadDescriptionsContainer = document.getElementById('gsaadDescriptionsContainer');
    const gsaadPathsContainer = document.getElementById('gsaadPathsContainer');

    // 広告見出しの追加
    gsaadTitlesContainer.addEventListener('input', function(e) {
        addNewTextboxIfNeeded(e.target, gsaadTitlesContainer, 'gsaadTitleInput', '広告見出しを入力', 'gsaadTitleCount', 15);
    });

    // 説明文の追加
    gsaadDescriptionsContainer.addEventListener('input', function(e) {
        addNewTextboxIfNeeded(e.target, gsaadDescriptionsContainer, 'gsaadDescriptionInput', '説明文を入力', 'gsaadDescriptionCount', 4);
    });

    // パスの追加
    gsaadPathsContainer.addEventListener('input', function(e) {
        addNewTextboxIfNeeded(e.target, gsaadPathsContainer, 'gsaadPathInput', 'パスを入力', 'gsaadPathCount', 2);
    });

    function addNewTextboxIfNeeded(target, container, inputClass, placeholder, countClass, maxCount) {
        const index = parseInt(target.getAttribute('data-index'), 10);
        const totalCount = container.querySelectorAll(`.${inputClass}`).length;
        if (index === totalCount && totalCount < maxCount) {
            const newIndex = totalCount + 1;
            const newRow = document.createElement('div');
            newRow.classList.add('row', 'mb-3');
            newRow.innerHTML = `
                <div class="col-md-8">
                    <input type="text" class="form-control ${inputClass}" placeholder="${placeholder}" data-index="${newIndex}">
                </div>
                <div class="col-md-4">
                    <div class="character-counts">
                        <p>文字数: <span class="${countClass}" data-index="${newIndex}">0</span></p>
                    </div>
                </div>
            `;
            container.appendChild(newRow);
        }
    }
});
//////////////////////////
//GDNテキストボックス拡張
//////////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const gsaadTitlesContainer = document.getElementById('gdnadTitlesContainer');
    const gsaadDescriptionsContainer = document.getElementById('gdnadDescriptionsContainer');
    const gsaadPathsContainer = document.getElementById('gdnadPathsContainer');

    // 広告見出しの追加
    gsaadTitlesContainer.addEventListener('input', function(e) {
        addNewTextboxIfNeeded(e.target, gsaadTitlesContainer, 'gdnadTitleInput', '広告見出しを入力', 'gsaadTitleCount', 5);
    });

    // 説明文の追加
    gsaadDescriptionsContainer.addEventListener('input', function(e) {
        addNewTextboxIfNeeded(e.target, gsaadDescriptionsContainer, 'gdnadDescriptionInput', '長い広告見出しを入力', 'gsaadDescriptionCount', 1);
    });

    // パスの追加
    gsaadPathsContainer.addEventListener('input', function(e) {
        addNewTextboxIfNeeded(e.target, gsaadPathsContainer, 'gdnadPathInput', '説明文を入力', 'gsaadPathCount', 5);
    });

    function addNewTextboxIfNeeded(target, container, inputClass, placeholder, countClass, maxCount) {
        const index = parseInt(target.getAttribute('data-index'), 10);
        const totalCount = container.querySelectorAll(`.${inputClass}`).length;
        if (index === totalCount && totalCount < maxCount) {
            const newIndex = totalCount + 1;
            const newRow = document.createElement('div');
            newRow.classList.add('row', 'mb-3');
            newRow.innerHTML = `
                <div class="col-md-8">
                    <input type="text" class="form-control ${inputClass}" placeholder="${placeholder}" data-index="${newIndex}">
                </div>
                <div class="col-md-4">
                    <div class="character-counts">
                        <p>文字数: <span class="${countClass}" data-index="${newIndex}">0</span></p>
                    </div>
                </div>
            `;
            container.appendChild(newRow);
        }
    }
});
//////////////////////////
//YSAテキストボックス拡張
//////////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const gsaadTitlesContainer = document.getElementById('ysaadTitlesContainer');
    const gsaadDescriptionsContainer = document.getElementById('ysaadDescriptionsContainer');
    const gsaadPathsContainer = document.getElementById('ysaadPathsContainer');

    // 広告見出しの追加
    gsaadTitlesContainer.addEventListener('input', function(e) {
        addNewTextboxIfNeeded(e.target, gsaadTitlesContainer, 'ysaadTitleInput', '広告見出しを入力', 'gsaadTitleCount', 15);
    });

    // 説明文の追加
    gsaadDescriptionsContainer.addEventListener('input', function(e) {
        addNewTextboxIfNeeded(e.target, gsaadDescriptionsContainer, 'ysaadDescriptionInput', '説明文を入力', 'gsaadDescriptionCount', 4);
    });

    // パスの追加
    gsaadPathsContainer.addEventListener('input', function(e) {
        addNewTextboxIfNeeded(e.target, gsaadPathsContainer, 'ysaadPathInput', 'パスを入力', 'gsaadPathCount', 2);
    });

    function addNewTextboxIfNeeded(target, container, inputClass, placeholder, countClass, maxCount) {
        const index = parseInt(target.getAttribute('data-index'), 10);
        const totalCount = container.querySelectorAll(`.${inputClass}`).length;
        if (index === totalCount && totalCount < maxCount) {
            const newIndex = totalCount + 1;
            const newRow = document.createElement('div');
            newRow.classList.add('row', 'mb-3');
            newRow.innerHTML = `
                <div class="col-md-8">
                    <input type="text" class="form-control ${inputClass}" placeholder="${placeholder}" data-index="${newIndex}">
                </div>
                <div class="col-md-4">
                    <div class="character-counts">
                        <p>文字数: <span class="${countClass}" data-index="${newIndex}">0</span></p>
                    </div>
                </div>
            `;
            container.appendChild(newRow);
        }
    }
});