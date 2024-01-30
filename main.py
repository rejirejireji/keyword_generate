from flask import Flask, request, jsonify, render_template
import os
from dotenv import load_dotenv
from openai import OpenAI

# Flaskアプリケーションの設定
app = Flask(__name__,template_folder='template')

# アプリケーションのディレクトリを連結して指定
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')

# .env ファイルから環境変数を読み込む
load_dotenv(dotenv_path)

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
    ad_keywords = generate_ad_keywords(base_keyword, industry, appeal, prefecture, region)
    return jsonify({"ad_keywords": ad_keywords})

@app.route('/some-page')
def some_page():
    # このルートに対するコンテンツを返す
    return render_template('some_page.html')


# Flaskアプリケーションの実行
if __name__ == "__main__":
    app.run(debug=True)
