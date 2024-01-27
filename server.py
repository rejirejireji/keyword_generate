import os
from dotenv import load_dotenv
from openai import OpenAI

# .env ファイルから環境変数を読み込む
load_dotenv()

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

#キーワード生成
def generate_ad_keywords(base_keyword):
    system_message = "あなたは検索広告のキーワードを作成します。基本的に単語のみで返すようにしてください。"
    user_message = f"{base_keyword} このキーワードに対する、検索広告のキーワードを50個作成してください。"

    try:
        response = client.chat.completions.create(
          model="gpt-4",  
          messages=[
              {"role":"system","content":system_message},
              {"role":"user", "content":user_message}
          ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

# ベースとなるキーワードを指定
base_keyword = "エニタイムフィットネス"
ad_keywords = generate_ad_keywords(base_keyword)

if ad_keywords:
    print("Generated Keywords:")
    print(ad_keywords)
else:
    print("Failed to generate keywords.")
