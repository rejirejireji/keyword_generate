import requests
import os
from dotenv import load_dotenv

load_dotenv()

def get_population_by_prefecture(prefecture_code):
    # APIのベースURL
    base_url = "https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData"
    appId = os.environ.get("ESTAT_API_KEY")
    
    # APIリクエストに使用するパラメータ
    params = {
        "appId": appId,
        "lang": "J",
        "statsDataId": "0003411562",
        "metaGetFlg": "Y",
        "cntGetFlg": "N",
        "explanationGetFlg": "Y",
        "annotationGetFlg": "Y",
        "sectionHeaderFlg": "1",
        "replaceSpChars": "0",
        "area": prefecture_code  # 都道府県コードを指定
    }
    
    # APIからデータを取得
    response = requests.get(base_url, params=params)
    data = response.json()  # レスポンスをJSONとして解析

    try:
        # 応答から人口データを取得
        values = data["GET_STATS_DATA"]["STATISTICAL_DATA"]["DATA_INF"]["VALUE"]
        population_data = next((value for value in values if value["@cat01"] == "00100"), None)
        
        if population_data:
            return population_data["$"]  # 人口数を返す
        else:
            return "データが見つかりません"
    except KeyError as e:
        print(f"KeyError: {e}")
        return "エラーが発生しました"

# 都道府県コードを指定して関数を実行（例: "13000"は東京都）
population = get_population_by_prefecture("13000")
print(population)
