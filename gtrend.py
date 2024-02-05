import os
import openai
import json
from pytrends.request import TrendReq
from dotenv import load_dotenv

# APIキーの設定 ★ここにご自分のAPIキーをいれてください。
openai.api_key = 'YOUR-API-KEY'

# モデルの設定
model_name = "gpt-3.5-turbo-0613"

user_input= "2023年6月のChatGPTのトレンドを分析し、MarkDown形式で報告してください。"
gtrend_list = ['gtrend']

# Step 1, Google Trendで検索する関数を定義

def chk_gtrend(gtrend):
    startday = gtrend["startday"]
    endday = gtrend["endday"]
    keyword = gtrend["gtrend"]

    pytrends = TrendReq(hl='ja-JP', tz=-540)
    kw_list = [keyword]
    pytrends.build_payload(kw_list, timeframe=f"{startday} {endday}", geo='JP')
    q = pytrends.related_queries()
    if q[kw_list[0]]['rising'] is not None:
        rising_data = q[kw_list[0]]['rising'].values.tolist()
    else:
        rising_data = []  # 'rising' のデータが存在しない場合、rising_data は空のリストになります
    gtrend_info = {
        "status": "success",
        "gtrend": gtrend,
        "rising": rising_data
    }
    gtrend_list.append(gtrend)
    return json.dumps(gtrend_info)

# Step 2, プロンプトと同時に関数の説明をChatGPTのモデルに渡して、関数を使うかをChatGPTが判断する。

def run_conversation():
    response = openai.ChatCompletion.create(
        model = model_name,
        messages=[{"role": "user", "content": user_input}],
        functions=[
            {
                "name": "chk_gtrend",
                "description": "Google Trendで検索します。",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "gtrend": {
                            "type": "string",
                            "description": "トレンド",
                        },
                        "startday": {
                            "type": "string",
                            "format": "date",
                            "pattern": "yyyy-mm-dd",
                            "description": "開始日",
                        },
                        "endday": {
                            "type": "string",
                            "format": "date",
                            "pattern": "yyyy-mm-dd",
                            "description": "終了日",
                        }
                    },
                    "required": ["gtrend"],
                },
            },
        ],
        function_call="auto",
    )

    message = response["choices"][0]["message"]
    print(message)

    # Step 3, ChatGPTが関数を使うとリプライがあったかを判別する。
    if message.get("function_call"):
        function_name = message["function_call"]["name"]
        gtrend = json.loads(message["function_call"]["arguments"])


    # Step 4, ChatGPTからの指定された実際の関数を呼び出す。
    if function_name == "chk_gtrend":
        function_response = chk_gtrend(gtrend=gtrend)

        print(gtrend_list)

    # Step 5, 関数の実行結果をChatGPTのモデルに渡して、ChatGPTから回答を得る。
        second_response = openai.ChatCompletion.create(
            model = model_name,
            messages=[
                {"role": "user", "content": user_input},
                message,
                {
                    "role": "function",
                    "name": function_name,
                    "content": function_response,
                },
            ],
        )
        return second_response

print(run_conversation()["choices"][0]["message"]["content"])