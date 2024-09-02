/////////////////////////
//キーワード作成画面の関数
/////////////////////////
function generateKeywords() {
    var baseKeyword = document.getElementById('keywordInput').value; //キーワードを取得
    var industry = document.getElementById('industryInput').value; //業界を取得
    var appeal = document.getElementById('appealInput').value; //訴求内容を取得
    var target = document.getElementById('tergetInput').value; //ターゲットを取得
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
            'target': target,
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
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-target');

        // すべてのセクションを非表示にする
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // クリックされたリンクに対応するセクションを表示する
        document.getElementById(targetId).style.display = 'block';
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

///////////////////////////////////
// 画面外のクリックでモーダルを閉じる
///////////////////////////////////
window.onclick = function (event) {
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
document.addEventListener('click', function (event) {
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
$(document).ready(function () {
    $.getJSON('/get_rss_feed', function (data) {
        var items = [];
        $.each(data, function (index, val) {
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
$(document).ready(function () {
    // 最初にG検索以外を隠す
    $("#infoGDN, #infoYSA, #infoYDA").hide();

    // トグルボタンのクリックイベントハンドラーを設定
    $(".toggle-btn").click(function () {
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
document.addEventListener('DOMContentLoaded', function () {
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
                // 全角文字は2としてカウント
                fullCount += 1;
            } else {
                halfCount += 1;
            }
        }

        // 全角文字数を2倍して合計に加算
        const totalCharacters = halfCount + (fullCount * 2);

        halfCountElement.textContent = halfCount;
        fullCountElement.textContent = fullCount; // 全角文字を1として表示
        totalCountElement.textContent = totalCharacters; // 合計は半角1文字、全角2文字として計算
    }

    // 全てのテキストボックスにイベントリスナーを設定
    const allInputs = document.querySelectorAll('.gsaadTitleInput, .gsaadDescriptionInput, .gsaadPathInput');
    allInputs.forEach(input => {
        updateCharacterCount(input); // 初期ロード時に文字数を更新
        input.addEventListener('input', () => updateCharacterCount(input));
    });
});

document.addEventListener('DOMContentLoaded', function () {
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
document.addEventListener('DOMContentLoaded', function () {
    const gdnadDescriptionInput = document.querySelector('.gdnadDescriptionInput');

    // 長い広告見出しの入力フィールドのイベントリスナー
    gdnadDescriptionInput.addEventListener('input', function () {
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
document.addEventListener('DOMContentLoaded', function () {
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

document.addEventListener('DOMContentLoaded', function () {
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

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('selectOption').addEventListener('change', function () {
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
document.addEventListener('DOMContentLoaded', function () {
    // セクションごとの設定
    const sections = {
        'gsaadTitlesContainer': { maxCount: 15, placeholder: '広告見出しを入力', inputClass: 'gsaadTitleInput', countClassPrefix: 'gsaadTitle' },
        'gsaadDescriptionsContainer': { maxCount: 4, placeholder: '説明文を入力', inputClass: 'gsaadDescriptionInput', countClassPrefix: 'gsaadDescription' },
        'gsaadPathsContainer': { maxCount: 2, placeholder: 'パスを入力', inputClass: 'gsaadPathInput', countClassPrefix: 'gsaadPath' }
    };

    Object.entries(sections).forEach(([containerId, config]) => {
        const container = document.getElementById(containerId);
        // ペーストイベント処理
        container.addEventListener('paste', e => handlePaste(e, config, container));
        // 入力イベント処理
        container.addEventListener('input', e => handleInput(e, config, container));
    });

    // ペースト時の処理
    function handlePaste(e, config, container) {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const lines = pastedText.split(/\r?\n/);
    
        // 現在のテキストボックスの数を取得
        const currentCount = container.getElementsByClassName(config.inputClass).length;
    
        // ペーストされたテキストボックスのインデックスを取得
        const startIndex = parseInt(e.target.getAttribute('data-index')) || 0;
        let currentInput = container.querySelector(`.${config.inputClass}[data-index="${startIndex}"]`);
    
        // 最初の行を現在のテキストボックスに追加
        if (lines.length > 0) {
            let existingText = currentInput.value.substring(0, currentInput.selectionStart);
            let newText = existingText + lines[0];
            currentInput.value = newText;
            updateCharacterCount(currentInput, config.countClassPrefix);
        }
    
        // 残りの行を新しいテキストボックスに追加
        lines.slice(1).forEach((line, index) => {
            if (currentCount + index < config.maxCount) { // マックスカウントを超えない範囲で処理
                let inputIndex = startIndex + index + 1;
                let nextInput = container.querySelector(`.${config.inputClass}[data-index="${inputIndex}"]`);
                if (!nextInput) {
                    nextInput = addNewTextbox(container, inputIndex, config);
                }
                nextInput.value = line;
                updateCharacterCount(nextInput, config.countClassPrefix);
            }
        });
    }
    
    

    // 入力時の処理
    function handleInput(e, config, container) {
        const target = e.target;
        if (target.classList.contains(config.inputClass)) {
            const index = [...container.getElementsByClassName(config.inputClass)].indexOf(target);
            if (index === container.getElementsByClassName(config.inputClass).length - 1) {
                addNewTextboxIfNeeded(container, index + 2, config);
            }
            updateCharacterCount(target, config.countClassPrefix);
        }
    }

    // 新しいテキストボックスを追加
    function addNewTextbox(container, index, { placeholder, inputClass, countClassPrefix }) {
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
                <!-- 文字数オーバーアラート表示用 -->
                <p class="text-danger ${countClassPrefix}Alert" data-index="${index}" style="display: none;"></p>
            </div>`;
        container.appendChild(newRow);
        const newInput = newRow.querySelector(`.${inputClass}`);
        newInput.addEventListener('input', () => updateCharacterCount(newInput, countClassPrefix));
        return newInput;
    }

    // 必要に応じて新しいテキストボックスを追加
    function addNewTextboxIfNeeded(container, index, config) {
        let existingInputs = container.getElementsByClassName(config.inputClass);
        if (existingInputs.length < config.maxCount) {
            addNewTextbox(container, index, config);
        }
    }

    // 文字数カウントの更新
    function updateCharacterCount(inputElement, countClassPrefix) {
        const text = inputElement.value;
        let halfWidthCount = 0;
        let fullWidthCount = 0;
    
        for (let char of text) {
            char.match(/[^\x01-\x7E\xA1-\xDF]/) ? fullWidthCount++ : halfWidthCount++;
        }
        const totalCharacters = halfWidthCount + fullWidthCount * 2;
        const index = inputElement.getAttribute('data-index');
        document.querySelector(`.${countClassPrefix}HalfCount[data-index="${index}"]`).textContent = halfWidthCount;
        document.querySelector(`.${countClassPrefix}FullCount[data-index="${index}"]`).textContent = fullWidthCount;
        const totalCountElement = document.querySelector(`.${countClassPrefix}TotalCount[data-index="${index}"]`);
        totalCountElement.textContent = totalCharacters;
    
        let threshold = 0;
        if (countClassPrefix.includes('Title')) {
            threshold = 30;
        } else if (countClassPrefix.includes('Description')) {
            threshold = 90;
        } else if (countClassPrefix.includes('Path')) {
            threshold = 15;
        }
    
        if (parseInt(totalCountElement.textContent, 10) > threshold) {
            totalCountElement.style.color = 'red';
        } else {
            totalCountElement.style.color = ''; // デフォルトの色に戻す
        }
    }
    
});


//////////////////////////
//GDNテキストボックス拡張
//////////////////////////
document.addEventListener('DOMContentLoaded', function () {
    // 広告見出し、説明文、パスの各セクションに対する設定
    const sections = {
        'gdnadTitlesContainer': { maxCount: 5, placeholder: '広告見出しを入力', inputClass: 'gdnadTitleInput', countClassPrefix: 'gdnadTitle' },
        'gdnadPathsContainer': { maxCount: 5, placeholder: '説明文を入力', inputClass: 'gdnadPathInput', countClassPrefix: 'gdnadPath' }
    };

    Object.entries(sections).forEach(([containerId, config]) => {
        const container = document.getElementById(containerId);
        // ペーストイベント処理
        container.addEventListener('paste', e => handlePaste(e, config, container));
        // 入力イベント処理
        container.addEventListener('input', e => handleInput(e, config, container));
    });

    // ペースト時の処理
    function handlePaste(e, config, container) {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const lines = pastedText.split(/\r?\n/);
    
        // 現在のテキストボックスの数を取得
        const currentCount = container.getElementsByClassName(config.inputClass).length;
    
        // ペーストされたテキストボックスのインデックスを取得
        const startIndex = parseInt(e.target.getAttribute('data-index')) || 0;
        let currentInput = container.querySelector(`.${config.inputClass}[data-index="${startIndex}"]`);
    
        // 最初の行を現在のテキストボックスに追加
        if (lines.length > 0) {
            let existingText = currentInput.value.substring(0, currentInput.selectionStart);
            let newText = existingText + lines[0];
            currentInput.value = newText;
            updateCharacterCount(currentInput, config.countClassPrefix);
        }
    
        // 残りの行を新しいテキストボックスに追加
        lines.slice(1).forEach((line, index) => {
            if (currentCount + index < config.maxCount) { // マックスカウントを超えない範囲で処理
                let inputIndex = startIndex + index + 1;
                let nextInput = container.querySelector(`.${config.inputClass}[data-index="${inputIndex}"]`);
                if (!nextInput) {
                    nextInput = addNewTextbox(container, inputIndex, config);
                }
                nextInput.value = line;
                updateCharacterCount(nextInput, config.countClassPrefix);
            }
        });
    }
    // 入力時の処理
    function handleInput(e, config, container) {
        const target = e.target;
        if (target.classList.contains(config.inputClass)) {
            const index = [...container.getElementsByClassName(config.inputClass)].indexOf(target);
            if (index === container.getElementsByClassName(config.inputClass).length - 1) {
                addNewTextboxIfNeeded(container, index + 2, config);
            }
            updateCharacterCount(target, config.countClassPrefix);
        }
    }

    // 新しいテキストボックスを追加
    function addNewTextbox(container, index, { placeholder, inputClass, countClassPrefix }) {
        if (container.getElementsByClassName(inputClass).length < index) {
            const newRow = document.createElement('div');
            newRow.classList.add('row', 'mb-3');
            newRow.innerHTML = `<div class="col-md-8">
                <input type="text" class="form-control ${inputClass}" placeholder="${placeholder}" data-index="${index}">
            </div>
            <div class="col-md-4">
                <div class="character-counts">
                    <p>半角: <span class="${countClassPrefix}HalfCount" data-index="${index}">0</span></p>
                    <p>全角: <span class="${countClassPrefix}FullCount" data-index="${index}">0</span></p>
                    <p>合計: <span class="${countClassPrefix}TotalCount" data-index="${index}">0</span></p>
                </div>
                <p class="text-danger gsaadTitleAlert" data-index="1" style="display: none;">文字数オーバー</p>
            </div>`;
            container.appendChild(newRow);
            const newInput = newRow.querySelector(`.${inputClass}`);
            newInput.addEventListener('input', () => updateCharacterCount(newInput, countClassPrefix));
            return newInput;
        }
    }

    // 必要に応じて新しいテキストボックスを追加
    function addNewTextboxIfNeeded(container, index, config) {
        let existingInputs = container.getElementsByClassName(config.inputClass);
        if (existingInputs.length < config.maxCount) {
            addNewTextbox(container, index, config);
        }
    }

    // 文字数カウントの更新
    // 文字数カウントの更新と、条件に応じたテキスト色の変更
    function updateCharacterCount(inputElement, countClassPrefix) {
        const text = inputElement.value;
        let halfWidthCount = 0;
        let fullWidthCount = 0;
        for (let char of text) {
            char.match(/[^\x01-\x7E\xA1-\xDF]/) ? fullWidthCount++ : halfWidthCount++;
        }
        const totalCharacters = halfWidthCount + fullWidthCount * 2;
        const index = inputElement.getAttribute('data-index');
        document.querySelector(`.${countClassPrefix}HalfCount[data-index="${index}"]`).textContent = halfWidthCount;
        document.querySelector(`.${countClassPrefix}FullCount[data-index="${index}"]`).textContent = fullWidthCount;
        const totalCountElement = document.querySelector(`.${countClassPrefix}TotalCount[data-index="${index}"]`);
        totalCountElement.textContent = totalCharacters;

        // 閾値の設定
        let threshold = 0; // 初期閾値
        if (countClassPrefix.includes('Title')) {
            threshold = 30; // gdnadTitleTotalCountの場合
        } else if (countClassPrefix.includes('gdnadDescriptionTotalCount') || countClassPrefix.includes('Path')) {
            threshold = 90; // gdnadDescriptionTotalCount と gdnadPathTotalCount の場合
        }

        // 文字数が閾値を超えた場合にテキストの色を赤に変更
        if (parseInt(totalCountElement.textContent, 10) > threshold) {
            totalCountElement.style.color = 'red';
        } else {
            totalCountElement.style.color = ''; // デフォルトの色に戻す
        }
    }

});

//////////////////////////
//YSAテキストボックス拡張
//////////////////////////
document.addEventListener('DOMContentLoaded', function () {
    // 広告見出し、説明文、パスの各セクションに対する設定
    const sections = {
        'ysaadTitlesContainer': { maxCount: 15, placeholder: '広告見出しを入力', inputClass: 'ysaadTitleInput', countClassPrefix: 'ysaadTitle' },
        'ysaadDescriptionsContainer': { maxCount: 4, placeholder: '説明文を入力', inputClass: 'ysaadDescriptionInput', countClassPrefix: 'ysaadDescription' },
        'ysaadPathsContainer': { maxCount: 2, placeholder: 'パスを入力', inputClass: 'ysaadPathInput', countClassPrefix: 'ysaadPath' }
    };

    Object.entries(sections).forEach(([containerId, config]) => {
        const container = document.getElementById(containerId);
        // ペーストイベント処理
        container.addEventListener('paste', e => handlePaste(e, config, container));
        // 入力イベント処理
        container.addEventListener('input', e => handleInput(e, config, container));
    });

    // ペースト時の処理
    function handlePaste(e, config, container) {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const lines = pastedText.split(/\r?\n/);
        lines.forEach((line, idx) => {
            if (idx < config.maxCount) {
                let inputs = container.getElementsByClassName(config.inputClass);
                let input = inputs[idx];
                if (!input) {
                    input = addNewTextbox(container, idx + 1, config);
                }
                input.value = line;
                updateCharacterCount(input, config.countClassPrefix);
            }
        });
    }

    // 入力時の処理
    function handleInput(e, config, container) {
        const target = e.target;
        if (target.classList.contains(config.inputClass)) {
            const index = [...container.getElementsByClassName(config.inputClass)].indexOf(target);
            if (index === container.getElementsByClassName(config.inputClass).length - 1) {
                addNewTextboxIfNeeded(container, index + 2, config);
            }
            updateCharacterCount(target, config.countClassPrefix);
        }
    }

    // 新しいテキストボックスを追加
    function addNewTextbox(container, index, { placeholder, inputClass, countClassPrefix }) {
        if (container.getElementsByClassName(inputClass).length < index) {
            const newRow = document.createElement('div');
            newRow.classList.add('row', 'mb-3');
            newRow.innerHTML = `<div class="col-md-8">
                <input type="text" class="form-control ${inputClass}" placeholder="${placeholder}" data-index="${index}">
            </div>
            <div class="col-md-4">
                <div class="character-counts">
                    <p>半角: <span class="${countClassPrefix}HalfCount" data-index="${index}">0</span></p>
                    <p>全角: <span class="${countClassPrefix}FullCount" data-index="${index}">0</span></p>
                    <p>合計: <span class="${countClassPrefix}TotalCount" data-index="${index}">0</span></p>
                </div>
            </div>`;
            container.appendChild(newRow);
            const newInput = newRow.querySelector(`.${inputClass}`);
            newInput.addEventListener('input', () => updateCharacterCount(newInput, countClassPrefix));
            return newInput;
        }
    }

    // 必要に応じて新しいテキストボックスを追加
    function addNewTextboxIfNeeded(container, index, config) {
        let existingInputs = container.getElementsByClassName(config.inputClass);
        if (existingInputs.length < config.maxCount) {
            addNewTextbox(container, index, config);
        }
    }

    // 文字数カウントの更新
    function updateCharacterCount(inputElement, countClassPrefix) {
        const text = inputElement.value;
        let halfWidthCount = 0;
        let fullWidthCount = 0;
        for (let char of text) {
            char.match(/[^\x01-\x7E\xA1-\xDF]/) ? fullWidthCount++ : halfWidthCount++;
        }
        const totalCharacters = halfWidthCount + fullWidthCount * 2;
        const index = inputElement.getAttribute('data-index');
        document.querySelector(`.${countClassPrefix}HalfCount[data-index="${index}"]`).textContent = halfWidthCount;
        document.querySelector(`.${countClassPrefix}FullCount[data-index="${index}"]`).textContent = fullWidthCount;
        const totalCountElement = document.querySelector(`.${countClassPrefix}TotalCount[data-index="${index}"]`);
        totalCountElement.textContent = totalCharacters;

        // 閾値を設定
        let threshold = 0;
        if (countClassPrefix.includes('Title')) {
            threshold = 30;
        } else if (countClassPrefix.includes('Description')) {
            threshold = 90;
        } else if (countClassPrefix.includes('Path')) {
            threshold = 15;
        }

        // 閾値を超えた場合にテキストの色を赤に変更
        if (parseInt(totalCountElement.textContent, 10) > threshold) {
            totalCountElement.style.color = 'red';
        } else {
            totalCountElement.style.color = ''; // デフォルトの色に戻す
        }
    }
});
///////////////////////
//長い広告見出しペースト
///////////////////////
document.addEventListener('DOMContentLoaded', function() {
    // 特定のコンテナ内のinput要素に対してペーストイベントを設定
    const container = document.getElementById('gdnadDescriptionsContainer');
    const input = container.querySelector('.gdnadDescriptionInput');

    // ペーストイベントリスナーを追加
    input.addEventListener('paste', function(event) {
        event.preventDefault(); // デフォルトのペースト処理をキャンセル

        // ペーストされたテキストを取得
        const pastedText = (event.clipboardData || window.clipboardData).getData('text');

        // カーソルの位置を取得
        const cursorPos = input.selectionStart;

        // 既存のテキストを分割して、ペーストされたテキストを挿入
        const textBefore = input.value.substring(0, cursorPos);
        const textAfter = input.value.substring(cursorPos);
        input.value = textBefore + pastedText + textAfter;

        // 文字カウントの更新関数を呼び出し（別途定義が必要です）
        updateCharacterCount(input);
    });

    function updateCharacterCount(inputElement) {
        // 文字数の計算
        let halfWidthCount = 0;
        let fullWidthCount = 0;

        // 文字ごとに半角か全角かを判定してカウント
        for (let char of inputElement.value) {
            if (char.match(/[^\x01-\x7E\xA1-\xDF]/)) {
                fullWidthCount++;
            } else {
                halfWidthCount++;
            }
        }

        // 合計文字数を計算（全角を2としてカウント）
        const totalCharacters = halfWidthCount + fullWidthCount * 2;

        // HTMLに反映
        container.querySelector('.gdnadDescriptionHalfCount').textContent = halfWidthCount;
        container.querySelector('.gdnadDescriptionFullCount').textContent = fullWidthCount;
        container.querySelector('.gdnadDescriptionTotalCount').textContent = totalCharacters;
    }
});
//////////////////////////
//YDAテキストボックス拡張
//////////////////////////
document.addEventListener('DOMContentLoaded', function () {
    // 広告見出し、説明文、パスの各セクションに対する設定
    const sections = {
        'ydaadTitlesContainer': { maxCount: 15, placeholder: 'タイトルを入力', inputClass: 'ydaadTitleInput', countClassPrefix: 'ydaadTitle' },
        'ydaadDescriptionsContainer': { maxCount: 4, placeholder: '説明文を入力', inputClass: 'ydaadDescriptionInput', countClassPrefix: 'ydaadDescription' },
    };

    Object.entries(sections).forEach(([containerId, config]) => {
        const container = document.getElementById(containerId);
        // ペーストイベント処理
        container.addEventListener('paste', e => handlePaste(e, config, container));
        // 入力イベント処理
        container.addEventListener('input', e => handleInput(e, config, container));
    });

    // ペースト時の処理
    function handlePaste(e, config, container) {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const lines = pastedText.split(/\r?\n/);
        lines.forEach((line, idx) => {
            if (idx < config.maxCount) {
                let inputs = container.getElementsByClassName(config.inputClass);
                let input = inputs[idx];
                if (!input) {
                    input = addNewTextbox(container, idx + 1, config);
                }
                input.value = line;
                updateCharacterCount(input, config.countClassPrefix);
            }
        });
    }

    // 入力時の処理
    function handleInput(e, config, container) {
        const target = e.target;
        if (target.classList.contains(config.inputClass)) {
            const index = [...container.getElementsByClassName(config.inputClass)].indexOf(target);
            if (index === container.getElementsByClassName(config.inputClass).length - 1) {
                addNewTextboxIfNeeded(container, index + 2, config);
            }
            updateCharacterCount(target, config.countClassPrefix);
        }
    }

    // 新しいテキストボックスを追加
    function addNewTextbox(container, index, { placeholder, inputClass, countClassPrefix }) {
        if (container.getElementsByClassName(inputClass).length < index) {
            const newRow = document.createElement('div');
            newRow.classList.add('row', 'mb-3');
            newRow.innerHTML = `<div class="col-md-8">
                <input type="text" class="form-control ${inputClass}" placeholder="${placeholder}" data-index="${index}">
            </div>
            <div class="col-md-4">
                <div class="character-counts">
                    <p>半角: <span class="${countClassPrefix}HalfCount" data-index="${index}">0</span></p>
                    <p>全角: <span class="${countClassPrefix}FullCount" data-index="${index}">0</span></p>
                    <p>合計: <span class="${countClassPrefix}TotalCount" data-index="${index}">0</span></p>
                </div>
            </div>`;
            container.appendChild(newRow);
            const newInput = newRow.querySelector(`.${inputClass}`);
            newInput.addEventListener('input', () => updateCharacterCount(newInput, countClassPrefix));
            return newInput;
        }
    }

    // 必要に応じて新しいテキストボックスを追加
    function addNewTextboxIfNeeded(container, index, config) {
        let existingInputs = container.getElementsByClassName(config.inputClass);
        if (existingInputs.length < config.maxCount) {
            addNewTextbox(container, index, config);
        }
    }

    // 文字数カウントの更新
    function updateCharacterCount(inputElement, countClassPrefix) {
        const text = inputElement.value;
        let halfWidthCount = 0;
        let fullWidthCount = 0;
        for (let char of text) {
            char.match(/[^\x01-\x7E\xA1-\xDF]/) ? fullWidthCount++ : halfWidthCount++;
        }
        const totalCharacters = halfWidthCount + fullWidthCount;
        const index = inputElement.getAttribute('data-index');
        document.querySelector(`.${countClassPrefix}HalfCount[data-index="${index}"]`).textContent = halfWidthCount;
        document.querySelector(`.${countClassPrefix}FullCount[data-index="${index}"]`).textContent = fullWidthCount;
        const totalCountElement = document.querySelector(`.${countClassPrefix}TotalCount[data-index="${index}"]`);
        totalCountElement.textContent = totalCharacters;

        // 閾値の設定
        let threshold = 0; // 初期閾値
        if (countClassPrefix.includes('Title')) {
            threshold = 20; // gdnadTitleTotalCountの場合
        } else if (countClassPrefix.includes('Description')) {
            threshold = 90;
        }

        // 文字数が閾値を超えた場合にテキストの色を赤に変更
        if (parseInt(totalCountElement.textContent, 10) > threshold) {
            totalCountElement.style.color = 'red';
        } else {
            totalCountElement.style.color = ''; // デフォルトの色に戻す
        }
    }
});
///////////////////////
//G検索　GDN「！」チェック
///////////////////////
document.addEventListener('DOMContentLoaded', function () {
    const sections = {
        'gsaadTitlesContainer': 'gsaadTitleInput',
        'gdnadTitlesContainer': 'gdnadTitleInput',
        'gdnadDescriptionsContainer': 'gdnadDescriptionInput',
        // 他のセクションも同様に追加可能です。
    };

    Object.keys(sections).forEach(containerId => {
        const container = document.getElementById(containerId);
        const inputClass = sections[containerId];
        const h5 = container.querySelector('h5');

        const alertElementId = `${containerId}ExclamationAlert`;
        let alertElement = document.getElementById(alertElementId);
        if (!alertElement) {
            alertElement = document.createElement('div');
            alertElement.className = 'alert alert-warning mt-3';
            alertElement.id = alertElementId;
            alertElement.style.display = 'none';
            alertElement.textContent = '「!」または「！」を含むテキストは使用出来ません。';
            h5.insertAdjacentElement('afterend', alertElement);
        }

        // テキスト入力とペーストの両方を監視
        container.addEventListener('input', handleEvent);
        container.addEventListener('paste', handleEvent);

        function handleEvent(e) {
            let text;
            if (e.type === 'paste') {
                // ペーストイベントの場合、ペーストされたテキストを取得
                e.preventDefault();
                const pastedData = (e.clipboardData || window.clipboardData).getData('text');
                text = pastedData;
            } else {
                // それ以外の場合は、イベントが発生した要素の値を使用
                text = e.target.value;
            }

            const hasExclamation = text.includes('！') || text.includes('!');
            alertElement.style.display = hasExclamation ? '' : 'none';
        }
    });
});

/////////////////////
//G検索　機種依存文字
/////////////////////
document.addEventListener('DOMContentLoaded', async function () {
    const sections = {
        'gsaadTitlesContainer': 'gsaadTitleInput',
        'gsaadDescriptionsContainer': 'gsaadDescriptionInput',
        'gsaadPathsContainer': 'gsaadPathInput',
        'gdnadTitlesContainer': 'gdnadTitleInput',
        'gdnadDescriptionsContainer': 'gdnadDescriptionInput',
        'gdnadPathsContainer': 'gdnadPathInput',
        'ysaadTitlesContainer': 'ysaadTitleInput',
        'ysaadDescriptionsContainer': 'ysaadDescriptionInput',
        'ysaadPathsContainer': 'ysaadPathInput',
    };

    // 機種依存文字のリストを取得
    let dependencyChars = [
        "№",
        "㏍",
        "℡",
        "㊤",
        "㊥",
        "㊦",
        "㊧",
        "㊨",
        "㈱",
        "㈲",
        "㈹",
        "㍾",
        "㍽",
        "㍼",
        "㍻",
        "㍉",
        "㎜",
        "㎝",
        "㎞",
        "㎎",
        "㎏",
        "㏄",
        "㍉㌔",
        "㌢",
        "㍍㌘",
        "㌧",
        "㌃",
        "㌶",
        "㍑",
        "㍗",
        "㌍",
        "㌦",
        "㌣",
        "㌫",
        "㍊",
        "㌻",
        "①",
        "②",
        "③",
        "④",
        "⑤",
        "⑥",
        "⑦",
        "⑧",
        "⑨",
        "⑩",
        "⑪",
        "⑫",
        "⑬",
        "⑭",
        "⑮",
        "⑯",
        "⑰",
        "⑱",
        "⑲",
        "⑳",
        "Ⅰ",
        "Ⅱ",
        "Ⅲ",
        "Ⅳ",
        "Ⅴ",
        "Ⅵ",
        "Ⅶ",
        "Ⅷ",
        "Ⅸ",
        "Ⅹ",
        "Ⅺ",
        "Ⅻ",
        "Ⅼ",
        "Ⅽ",
        "Ⅾ",
        "Ⅿ",
        "ⅰ",
        "ⅱ",
        "ⅲ",
        "ⅳ",
        "ⅴ",
        "ⅵ",
        "ⅶ",
        "ⅷ",
        "ⅸ",
        "ⅹ",
        "ⅺ",
        "ⅻ",
        "ⅼ",
        "ⅽ",
        "ⅾ",
        "ⅿ",
        "≡",
        "∑",
        "∫",
        "∮",
        "√",
        "⊥",
        "∠",
        "∟",
        "⊿",
        "∵",
        "∩",
        "∪",
        "・",
        "纊",
        "鍈",
        "蓜",
        "炻",
        "棈",
        "兊",
        "夋",
        "奛",
        "奣",
        "寬",
        "﨑",
        "嵂",
        "~"
    ];

    Object.keys(sections).forEach(containerId => {
        const container = document.getElementById(containerId);
        const inputClass = sections[containerId];
        const h5 = container.querySelector('h5');

        const dependencyAlertElementId = `${containerId}DependencyAlert`;
        let dependencyAlertElement = document.getElementById(dependencyAlertElementId);
        if (!dependencyAlertElement) {
            dependencyAlertElement = document.createElement('div');
            dependencyAlertElement.className = 'alert alert-danger mt-3';
            dependencyAlertElement.id = dependencyAlertElementId;
            dependencyAlertElement.style.display = 'none';
            dependencyAlertElement.textContent = '機種依存文字は使用できません。';
            h5.insertAdjacentElement('afterend', dependencyAlertElement);
        }

        // テキスト入力とペーストの両方を監視
        container.addEventListener('input', handleEvent);
        container.addEventListener('paste', handleEvent);

        function handleEvent(e) {
            let text;
            if (e.type === 'paste') {
                // ペーストイベントの場合、ペーストされたテキストを取得
                e.preventDefault();
                const pastedData = (e.clipboardData || window.clipboardData).getData('text');
                text = pastedData;
            } else {
                // それ以外の場合は、イベントが発生した要素の値を使用
                text = e.target.value;
            }

            const hasDependencyChar = dependencyChars.some(char => text.includes(char));
            dependencyAlertElement.style.display = hasDependencyChar ? '' : 'none';
        }
    });
});
/////////////////
//GDN　！連続使用
/////////////////
document.addEventListener('DOMContentLoaded', function () {
    const sections = {
        'gdnadPathsContainer': 'gdnadPathInput',
        // 他のセクションも同様に追加可能です。
    };

    Object.keys(sections).forEach(containerId => {
        const container = document.getElementById(containerId);
        const inputClass = sections[containerId];
        const h5 = container.querySelector('h5');

        const alertElementId = `${containerId}ExclamationAlert`;
        let alertElement = document.getElementById(alertElementId);
        if (!alertElement) {
            alertElement = document.createElement('div');
            alertElement.className = 'alert alert-warning mt-3';
            alertElement.id = alertElementId;
            alertElement.style.display = 'none';
            alertElement.textContent = '「!」または「！」は連続して使用出来ません。';
            h5.insertAdjacentElement('afterend', alertElement);
        }

        // テキスト入力とペーストの両方を監視
        container.addEventListener('input', handleEvent);
        container.addEventListener('paste', handleEvent);

        function handleEvent(e) {
            let text;
            if (e.type === 'paste') {
                // ペーストイベントの場合、ペーストされたテキストを取得
                e.preventDefault();
                const pastedData = (e.clipboardData || window.clipboardData).getData('text');
                text = pastedData;
            } else {
                // それ以外の場合は、イベントが発生した要素の値を使用
                text = e.target.value;
            }
        
            const consecutiveExclamationPattern = /([!！]{2,})/g; 
            const hasConsecutiveExclamation = consecutiveExclamationPattern.test(text);
            alertElement.style.display = hasConsecutiveExclamation ? '' : 'none';
        }
    });
});
////////////////
//かっこ連続不可
////////////////
document.addEventListener('DOMContentLoaded', function () {
    const sections = {
        'ysaadTitlesContainer': 'ysaadTitleInput',
        'ysaadDescriptionsContainer': 'ysaadDescriptionInput',
        'ydaadTitlesContainer': 'ydaadTitleInput',
        'ydaadDescriptionsContainer': 'ydaadDescriptionInput',
        // 他のセクションも同様に追加可能です。
    };

    Object.keys(sections).forEach(containerId => {
        const container = document.getElementById(containerId);
        const inputClass = sections[containerId];
        const h5 = container.querySelector('h5');

        const alertElementId = `${containerId}BracketAlert`;
        let alertElement = document.getElementById(alertElementId);
        if (!alertElement) {
            alertElement = document.createElement('div');
            alertElement.className = 'alert alert-warning mt-3';
            alertElement.id = alertElementId;
            alertElement.style.display = 'none';
            alertElement.textContent = 'かっこを2回以上使用できません。';
            h5.insertAdjacentElement('afterend', alertElement);
        }

        container.addEventListener('input', handleEvent);
        container.addEventListener('paste', handleEvent);

        function handleEvent(e) {
            let text;
            if (e.type === 'paste') {
                e.preventDefault();
                const pastedData = (e.clipboardData || window.clipboardData).getData('text');
                text = pastedData;
            } else {
                text = e.target.value;
            }

            // 全ての括弧の出現をチェック
            // 全角の括弧（）を含めた正規表現パターン
            const bracketPattern = /[\(\)\[\]\{\}【】｛｝「」（）]/g;

            const matches = text.match(bracketPattern);
            const totalBrackets = matches ? matches.length : 0;
            
            // 合計が4回以上ならアラートを表示
            alertElement.style.display = totalBrackets >= 4 ? '' : 'none';
        }
    });
});
///////////////
//!連続使用不可
///////////////
document.addEventListener('DOMContentLoaded', function () {
    // Initialize a shared alert element
    let alertElement;

    // Get containers
    const titleContainer = document.getElementById('ysaadTitlesContainer');
    const descriptionContainer = document.getElementById('ysaadDescriptionsContainer');

    // Create the alert element and append it after the first container's heading
    if (titleContainer) {
        const h5 = titleContainer.querySelector('h5');
        alertElement = document.createElement('div');
        alertElement.className = 'alert alert-warning mt-3';
        alertElement.id = 'exclamationAlert';
        alertElement.style.display = 'none';
        alertElement.textContent = '感嘆符を2回以上使用することはできません。';
        h5.insertAdjacentElement('afterend', alertElement);
    }

    // Event listener for input and paste events in both containers
    [titleContainer, descriptionContainer].forEach(container => {
        if (!container) return; // Skip if the container does not exist
        container.addEventListener('input', evaluateExclamationUseAcrossContainers);
        container.addEventListener('paste', evaluateExclamationUseAcrossContainers);
    });

    function evaluateExclamationUseAcrossContainers() {
        // Get all input values from both containers
        const titleInputs = Array.from(titleContainer.querySelectorAll('.ysaadTitleInput')).map(input => input.value);
        const descriptionInputs = Array.from(descriptionContainer.querySelectorAll('.ysaadDescriptionInput')).map(input => input.value);

        // Check for the use of "!" or "！" across containers
        let crossContainerExclamationUse = false;
        for (let titleInput of titleInputs) {
            for (let descriptionInput of descriptionInputs) {
                const combinedText = titleInput + descriptionInput;
                const exclamationCount = (combinedText.match(/!|！/g) || []).length;
                if (exclamationCount >= 2) {
                    crossContainerExclamationUse = true;
                    break;
                }
            }
            if (crossContainerExclamationUse) break;
        }

        // Display or hide the alert based on the findings
        if (alertElement) {
            alertElement.style.display = crossContainerExclamationUse ? '' : 'none';
        }
    }
});
////////////////////
//GSA広告見出しコピー
////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const copyIcon = document.querySelector('.copyButton[data-target="gsaadTitleInput1"]');
    copyIcon.addEventListener('click', function() {
        let textToCopy = '';
        for (let i = 1; i <= 15; i++) {
            const inputElement = document.querySelector(`.gsaadTitleInput[data-index="${i}"]`);
            if (inputElement) {
                textToCopy += inputElement.value + '\n'; // 各入力値を改行で区切って追加
            }
        }
        // 一時的なテキストエリアを作成してテキストをコピー
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
    });
});
////////////////////
//GSA説明文コピー
////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const copyIcon = document.querySelector('.copyButton[data-target="gsaadDescriptionInput1"]');
    copyIcon.addEventListener('click', function() {
        let textToCopy = '';
        for (let i = 1; i <= 15; i++) {
            const inputElement = document.querySelector(`.gsaadDescriptionInput[data-index="${i}"]`);
            if (inputElement) {
                textToCopy += inputElement.value + '\n'; // 各入力値を改行で区切って追加
            }
        }
        // 一時的なテキストエリアを作成してテキストをコピー
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
    });
});
////////////////////
//GSAパスコピー
////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const copyIcon = document.querySelector('.copyButton[data-target="gsaadPathInput1"]');
    copyIcon.addEventListener('click', function() {
        let textToCopy = '';
        for (let i = 1; i <= 15; i++) {
            const inputElement = document.querySelector(`.gsaadPathInput[data-index="${i}"]`);
            if (inputElement) {
                textToCopy += inputElement.value + '\n'; // 各入力値を改行で区切って追加
            }
        }
        // 一時的なテキストエリアを作成してテキストをコピー
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
    });
});
////////////////////
//GDN広告見出しコピー
////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const copyIcon = document.querySelector('.copyButton[data-target="gdnadTitleInput1"]');
    copyIcon.addEventListener('click', function() {
        let textToCopy = '';
        for (let i = 1; i <= 15; i++) {
            const inputElement = document.querySelector(`.gdnadTitleInput[data-index="${i}"]`);
            if (inputElement) {
                textToCopy += inputElement.value + '\n'; // 各入力値を改行で区切って追加
            }
        }
        // 一時的なテキストエリアを作成してテキストをコピー
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
    });
});
////////////////////
//GDN長い広告見出しコピー
////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const copyButton = document.querySelector('.copyButton[data-target="gdnadDescriptionInput1"]');
    copyButton.addEventListener('click', function() {
        // 対象のinput要素を特定
        const targetInput = document.querySelector('.gdnadDescriptionInput');
        if (targetInput) {
            // 入力値を一時的なテキストエリアにコピー
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = targetInput.value;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextArea);
        }
    });
});
////////////////////
//GDN説明文コピー
////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const copyIcon = document.querySelector('.copyButton[data-target="gdnadPathInput1"]');
    copyIcon.addEventListener('click', function() {
        let textToCopy = '';
        for (let i = 1; i <= 15; i++) {
            const inputElement = document.querySelector(`.gdnadPathInput[data-index="${i}"]`);
            if (inputElement) {
                textToCopy += inputElement.value + '\n'; // 各入力値を改行で区切って追加
            }
        }
        // 一時的なテキストエリアを作成してテキストをコピー
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
    });
});
////////////////////
//YSA見出しコピー
////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const copyIcon = document.querySelector('.copyButton[data-target="ysaadTitleInput1"]');
    copyIcon.addEventListener('click', function() {
        let textToCopy = '';
        for (let i = 1; i <= 15; i++) {
            const inputElement = document.querySelector(`.ysaadTitleInput[data-index="${i}"]`);
            if (inputElement) {
                textToCopy += inputElement.value + '\n'; // 各入力値を改行で区切って追加
            }
        }
        // 一時的なテキストエリアを作成してテキストをコピー
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
    });
});
////////////////////
//YSA説明文コピー
////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const copyIcon = document.querySelector('.copyButton[data-target="ysaadDescriptionInput1"]');
    copyIcon.addEventListener('click', function() {
        let textToCopy = '';
        for (let i = 1; i <= 15; i++) {
            const inputElement = document.querySelector(`.ysaadDescriptionInput[data-index="${i}"]`);
            if (inputElement) {
                textToCopy += inputElement.value + '\n'; // 各入力値を改行で区切って追加
            }
        }
        // 一時的なテキストエリアを作成してテキストをコピー
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
    });
});
////////////////////
//YSAパスコピー
////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const copyIcon = document.querySelector('.copyButton[data-target="ysaadPathInput1"]');
    copyIcon.addEventListener('click', function() {
        let textToCopy = '';
        for (let i = 1; i <= 15; i++) {
            const inputElement = document.querySelector(`.ysaadPathInput[data-index="${i}"]`);
            if (inputElement) {
                textToCopy += inputElement.value + '\n'; // 各入力値を改行で区切って追加
            }
        }
        // 一時的なテキストエリアを作成してテキストをコピー
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
    });
});
////////////////////
//YDAタイトルコピー
////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const copyIcon = document.querySelector('.copyButton[data-target="ydaadTitleInput1"]');
    copyIcon.addEventListener('click', function() {
        let textToCopy = '';
        for (let i = 1; i <= 15; i++) {
            const inputElement = document.querySelector(`.ydaadTitleInput[data-index="${i}"]`);
            if (inputElement) {
                textToCopy += inputElement.value + '\n'; // 各入力値を改行で区切って追加
            }
        }
        // 一時的なテキストエリアを作成してテキストをコピー
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
    });
});
////////////////////
//YDA説明文コピー
////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const copyIcon = document.querySelector('.copyButton[data-target="ydaadDescriptionInput1"]');
    copyIcon.addEventListener('click', function() {
        let textToCopy = '';
        for (let i = 1; i <= 15; i++) {
            const inputElement = document.querySelector(`.ydaadDescriptionInput[data-index="${i}"]`);
            if (inputElement) {
                textToCopy += inputElement.value + '\n'; // 各入力値を改行で区切って追加
            }
        }
        // 一時的なテキストエリアを作成してテキストをコピー
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
    });
});

////////////////////
//トレンド
////////////////////
document.getElementById('analyzeButton').addEventListener('click', function() {
    var keyword = document.getElementById('keywordInput').value.trim();
    if (!keyword) {
        console.error('キーワードが入力されていません。');
        alert('キーワードを入力してください。');
        return;
    }

    fetch('/analyze_trend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: keyword })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('サーバーからの応答が正しくありません: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            console.error('エラー:', data.error);
            alert('エラー: ' + data.error); // エラーメッセージをユーザーに表示
        } else {
            drawChart(data);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('エラーが発生しました: ' + error.message); // エラーメッセージをユーザーに表示
    });
});

function drawChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const labels = Object.keys(data);
    const values = Object.values(data);
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '検索トレンド',
                data: values,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        }
    });
}