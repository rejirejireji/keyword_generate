import requests


def get_population_data():
    url = "https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=1e1dad8223a56d56e316e0abe070d9b4420273d5&lang=J&statsDataId=0003411562&metaGetFlg=Y&cntGetFlg=N&explanationGetFlg=Y&annotationGetFlg=Y&sectionHeaderFlg=1&replaceSpChars=0"

    # APIからデータを取得
    response = requests.get(url)
    data = response.json()  # レスポンスをJSONとして解析

    # 応答から特定の条件に一致するデータ塊を探索
    try:
        # 'GET_STATS_DATA' -> 'STATISTICAL_DATA' -> 'DATA_INF' -> 'VALUE' の階層を辿る
        # この部分はAPIの応答構造に依存するため、実際の構造に合わせて調整が必要です
        values = data["GET_STATS_DATA"]["STATISTICAL_DATA"]["DATA_INF"]["VALUE"]

        # "@cat01": "00100"を含むデータ塊を検索
        population_data = [value for value in values if value["@cat01"] == "00100"]

        return population_data  # 条件に一致するデータ塊を返す
    except KeyError as e:
        print(f"KeyError: {e}")  # キーが見つからない場合のエラー処理
        return []


# 関数を実行して結果を表示
population_data = get_population_data()
print(population_data)
