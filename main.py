from flask import Flask, request, jsonify, render_template
import os
from dotenv import load_dotenv
from openai import OpenAI
import feedparser
from datetime import datetime, timedelta
import json 
from pytrends.request import TrendReq


# Flaskアプリケーションの設定
app = Flask(__name__,template_folder='template')

# .env ファイルから環境変数を読み込む
load_dotenv()

# OpenAIのクライアントを設定
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


# キーワード生成関数
def generate_ad_keywords(base_keyword, industry, appeal, prefecture, target):
    system_message = "あなたは経験豊富なデジタルマーケティングストラテジストです。入力情報に基づき、効果的なリスティング広告のキーワード案を50個生成してください。"
    user_message = f'''- ブランド名：{base_keyword}
- 業種： {industry}
- 特徴： {appeal}
- ターゲット： {target}
- エリア： {prefecture}

生成ガイドライン：
1. 多様性：異なる視点や革新的なアプローチを反映したキーワードを含める。
2. バランス：ブランド名は控えめに使用し、業種、特徴、ターゲット、エリアから連想される用語をバランスよく組み込む。
3. キーワードの長さ：短尾キーワードと長尾キーワードを適切に混合する。
4. ユーザーインテント：情報収集、比較検討など、カスタマージャーニーの各段階に対応するキーワードを含める。
5. 語彙の多様性：同義語、関連語、共起語を活用し、一般的表現とニッチな表現をスマートに組み合わせる。重複・類似の組み合わせを避ける。
6. 時宜性：季節性、現在のトレンド、業界動向を反映したキーワードを含める。
7. ネガティブキーワード回避：広告表示に適さない可能性のある用語、ユーザーに不快感を与える単語は除外する。
8. ローカライゼーション：地域のランドマーク、文化的要素などを適切に取り入れる。
9. 顧客心理：潜在的な顧客の悩み、願望、目標を反映したキーワードを含める。
10. 競合差別化：提供されるサービスの価値提案を強調するキーワードを含める。
11. モバイル最適化：モバイル検索に特化した短く簡潔なキーワードを含める。
12. 質問形式：「どのように」「なぜ」「どこで」といったインフォメーショナルクエリをキャッチアップできるキーワードを含める。
13. 専門用語と一般用語のバランス：業界固有の専門用語とユーザー向けの平易な言葉を適切にミックスする。

出力パラメータ：
- Temperature: 0.75
- Top_p (nucleus sampling): 0.9
- Top_k: 40
- Presence_penalty: 0.1
- Frequency_penalty: 0.3
- Max_tokens: 8192
- Stop_sequence: ["\n\n", "51."]
- Repetition_penalty: 1.2
- Length_penalty: 0.8
- Diversity_penalty: 0.15

出力形式：
- キーワードは以下の形式の厳密な表形式で出力してください：
  | No. | キーワード |
  |-----|------------|
  | 1   | [キーワード1] |
  | 2   | [キーワード2] |
  ...
  | 50  | [キーワード50] |

- 表の前後に余分な空行を入れないでください。
- 表の各行は1つのキーワードのみを含み、50行で終了してください。
- 番号とキーワードの間には必ず | を入れてください。
- キーワード以外の説明や追加コメントは一切含めないでください。
- キーワードはセルの中に直接入力し、[]や""などの記号で囲まないでください。
 '''
    print(user_message) #プロンプトをログに表示
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message},
            ],
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"An error occurred: {e}") #エラーログ
        return None


def get_google_news_feed():
    # 今日の日付から3日前
    fourteen_days_ago = (datetime.now() - timedelta(days=3)).strftime('%Y/%m/%d')
    
    # URLの日付部分を3日前の日付に更新
    url = f"https://news.google.com/rss/search?q=after:{fourteen_days_ago}+WEB広告&hl=ja&gl=JP&ceid=JP:ja"
    feed = feedparser.parse(url)
    news_list = []
    
    for entry in feed.entries[:10]:
        pub_date = datetime.strptime(entry.published, '%a, %d %b %Y %H:%M:%S %Z')
        formatted_date = pub_date.strftime('%Y/%m/%d（%a）')
        
        news_list.append({
            'title': entry.title,
            'link': entry.link,
            'pubDate': formatted_date
        })
    
    return news_list


# HTMLの読み込み
@app.route("/")
def index():
    # JSONファイルのパスを指定
    json_file_path = os.path.join(app.root_path, 'template', 'prefectures.json')
    with open(json_file_path, 'r', encoding='utf-8') as f:
        prefectures = json.load(f)
    return render_template('template.html', prefectures=prefectures)

@app.route("/get_rss_feed")
def get_rss_feed():
    news_feed = get_google_news_feed()
    return jsonify(news_feed)

@app.route("/generate_keywords", methods=["POST"])
def generate_keywords():
    data = request.json
    base_keyword = data["base_keyword"]
    industry = data["industry"]
    region = data["region"]
    appeal = data["appeal"]
    prefecture = data["prefecture"]
    ad_keywords = generate_ad_keywords(base_keyword, industry, appeal, prefecture, region)
    return jsonify({"ad_keywords": ad_keywords})

@app.route('/some-page')
def some_page():
    return render_template('some_page.html')


@app.route('/analyze_trend', methods=['POST'])
def analyze_trend():
    data = request.get_json()
    # .get() を使用してキーワードを安全に取得
    keyword = data.get('keyword')
    if not keyword:
        # キーワードが提供されていない場合はエラーを返す
        return jsonify({"error": "キーワードが指定されていません。"}), 400

    pytrends = TrendReq(hl='ja-JP', tz=360)
    pytrends.build_payload([keyword], timeframe='today 3-m', geo='JP')
    interest_over_time = pytrends.interest_over_time()
    
    if not interest_over_time.empty:
        # キーワードがDataFrameに存在するか確認
        if keyword in interest_over_time.columns:
            result = interest_over_time[keyword].to_dict()
            return jsonify(result)
        else:
            # キーワードがDataFrameに存在しない場合はエラーを返す
            return jsonify({"error": f"キーワード '{keyword}' のデータが見つかりませんでした。"}), 404
    else:
        return jsonify({"error": "データが見つかりませんでした。"}), 404

if __name__ == '__main__':
    app.run(debug=True)