from newspaper import Article
import yfinance as yf
from transformers import pipeline
classifier = pipeline("sentiment-analysis")
from sentence_transformers import SentenceTransformer, util
model = SentenceTransformer('all-MiniLM-L6-v2')
from wallstreet import Stock, Call
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from tqdm import tqdm
import sys

company = sys.argv[1]
period = sys.argv[2]
risk = sys.argv[3]

resp = ["dummy"]

def get_article(url):
    article = Article(url)
    article.download()
    article.parse()
    cos_sim12 = util.cos_sim(model.encode(article.text), model.encode("Microsoft")).numpy()[0][0]
    try:
        sentiment = classifier(article.text)
    except:
        #print("Error")
        sentiment = -1
    return sentiment, cos_sim12

def find_max_value_dict(dict_list):
    max_value = -float('inf')
    max_dict = {}
    for dictionary in dict_list:
        for key, value in dictionary.items():
            if value > max_value:
                max_value = value
                max_dict = {key: value}
        return max_dict

def get_info(ticker_symb, time_period = "1mo", risk = "Low"):
    ticker = yf.Ticker(ticker_symb)
    positive_list = []
    negative_list = []
    for i in range(len(ticker.news)):
        #print(i)
        sentiment, cosine = get_article(ticker.news[i].get("link"))
        if sentiment != -1:
            #print(cosine)
            if sentiment[0].get('label') == "POSITIVE":
                positive_list.append({i:cosine})
            else:
                negative_list.append({i:cosine})
        #print("")
        
    if len(positive_list) == 0:
        # print("No Positive Articles Found")
        resp.append("No Positive Article Found")
    else:
        key_pos = list(find_max_value_dict(positive_list).keys())[0]
        link_pos = ticker.news[key_pos].get("link")
        # print(f"Positive Link: {link_pos}")
        resp.append(link_pos)
    if len(negative_list) == 0:
        # print("No Negative Articles Found")
        resp.append("No Negative Article Found")
    else:
        key_neg = list(find_max_value_dict(negative_list).keys())[0]
        link_neg = ticker.news[key_neg].get("link")
        # print(f"Negative Link: {link_neg}")
        resp.append(link_neg)
    
    
    
    df = ticker.history(period=time_period)
    
    number_simulation = 100
    predict_day = 30

    close = df['Close'].tolist()
    returns = pd.DataFrame(close).pct_change()
    last_price = close[-1]
    results = pd.DataFrame()
    avg_daily_ret = returns.mean()
    variance = returns.var()
    daily_vol = returns.std()
    daily_drift = avg_daily_ret - (variance / 2)
    drift = daily_drift - 0.5 * daily_vol ** 2
    
    if(risk == "Medium"):
        risk_free_rate = 0.1
    elif(risk == "High"):
        risk_free_rate = 0.5
    else:
        risk_free_rate = 0.05 #0.05 for small, 0.1 for medium risk, 0.5 high risk

    results = pd.DataFrame()

    for i in tqdm(range(number_simulation)):
        prices = []
        prices.append(df.Close.iloc[-1])
        for d in range(predict_day):
            shock = [drift + daily_vol * np.random.normal()]
            shock = np.mean(shock)
            price = prices[-1] * np.exp(shock)
            prices.append(price)
        results[i] = prices

    daily_returns = results.pct_change().mean(axis=0)

    mean_returns = np.mean(daily_returns)
    sharpe_ratio = (mean_returns - risk_free_rate) / np.std(daily_returns)
    sharpe_ratio /= 10
    alpha = mean_returns - risk_free_rate * sharpe_ratio
   # beta = np.cov(daily_returns, np.zeros(predict_day))[0][1] / np.var(daily_returns)
    
    eps = ticker.income_stmt.T['Basic EPS'].iloc[0]
    stock = Stock(ticker_symb).price
    price_to_earning_ratio = round(stock / eps,2)
    earning_growth = ticker.revenue_forecasts
    # dividend = ticker.dividends[-1]
    # performance_score = ( + (price_to_earning_ratio * 0.15) + (earning_growth * 0.25))
    
    # print(f"The Worst Case situation is $ {round(sorted(results.iloc[30])[0], 2)}")
    # print(f"The Best Case situation is $ {round(sorted(results.iloc[30])[-1], 2)}")
    # print(f"The Average Case situation is $ {round(np.mean(sorted(results.iloc[30])), 2)}")

    # print("---------------------------------------------------")
    
    # print(f"The Mean Return is:                     {round(mean_returns, 2)}")
    # print(f"The Sharpe Ratio is:                    {round(sharpe_ratio, 2)}")
    # print(f"The Alpha value is:                     {round(alpha, 2)}")
    # print(f"The price to earning_ratio is           {round(price_to_earning_ratio, 2)}")
    # print(f"The earning growth for next quarter is: {round(earning_growth['avg'].iloc[0], 2)}")
    # #print(f"The Dividend for last quarter was:      {round(dividend, 2)}")
    
    # print("---------------------------------------------------")
    # plt.set_size_inches(18.5, 10.5)
    plt.figure(figsize=(12,6))
    plt.plot(df.index, df['Close'])
    plt.savefig('img1.png')

    s = Stock(company)
    iv = Call(company, d=10, m=2, y=2023, strike=140).implied_volatility()
    

    resp.append(round(sorted(results.iloc[30])[0], 2))
    resp.append(round(sorted(results.iloc[30])[-1], 2))
    resp.append(round(np.mean(sorted(results.iloc[30])), 2))
    
    resp.append(round(mean_returns, 2))
    resp.append(abs(round(sharpe_ratio, 2)))
    resp.append(round(alpha, 2))
    resp.append(round(price_to_earning_ratio, 2))
    resp.append(round(earning_growth['avg'].iloc[0], 2))
    resp.append(s.price)
    resp.append(iv)
    resp.append("dummy")


    # plt.figure(figsize=(10,5))
    # plt.plot(results)
    # plt.ylabel('Value')
    # plt.xlabel('Simulated days')
    # plt.show()
    

get_info(company, period, risk)
print(resp)
sys.stdout.flush()