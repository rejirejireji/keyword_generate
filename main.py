from flask import Flask, request, jsonify, render_template
import os
from dotenv import load_dotenv
from openai import OpenAI
import requests
import xml.etree.ElementTree as ET

# Flaskアプリケーションの設定
app = Flask(__name__, template_folder="template")

# .env ファイルから環境変数を読み込む
load_dotenv()

# OpenAIのクライアントを設定
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))




# キーワード生成関数
def generate_ad_keywords(base_keyword, industry, appeal, prefecture, city):
    system_message = "あなたは検索広告のキーワードを作成します。基本的に単語のみで返すようにしてください。"
    user_message = f"""{base_keyword} このキーワードに対する、検索広告のキーワードを50個作成してください。
        訴求内容は、{appeal}ということも考慮してください。1～50のような数字で表記するのではなく、結果のみ表示してください。
        また、単語同士の間に半角スペースを空けるようにしてください。参考として、業界は{industry}で、
        配信地域は{prefecture}{city}です。 """
    print(user_message)  # プロンプトをログに表示
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
        print(f"An error occurred: {e}")  # エラーログ
        return None


# HTMLの読み込み
@app.route("/")
def index():
    return render_template("template.html")


# Flaskエンドポイント
@app.route("/generate_keywords", methods=["POST"])
def generate_keywords():
    data = request.json
    base_keyword = data["base_keyword"]
    industry = data["industry"]
    region = data["region"]
    appeal = data["appeal"]
    prefecture = data["prefecture"]
    ad_keywords = generate_ad_keywords(
        base_keyword, industry, appeal, prefecture, region
    )
    return jsonify({"ad_keywords": ad_keywords})


@app.route("/some-page")
def some_page():
    # このルートに対するコンテンツを返す
    return render_template("some_page.html")


# RSS読み込み
@app.route("/get_rss_feed")
def get_rss_feed():
    url = "https://news.google.com/atom/search?q=WEB%E5%BA%83%E5%91%8A+2024-01-01&hl=ja&gl=JP&ceid=JP:ja"
    response = requests.get(url)
    root = ET.fromstring(response.content)

    news_list = []
    for entry in root.findall(".//{http://www.w3.org/2005/Atom}entry")[:10]:  # 最初の10件のみ取得
        title = entry.find("{http://www.w3.org/2005/Atom}title").text
        link = entry.find("{http://www.w3.org/2005/Atom}link").attrib["href"]
        news_list.append({"title": title, "link": link})
        print(f"Title: {title}, Link: {link}")  # ログにタイトルとリンクを表示

    return render_template("news.html", news_list=news_list)

# Flaskアプリケーションの実行
if __name__ == "__main__":
    app.run(debug=True)
