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
    // 文字数カウント関数
    function updateCharacterCount(inputElement) {
        const index = inputElement.getAttribute('data-index');
        const inputType = inputElement.classList.contains('gsaadTitleInput') ? 'Title' : 
                          inputElement.classList.contains('gsaadDescriptionInput') ? 'Description' : 'Path';
        
        const halfCountElement = document.querySelector(`.gsaad${inputType}HalfCount[data-index="${index}"]`);
        const fullCountElement = document.querySelector(`.gsaad${inputType}FullCount[data-index="${index}"]`);
        const totalCountElement = document.querySelector(`.gsaad${inputType}TotalCount[data-index="${index}"]`);
        
        let halfCount = 0;
        let fullCount = 0;
        for (let char of inputElement.value) {
            if (char.match(/[^\x01-\x7E\xA1-\xDF]/)) {
                fullCount += 2;
            } else {
                halfCount += 1;
            }
        }
        
        halfCountElement.textContent = halfCount;
        fullCountElement.textContent = fullCount / 2; // 全角文字は2としてカウント
        totalCountElement.textContent = halfCount + fullCount;
    }

    // 全てのテキストボックスにイベントリスナーを設定
    const allInputs = document.querySelectorAll('.gsaadTitleInput, .gsaadDescriptionInput, .gsaadPathInput');
    allInputs.forEach(input => {
        updateCharacterCount(input); // 初期ロード時に文字数を更新
        input.addEventListener('input', () => updateCharacterCount(input));
    });
});
document.addEventListener('DOMContentLoaded', function() {
    // 文字数カウント関数の定義
    function updateCharacterCount(inputElement) {
        const index = inputElement.getAttribute('data-index');
        const inputType = inputElement.classList.contains('gdnadTitleInput') ? 'Title' : 
                          inputElement.classList.contains('gdnadDescriptionInput') ? 'Description' : 'Path';
        
        const halfCountElement = document.querySelector(`.gdnad${inputType}HalfCount[data-index="${index}"]`);
        const fullCountElement = document.querySelector(`.gdnad${inputType}FullCount[data-index="${index}"]`);
        const totalCountElement = document.querySelector(`.gdnad${inputType}TotalCount[data-index="${index}"]`);
        
        let halfCount = 0;
        let fullCount = 0;
        for (let char of inputElement.value) {
            if (char.match(/[^\x01-\x7E\xA1-\xDF]/)) {
                fullCount += 2; // 全角文字を2としてカウント
            } else {
                halfCount += 1; // 半角文字をカウント
            }
        }
        
        // 対応する要素に文字数を設定
        halfCountElement.textContent = halfCount;
        fullCountElement.textContent = fullCount / 2; // 全角文字を2としてカウントしているので、表示時には2で割る
        totalCountElement.textContent = halfCount + fullCount;
    }

    // 全てのテキストボックスにイベントリスナーを設定
    document.querySelectorAll('.gdnadTitleInput, .gdnadDescriptionInput, .gdnadPathInput').forEach(input => {
        input.addEventListener('input', () => updateCharacterCount(input));
    });
});
document.addEventListener('DOMContentLoaded', function() {
    // 文字数カウント関数
    function updateCharacterCount(inputElement) {
        const index = inputElement.getAttribute('data-index');
        const inputType = inputElement.classList.contains('ysaadTitleInput') ? 'Title' : 
                          inputElement.classList.contains('ysaadDescriptionInput') ? 'Description' : 'Path';
        
        const halfCountElement = document.querySelector(`.ysaad${inputType}HalfCount[data-index="${index}"]`);
        const fullCountElement = document.querySelector(`.ysaad${inputType}FullCount[data-index="${index}"]`);
        const totalCountElement = document.querySelector(`.ysaad${inputType}TotalCount[data-index="${index}"]`);
        
        let halfCount = 0;
        let fullCount = 0;
        for (let char of inputElement.value) {
            if (char.match(/[^\x01-\x7E\xA1-\xDF]/)) {
                fullCount += 2;
            } else {
                halfCount += 1;
            }
        }
        
        halfCountElement.textContent = halfCount;
        fullCountElement.textContent = fullCount / 2; // 全角文字は2としてカウント
        totalCountElement.textContent = halfCount + fullCount;
    }

    // 全てのテキストボックスにイベントリスナーを設定
    const allInputs = document.querySelectorAll('.ysaadTitleInput, .ysaadDescriptionInput, .ysaadPathInput');
    allInputs.forEach(input => {
        updateCharacterCount(input); // 初期ロード時に文字数を更新
        input.addEventListener('input', () => updateCharacterCount(input));
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // 文字数カウント関数
    function updateCharacterCount(inputElement) {
        const index = inputElement.getAttribute('data-index');
        const inputType = inputElement.classList.contains('ydaadTitleInput') ? 'Title' : 
                          inputElement.classList.contains('ydaadDescriptionInput') ? 'Description' : 'Path';
        
        const halfCountElement = document.querySelector(`.ydaad${inputType}HalfCount[data-index="${index}"]`);
        const fullCountElement = document.querySelector(`.ydaad${inputType}FullCount[data-index="${index}"]`);
        const totalCountElement = document.querySelector(`.ydaad${inputType}TotalCount[data-index="${index}"]`);
        
        let halfCount = 0;
        let fullCount = 0;
        for (let char of inputElement.value) {
            if (char.match(/[^\x01-\x7E\xA1-\xDF]/)) {
                fullCount += 2;
            } else {
                halfCount += 1;
            }
        }
        
        halfCountElement.textContent = halfCount;
        fullCountElement.textContent = fullCount / 2; // 全角文字は2としてカウント
        totalCountElement.textContent = halfCount + fullCount;
    }

    // 全てのテキストボックスにイベントリスナーを設定
    const allInputs = document.querySelectorAll('.ydaadTitleInput, .ydaadDescriptionInput, .ydaadPathInput');
    allInputs.forEach(input => {
        updateCharacterCount(input); // 初期ロード時に文字数を更新
        input.addEventListener('input', () => updateCharacterCount(input));
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
    // 広告見出し、説明文、パスの各セクションに対する設定
    const sections = {
        'gsaadTitlesContainer': { maxCount: 15, placeholder: '広告見出しを入力', inputClass: 'gsaadTitleInput', countClassPrefix: 'gsaadTitle' },
        'gsaadDescriptionsContainer': { maxCount: 4, placeholder: '説明文を入力', inputClass: 'gsaadDescriptionInput', countClassPrefix: 'gsaadDescription' },
        'gsaadPathsContainer': { maxCount: 2, placeholder: 'パスを入力', inputClass: 'gsaadPathInput', countClassPrefix: 'gsaadPath' }
    };

    // 各セクションに対して処理を適用
    Object.entries(sections).forEach(([containerId, { maxCount, placeholder, inputClass, countClassPrefix }]) => {
        const container = document.getElementById(containerId);

        // 既存のテキストボックスに対するイベントリスナーを設定
        container.querySelectorAll(`.${inputClass}`).forEach(input => {
            attachInputListener(input, countClassPrefix);
        });

        // 新しいテキストボックスの追加を監視
        container.addEventListener('input', e => {
            if (!e.target.matches(`.${inputClass}`)) return;
            const index = parseInt(e.target.getAttribute('data-index'), 10);
            const totalCount = container.querySelectorAll(`.${inputClass}`).length;
            if (index === totalCount && totalCount < maxCount) {
                const newIndex = totalCount + 1;
                addNewTextbox(container, newIndex, inputClass, placeholder, countClassPrefix);
            }
        });
    });

    // 新しいテキストボックスを追加する関数
    function addNewTextbox(container, index, inputClass, placeholder, countClassPrefix) {
        const newRow = document.createElement('div');
        newRow.classList.add('row', 'mb-3');
        newRow.innerHTML = `
            <div class="col-md-8">
                <input type="text" class="form-control ${inputClass}" placeholder="${placeholder}" data-index="${index}">
            </div>
            <div class="col-md-4">
                <div class="character-counts">
                    <p>半角: <span class="${countClassPrefix}HalfCount" data-index="${index}">0</span></p>
                    <p>全角: <span class="${countClassPrefix}FullCount" data-index="${index}">0</span></p>
                    <p>合計: <span class="${countClassPrefix}TotalCount" data-index="${index}">0</span></p>
                </div>
            </div>
        `;
        container.appendChild(newRow);
        attachInputListener(newRow.querySelector(`.${inputClass}`), countClassPrefix);
    }

    // テキストボックスの文字数をカウントする関数
    function countTextCharacters(inputElement, countClassPrefix) {
        const text = inputElement.value;
        let halfWidthCount = 0;
        let fullWidthCount = 0;
        for (let i = 0; i < text.length; i++) {
            if (text.charCodeAt(i) > 255) {
                fullWidthCount += 2; // 全角文字を2としてカウント
            } else {
                halfWidthCount += 1; // 半角文字をカウント
            }
        }
        const index = inputElement.getAttribute('data-index');
        const halfCountElement = document.querySelector(`.${countClassPrefix}HalfCount[data-index="${index}"]`);
        const fullCountElement = document.querySelector(`.${countClassPrefix}FullCount[data-index="${index}"]`);
        const totalCountElement = document.querySelector(`.${countClassPrefix}TotalCount[data-index="${index}"]`);

        if (halfCountElement) halfCountElement.textContent = halfWidthCount;
        if (fullCountElement) fullCountElement.textContent = fullWidthCount / 2; // 全角文字は2としてカウントしているため、表示時には半分にする
        if (totalCountElement) totalCountElement.textContent = halfWidthCount + fullWidthCount;
    }

    // テキストボックスにイベントリスナーを設定する関数
    function attachInputListener(inputElement, countClassPrefix) {
        inputElement.addEventListener('input', () => countTextCharacters(inputElement, countClassPrefix));
    }
});
//////////////////////////
//GDNテキストボックス拡張
//////////////////////////
document.addEventListener('DOMContentLoaded', function() {
    // 広告見出し、説明文、パスの各セクションに対する設定
    const sections = {
        'gdnadTitlesContainer': { maxCount: 5, placeholder: '広告見出しを入力', inputClass: 'gdnadTitleInput', countClassPrefix: 'gdnadTitle' },
        'gdnadPathsContainer': { maxCount: 5, placeholder: '説明文を入力', inputClass: 'gdnadPathInput', countClassPrefix: 'gdnadPath' }
    };

    // 各セクションに対して処理を適用
    Object.entries(sections).forEach(([containerId, { maxCount, placeholder, inputClass, countClassPrefix }]) => {
        const container = document.getElementById(containerId);

        // 既存のテキストボックスに対するイベントリスナーを設定
        container.querySelectorAll(`.${inputClass}`).forEach(input => {
            attachInputListener(input, countClassPrefix);
        });

        // 新しいテキストボックスの追加を監視
        container.addEventListener('input', e => {
            if (!e.target.matches(`.${inputClass}`)) return;
            const index = parseInt(e.target.getAttribute('data-index'), 10);
            const totalCount = container.querySelectorAll(`.${inputClass}`).length;
            if (index === totalCount && totalCount < maxCount) {
                const newIndex = totalCount + 1;
                addNewTextbox(container, newIndex, inputClass, placeholder, countClassPrefix);
            }
        });
    });

    // 新しいテキストボックスを追加する関数
    function addNewTextbox(container, index, inputClass, placeholder, countClassPrefix) {
        const newRow = document.createElement('div');
        newRow.classList.add('row', 'mb-3');
        newRow.innerHTML = `
            <div class="col-md-8">
                <input type="text" class="form-control ${inputClass}" placeholder="${placeholder}" data-index="${index}">
            </div>
            <div class="col-md-4">
                <div class="character-counts">
                    <p>半角: <span class="${countClassPrefix}HalfCount" data-index="${index}">0</span></p>
                    <p>全角: <span class="${countClassPrefix}FullCount" data-index="${index}">0</span></p>
                    <p>合計: <span class="${countClassPrefix}TotalCount" data-index="${index}">0</span></p>
                </div>
            </div>
        `;
        container.appendChild(newRow);
        attachInputListener(newRow.querySelector(`.${inputClass}`), countClassPrefix);
    }

    // テキストボックスの文字数をカウントする関数
    function countTextCharacters(inputElement, countClassPrefix) {
        const text = inputElement.value;
        let halfWidthCount = 0;
        let fullWidthCount = 0;
        for (let i = 0; i < text.length; i++) {
            if (text.charCodeAt(i) > 255) {
                fullWidthCount += 2; // 全角文字を2としてカウント
            } else {
                halfWidthCount += 1; // 半角文字をカウント
            }
        }
        const index = inputElement.getAttribute('data-index');
        const halfCountElement = document.querySelector(`.${countClassPrefix}HalfCount[data-index="${index}"]`);
        const fullCountElement = document.querySelector(`.${countClassPrefix}FullCount[data-index="${index}"]`);
        const totalCountElement = document.querySelector(`.${countClassPrefix}TotalCount[data-index="${index}"]`);

        if (halfCountElement) halfCountElement.textContent = halfWidthCount;
        if (fullCountElement) fullCountElement.textContent = fullWidthCount / 2; // 全角文字は2としてカウントしているため、表示時には半分にする
        if (totalCountElement) totalCountElement.textContent = halfWidthCount + fullWidthCount;
    }

    // テキストボックスにイベントリスナーを設定する関数
    function attachInputListener(inputElement, countClassPrefix) {
        inputElement.addEventListener('input', () => countTextCharacters(inputElement, countClassPrefix));
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const gdnadDescriptionInput = document.querySelector('.gdnadDescriptionInput');

    // 長い広告見出しの入力フィールドのイベントリスナー
    gdnadDescriptionInput.addEventListener('input', function() {
        const halfCountElement = document.querySelector('.gdnadDescriptionHalfCount');
        const fullCountElement = document.querySelector('.gdnadDescriptionFullCount');
        const totalCountElement = document.querySelector('.gdnadDescriptionTotalCount');

        let halfWidthCount = 0;
        let fullWidthCount = 0;

        // 入力されたテキストの全角・半角文字をカウント
        for (let char of this.value) {
            // 全角文字の判定
            if (char.match(/[^\x01-\x7E\xA1-\xDF]/)) {
                fullWidthCount += 1; // 全角文字は2文字としてカウント
            } else {
                halfWidthCount += 1; // 半角文字は1文字としてカウント
            }
        }

        // 合計文字数を計算（全角文字は2文字として加算）
        const totalCharacters = halfWidthCount + (fullWidthCount * 2);

        // 結果を表示
        halfCountElement.textContent = halfWidthCount;
        fullCountElement.textContent = fullWidthCount;
        totalCountElement.textContent = totalCharacters;
    });
});

//////////////////////////
//YSAテキストボックス拡張
//////////////////////////
document.addEventListener('DOMContentLoaded', function() {
    // 広告見出し、説明文、パスの各セクションに対する設定
    const sections = {
        'ysaadTitlesContainer': { maxCount: 15, placeholder: '広告見出しを入力', inputClass: 'ysaadTitleInput', countClassPrefix: 'ysaadTitle' },
        'ysaadDescriptionsContainer': { maxCount: 4, placeholder: '説明文を入力', inputClass: 'ysaadDescriptionInput', countClassPrefix: 'ysaadDescription' },
        'ysaadPathsContainer': { maxCount: 2, placeholder: 'パスを入力', inputClass: 'ysaadPathInput', countClassPrefix: 'ysaadPath' }
    };

    // 各セクションに対して処理を適用
    Object.entries(sections).forEach(([containerId, { maxCount, placeholder, inputClass, countClassPrefix }]) => {
        const container = document.getElementById(containerId);

        // 既存のテキストボックスに対するイベントリスナーを設定
        container.querySelectorAll(`.${inputClass}`).forEach(input => {
            attachInputListener(input, countClassPrefix);
        });

        // 新しいテキストボックスの追加を監視
        container.addEventListener('input', e => {
            if (!e.target.matches(`.${inputClass}`)) return;
            const index = parseInt(e.target.getAttribute('data-index'), 10);
            const totalCount = container.querySelectorAll(`.${inputClass}`).length;
            if (index === totalCount && totalCount < maxCount) {
                const newIndex = totalCount + 1;
                addNewTextbox(container, newIndex, inputClass, placeholder, countClassPrefix);
            }
        });
    });

    // 新しいテキストボックスを追加する関数
    function addNewTextbox(container, index, inputClass, placeholder, countClassPrefix) {
        const newRow = document.createElement('div');
        newRow.classList.add('row', 'mb-3');
        newRow.innerHTML = `
            <div class="col-md-8">
                <input type="text" class="form-control ${inputClass}" placeholder="${placeholder}" data-index="${index}">
            </div>
            <div class="col-md-4">
                <div class="character-counts">
                    <p>半角: <span class="${countClassPrefix}HalfCount" data-index="${index}">0</span></p>
                    <p>全角: <span class="${countClassPrefix}FullCount" data-index="${index}">0</span></p>
                    <p>合計: <span class="${countClassPrefix}TotalCount" data-index="${index}">0</span></p>
                </div>
            </div>
        `;
        container.appendChild(newRow);
        attachInputListener(newRow.querySelector(`.${inputClass}`), countClassPrefix);
    }

    // テキストボックスの文字数をカウントする関数
    function countTextCharacters(inputElement, countClassPrefix) {
        const text = inputElement.value;
        let halfWidthCount = 0;
        let fullWidthCount = 0;
        for (let i = 0; i < text.length; i++) {
            if (text.charCodeAt(i) > 255) {
                fullWidthCount += 2; // 全角文字を2としてカウント
            } else {
                halfWidthCount += 1; // 半角文字をカウント
            }
        }
        const index = inputElement.getAttribute('data-index');
        const halfCountElement = document.querySelector(`.${countClassPrefix}HalfCount[data-index="${index}"]`);
        const fullCountElement = document.querySelector(`.${countClassPrefix}FullCount[data-index="${index}"]`);
        const totalCountElement = document.querySelector(`.${countClassPrefix}TotalCount[data-index="${index}"]`);

        if (halfCountElement) halfCountElement.textContent = halfWidthCount;
        if (fullCountElement) fullCountElement.textContent = fullWidthCount / 2; // 全角文字は2としてカウントしているため、表示時には半分にする
        if (totalCountElement) totalCountElement.textContent = halfWidthCount + fullWidthCount;
    }

    // テキストボックスにイベントリスナーを設定する関数
    function attachInputListener(inputElement, countClassPrefix) {
        inputElement.addEventListener('input', () => countTextCharacters(inputElement, countClassPrefix));
    }
});
//////////////////////////
//YDAテキストボックス拡張
//////////////////////////
document.addEventListener('DOMContentLoaded', function() {
    // 広告見出し、説明文、パスの各セクションに対する設定
    const sections = {
        'ydaadTitlesContainer': { maxCount: 15, placeholder: 'タイトルを入力', inputClass: 'ydaadTitleInput', countClassPrefix: 'ydaadTitle' },
        'ydaadDescriptionsContainer': { maxCount: 4, placeholder: '説明文を入力', inputClass: 'ydaadDescriptionInput', countClassPrefix: 'ydaadDescription' },
    };

    // 各セクションに対して処理を適用
    Object.entries(sections).forEach(([containerId, { maxCount, placeholder, inputClass, countClassPrefix }]) => {
        const container = document.getElementById(containerId);

        // 既存のテキストボックスに対するイベントリスナーを設定
        container.querySelectorAll(`.${inputClass}`).forEach(input => {
            attachInputListener(input, countClassPrefix);
        });

        // 新しいテキストボックスの追加を監視
        container.addEventListener('input', e => {
            if (!e.target.matches(`.${inputClass}`)) return;
            const index = parseInt(e.target.getAttribute('data-index'), 10);
            const totalCount = container.querySelectorAll(`.${inputClass}`).length;
            if (index === totalCount && totalCount < maxCount) {
                const newIndex = totalCount + 1;
                addNewTextbox(container, newIndex, inputClass, placeholder, countClassPrefix);
            }
        });
    });

    // 新しいテキストボックスを追加する関数
    function addNewTextbox(container, index, inputClass, placeholder, countClassPrefix) {
        const newRow = document.createElement('div');
        newRow.classList.add('row', 'mb-3');
        newRow.innerHTML = `
            <div class="col-md-8">
                <input type="text" class="form-control ${inputClass}" placeholder="${placeholder}" data-index="${index}">
            </div>
            <div class="col-md-4">
                <div class="character-counts">
                    <p>半角: <span class="${countClassPrefix}HalfCount" data-index="${index}">0</span></p>
                    <p>全角: <span class="${countClassPrefix}FullCount" data-index="${index}">0</span></p>
                    <p>合計: <span class="${countClassPrefix}TotalCount" data-index="${index}">0</span></p>
                </div>
            </div>
        `;
        container.appendChild(newRow);
        attachInputListener(newRow.querySelector(`.${inputClass}`), countClassPrefix);
    }

    // テキストボックスの文字数をカウントする関数
    function countTextCharacters(inputElement, countClassPrefix) {
        const text = inputElement.value;
        let halfWidthCount = 0;
        let fullWidthCount = 0;
        for (let i = 0; i < text.length; i++) {
            if (text.charCodeAt(i) > 255) {
                fullWidthCount += 2; // 全角文字を2としてカウント
            } else {
                halfWidthCount += 1; // 半角文字をカウント
            }
        }
        const index = inputElement.getAttribute('data-index');
        const halfCountElement = document.querySelector(`.${countClassPrefix}HalfCount[data-index="${index}"]`);
        const fullCountElement = document.querySelector(`.${countClassPrefix}FullCount[data-index="${index}"]`);
        const totalCountElement = document.querySelector(`.${countClassPrefix}TotalCount[data-index="${index}"]`);

        if (halfCountElement) halfCountElement.textContent = halfWidthCount;
        if (fullCountElement) fullCountElement.textContent = fullWidthCount / 2; // 全角文字は2としてカウントしているため、表示時には半分にする
        if (totalCountElement) totalCountElement.textContent = halfWidthCount + fullWidthCount;
    }

    // テキストボックスにイベントリスナーを設定する関数
    function attachInputListener(inputElement, countClassPrefix) {
        inputElement.addEventListener('input', () => countTextCharacters(inputElement, countClassPrefix));
    }
});