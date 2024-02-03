from flask import Flask, request, jsonify, render_template
import os
from dotenv import load_dotenv
from openai import OpenAI
import feedparser
from datetime import datetime
import json 

# Flaskアプリケーションの設定
app = Flask(__name__,template_folder='template')

# .env ファイルから環境変数を読み込む
load_dotenv()

# OpenAIのクライアントを設定
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


# キーワード生成関数
def generate_ad_keywords(base_keyword, industry, appeal, prefecture, city):
    system_message = "あなたは検索広告のキーワードを作成します。基本的に単語のみで返すようにしてください。"
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
    url = "https://news.google.com/rss/search?q=after:2024/01/01+WEB広告&hl=ja&gl=JP&ceid=JP:ja"
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

if __name__ == '__main__':
    app.run(debug=True)
