from flask import Flask, request, jsonify
from pytrends.request import TrendReq

app = Flask(__name__)

def get_search_trends(keyword, start_date, end_date, geo='JP'):
    pytrends = TrendReq(hl='ja-JP', tz=360)
    pytrends.build_payload([keyword], timeframe=f'{start_date} {end_date}', geo=geo)
    interest_over_time = pytrends.interest_over_time()
    return interest_over_time.to_json()

@app.route('/analyze_trend', methods=['POST'])
def analyze_trend():
    data = request.get_json()
    keyword = data['keyword']
    # ここでは固定の日付を使用していますが、必要に応じて変更してください
    trends_json = get_search_trends(keyword, "2023-01-01", "2023-04-01")
    return jsonify(trends_json)

if __name__ == '__main__':
    app.run(debug=True)