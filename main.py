from flask import Flask, request, jsonify, render_template
import os
from dotenv import load_dotenv
from openai import OpenAI
import feedparser
from datetime import datetime, timedelta
import json 

# Flaskアプリケーションの設定
app = Flask(__name__,template_folder='template')

# .env ファイルから環境変数を読み込む
load_dotenv()

# OpenAIのクライアントを設定
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


# キーワード生成関数
def generate_ad_keywords(base_keyword, industry, appeal, prefecture, city):
    system_message = "あなたは検索広告のキーワードを作成します。単語のみで返すようにしてください。"
    user_message = f'''{base_keyword} このキーワードに対する、検索広告のキーワードを50個作成してください。
        訴求内容は、{appeal}ということも考慮してください。1～50のような数字で表記するのではなく、結果のみ表示してください。
        また、単語同士の間に半角スペースを空けるようにしてください。参考として、業界は{industry}で、
        配信地域は{prefecture}{city}です。 '''
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

from pytrends.request import TrendReq
import pandas as pd


def get_search_trends(keyword, start_date, end_date, geo='JP'):
    pytrends = TrendReq(hl='ja-JP', tz=360)
    # キーワードが日本語の場合と英語の場合で処理を分ける
    if keyword.isascii():
        pytrends.build_payload([keyword], timeframe=f'{start_date} {end_date}', geo=geo)
    else:
        # 日本語のキーワードを扱うために、キーワードをリストで渡す
        pytrends.build_payload(kw_list=[keyword], timeframe=f'{start_date} {end_date}', geo=geo)
    interest_over_time = pytrends.interest_over_time()
    # 日付をより視認性の高い形式に変更
    interest_over_time.index = interest_over_time.index.strftime('%Y年%m月%d日')
    # 正しくエンコードして返す
    return interest_over_time.to_json(date_format='iso', force_ascii=False)

@app.route('/analyze_trend', methods=['POST'])
def analyze_trend():
    data = request.get_json()
    keyword = data['keyword']
    # ここでは固定の日付を使用していますが、必要に応じて変更してください
    trends_json = get_search_trends(keyword, "2024-01-01", "2024-03-01")
    print(trends_json)
    return jsonify(trends_json)

if __name__ == '__main__':
    app.run(debug=True)
