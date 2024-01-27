from flask import Flask, request, jsonify, render_template
import os
from dotenv import load_dotenv
from openai import OpenAI

# Flaskアプリケーションの設定
app = Flask(__name__,template_folder='template')

# .env ファイルから環境変数を読み込む
load_dotenv()

# OpenAIのクライアントを設定
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


# キーワード生成関数
def generate_ad_keywords(base_keyword):
    system_message = "あなたは検索広告のキーワードを作成します。基本的に単語のみで返すようにしてください。"
    user_message = f"{base_keyword} このキーワードに対する、検索広告のキーワードを50個作成してください。\
        また、単語同士の間に半角スペースを空けるようにしてください。"

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
        print(f"An error occurred: {e}")
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
    ad_keywords = generate_ad_keywords(base_keyword)
    return jsonify({"ad_keywords": ad_keywords})


# Flaskアプリケーションの実行
if __name__ == "__main__":
    app.run(debug=True)