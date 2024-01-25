import os
from dotenv import load_dotenv
import openai

# .env ファイルから環境変数を読み込む
load_dotenv()

def generate_ad_keywords(base_keyword):
    openai.api_key = os.getenv("OPENAI_API_KEY")

    try:
        response = openai.Completion.create(
          model="text-davinci-003",  # GPT-4のモデルを指定
          prompt=f"Generate a list of search advertising keywords related to '{base_keyword}':",
          max_tokens=100
        )
        return response.choices[0].text.strip()
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

# ベースとなるキーワードを指定
base_keyword = "travel"
ad_keywords = generate_ad_keywords(base_keyword)

if ad_keywords:
    print("Generated Keywords:")
    print(ad_keywords)
else:
    print("Failed to generate keywords.")
