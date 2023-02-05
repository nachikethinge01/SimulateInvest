import React, { Component } from "react";
import csv from "../data/company.json";
import SelectSearch from "react-select-search";
import "react-select-search/style.css";
import apple from "../assets/logos/AAPL.png";
import blk from "../assets/logos/BLK.png";
import microsoft from "../assets/logos/MSFT.png";
import netflix from "../assets/logos/NFLX.png";
import logo from "../assets/logo.jpeg";

export default class home extends Component {
  m = new Map();
  options = [];
  url = "http://localhost:3100/";
  constructor(props) {
    super(props);
    this.state = {
      data: csv,
      selectedCompany: "MSFT",
      days: 0,
      months: 0,
      years: 0,
      risk: "low",
      period: "1mo",
      modelResult: [],
      respObtained: false,
      loadingStarted: false,
      graph: "",
      modalTitle: "",
      modalBody: "",
    };
    for (let obj of csv) {
      this.m.set(obj.ticker, obj["short name"]);
      let x = {
        name: obj["short name"],
        value: obj.ticker,
      };
      this.options.push(x);
    }
  }

  processData = async () => {
    let data = {
      company: this.state.selectedCompany,
      period: this.state.period,
      risk: this.state.risk,
    };
    try {
      // console.log(data);
      this.setState({ loadingStarted: true, respObtained: false });
      let val = await fetch(this.url, {
        method: "POST",
        body: JSON.stringify(data),
        mode: "cors",
        headers: {
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
      let content = await val.json();
      console.log(content);
      let resp = content.response;
      let arr = resp.split(",");
      arr[1] = arr[1].substring(2, arr[1].length);
      arr[2] = arr[2].substring(2, arr[1].length);
      await this.setState({
        respObtained: true,
        modelResult: arr,
        loadingStarted: false,
        graph: content.graph,
      });

      console.log(arr);
    } catch (error) {
      console.log(error);
    }
  };

  handleChange = (value) => {
    this.setState({ selectedCompany: value });
  };

  changeDateTime = (e) => {
    this.setState({ [e.target.name]: e.target.value });
    // console.log(this.state.days, this.state.months, this.state.years);
  };

  handleRisk = (e) => {
    this.setState({ risk: e.target.value });
  };

  handlePeriod = (e) => {
    this.setState({ period: e.target.value });
  };

  setModalData = async (val) => {
    if (val === 1) {
      await this.setState({
        modalTitle: "Mean Return",
        modalBody:
          "A mean return (also known as expected return) is the estimated profit or loss an investor expects to achieve from a portfolio of investments. It can also refer to monthly stock returns or the mean value of the probability distribution of possible returns. An investor can calculate the mean return on an investment given the investment's historical returns or probable rates of return under different scenarios.",
      });
    } else if (val === 2) {
      await this.setState({
        modalTitle: "Sharpe Ratio",
        modalBody:
          "The Sharpe ratio divides a portfolio's excess returns by a measure of its volatility to assess risk-adjusted performance Excess returns are those above an industry benchmark or the risk-free rate of return The calculation may be based on historical returns or forecasts A higher Sharpe ratio is better when comparing similar portfolios. The Sharpe ratio has inherent weaknesses and may be overstated for some investment strategies.",
      });
    } else if (val === 3) {
      await this.setState({
        modalTitle: "Alpha Value",
        modalBody:
          "Alpha is sometimes casually referred to as a measure of outperformance, meaning the alpha is the difference between what an asset returned and what its benchmark returned. For example, if a stock fund returned 12 percent and the S&P 500 returned 10 percent, the alpha would be 2 percent.",
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        <div className="container-fluid navbar">
          <div className="row">
            <div className="col col-4">
              <img src={logo} alt="logo" className="c_logo" />
            </div>
            <div className="col col-8 colNav">
              <h3>Simulate Invest</h3>
            </div>
          </div>
        </div>
        <br />
        <br />
        <div className="container searchContainer text-center">
          <h4>Choose a Company (More than 6k companies available)</h4>
          <hr />
          <SelectSearch
            options={this.options}
            value={this.state.selectedCompany}
            search={true}
            onChange={this.handleChange}
            name="company"
            placeholder="Choose a company"
            id="selectSearch_C"
          />
          {/* {this.state.selectedCompany ? (
          <img
            // src={`../assets/logos/${this.state.selectedCompany}.png`}
            src={`../assets/logos/A.png`}
            alt={`${this.state.selectedCompany}.png`}
          />
        ) : null} */}
        </div>
        {/* <div>
          <input type="number" name="days" value={this.state.days} onChange={this.changeDateTime}></input>
          <input type="number" name="months" value={this.state.months} onChange={this.changeDateTime}></input>
          <input type="number" name="years" value={this.state.years} onChange={this.changeDateTime}></input>
        </div> */}
        <div className="container periodContainer text-center">
          <h4>Choose a period</h4>
          <hr />
          <select name="period" onChange={this.handlePeriod} value={this.state.period}>
            <option value={"1d"}>1 Day</option>
            <option value={"5d"}>5 Days</option>
            <option value={"1mo"}>1 Month</option>
            <option value={"3mo"}>3 Month</option>
            <option value={"6mo"}>6 Month</option>
            <option value={"1y"}>1 Year</option>
            <option value={"2y"}>2 Years</option>
            <option value={"5y"}>5 Years</option>
            <option value={"10y"}>10 Years</option>
            <option value={"ytd"}>Year to Date (YTD)</option>
            <option value={"max"}>MAX</option>
          </select>
        </div>
        <div className="container riskContainer text-center">
          <h4>Choose Risk Level</h4>
          <hr />
          <select name="risk" onChange={this.handleRisk} value={this.state.risk}>
            <option value={"low"}>low</option>
            <option value={"medium"}>medium</option>
            <option value={"high"}>high</option>
          </select>
        </div>
        <div className="container btnContainer text-center">
          <button className="btn submit_btn" onClick={this.processData} disabled={this.state.loadingStarted}>
            Submit
          </button>
          <hr />
        </div>

        {this.state.respObtained ? (
          <React.Fragment>
            {this.state.selectedCompany === "AAPL" ? (
              <div className="container text-center company_logo">
                <img src={apple} alt="apple_logo" />
              </div>
            ) : null}
            {this.state.selectedCompany === "MSFT" ? (
              <div className="container text-center company_logo">
                <img src={microsoft} alt="microsoft logo" />
              </div>
            ) : null}
            {this.state.selectedCompany === "NFLX" ? (
              <div className="container text-center company_logo">
                <img src={netflix} alt="netflix logo" />
              </div>
            ) : null}
            {this.state.selectedCompany === "BLK" ? (
              <div className="container text-center company_logo">
                <img src={blk} alt="black rock logo" />
              </div>
            ) : null}
            <div className="container company_name text-center">
              <h4>{this.m.get(this.state.selectedCompany)}</h4>
              <h5 className="stock_price">Stock Price: $ {this.state.modelResult[11]}</h5>
              <br />
              <br />
            </div>
            <div className="container text-center">
              <img src={`data:image/png;base64,${this.state.graph}`} alt="graph"></img>
            </div>
            <div className="container">
              <div className="ch_card">
                Positive Article of this company:
                <p>
                  <a target={"_blank"} href={`${this.state.modelResult[1]}`} rel={"noreferrer"}>
                    {this.state.modelResult[1]}
                  </a>
                </p>
              </div>

              <div className="ch_card">
                Negative Article of this company:
                <p>
                  <a target={"_blank"} href={`${this.state.modelResult[2]}`} rel={"noreferrer"}>
                    {this.state.modelResult[2]}
                  </a>
                </p>
              </div>
              <br />
              <br />
              <div className="container">
                <div className="row">
                  <div className="col col-4 card_sh best_case">
                    <div className="trow1 text-light">Best Case</div>
                    <div className="trow2"> $ {this.state.modelResult[3]}</div>
                  </div>
                  <div className="col col-4 card_sh avg_case">
                    <div className="trow1 text-light">Average Case</div>
                    <div className="trow2"> $ {this.state.modelResult[4]}</div>
                  </div>
                  <div className="col col-4 card_sh worst_case">
                    <div className="trow1 text-light">Worst Case</div>
                    <div className="trow2"> $ {this.state.modelResult[5]}</div>
                  </div>
                </div>
              </div>
              <br />
              <div className="container">
                <div className="row">
                  <div className="col col-4 card_sh ratio_cards">
                    <div className="trow1">
                      Mean Return{" "}
                      <button
                        type="button"
                        className="btn btn-primary modalBtn"
                        data-toggle="modal"
                        data-target="#exampleModalCenter"
                        onClick={() => this.setModalData(1)}
                      >
                        ?
                      </button>
                    </div>
                    <div className="trow2">{this.state.modelResult[6]}</div>
                  </div>
                  <div className="col col-4 card_sh ratio_cards">
                    <div className="trow1">
                      Sharpe Ratio
                      <button
                        type="button"
                        className="btn btn-primary modalBtn"
                        data-toggle="modal"
                        data-target="#exampleModalCenter"
                        onClick={() => this.setModalData(2)}
                      >
                        ?
                      </button>
                    </div>
                    <div className="trow2">{this.state.modelResult[7]}</div>
                  </div>
                  <div className="col col-4 card_sh ratio_cards">
                    <div className="trow1">
                      Alpha Value{" "}
                      <button
                        type="button"
                        className="btn btn-primary modalBtn"
                        data-toggle="modal"
                        data-target="#exampleModalCenter"
                        onClick={() => this.setModalData(3)}
                      >
                        ?
                      </button>
                    </div>
                    <div className="trow2">{this.state.modelResult[8]}</div>
                  </div>
                </div>
              </div>
              <br />
              <br />
              <div className="container">
                <div className="row">
                  <div className="col col-6 card_sh ratio_cards">
                    <div className="trow1">Price to Earning Ratios</div>
                    <div className="trow2">{this.state.modelResult[9]}</div>
                  </div>
                  <div className="col col-6 card_sh ratio_cards">
                    <div className="trow1">Earning Growth Rate for next quarter</div>
                    <div className="trow2">{this.state.modelResult[10]}</div>
                  </div>
                </div>
              </div>
              <br />
              <br />
              <div className="container">
                <div className="row">
                  <div className="col col-12 card_sh ratio_cards">
                    <div className="trow1">Implied Volatility</div>
                    <div className="trow2">{this.state.modelResult[12]}</div>
                  </div>
                </div>
              </div>
              <br />
              <br />
            </div>
            <br />
            <br />
            <div
              className="modal fade"
              id="exampleModalCenter"
              tabIndex="-1"
              role="dialog"
              aria-labelledby="exampleModalCenterTitle"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLongTitle">
                      {this.state.modalTitle}
                    </h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">{this.state.modalBody}</div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        ) : this.state.loadingStarted ? (
          <div className="container text-center gen_res">
            <h3>Generating Results...</h3>
            <br />
            <br />
          </div>
        ) : null}

        <br />
        <br />
        <br />
      </React.Fragment>
    );
  }
}
