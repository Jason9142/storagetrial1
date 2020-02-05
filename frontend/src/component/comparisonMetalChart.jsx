import React, { Component } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  LabelList
} from "recharts";
import Title from "./userTitle";
import commodityService from "../services/commodityService";
import auth from "../services/authService";
import { getSql } from "../services/sqlService";
import CircularProgress from "@material-ui/core/CircularProgress";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper
  },
  progress: {
    color: "primary",
    position: "static",
    marginLeft: "40%",
    marginTop: "35%"
  },
  barHeight: {
    height: 400
  },
  tooltip: {
    border: "5px solid white",
    outline: "1px solid lightgray",
    backgroundColor: "white"
  }
});

// Generate Sales Data
function createData(name, currentPortfolio, portfolioPurchased) {
  return { name, currentPortfolio, portfolioPurchased };
}

function currencyFormat(num) {
  return "$" + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

class ComparisonMetalChart extends Component {
  state = {
    rows: [],
    sqlData: [],
    isLoading: false,
    max: 0,
    min: 0
  };
  async componentDidMount() {
    this.setState({ isLoading: true });
    const commodities = auth.getCurrentUser().isAdmin
      ? await commodityService.getCommodities()
      : await commodityService.getCommodity();

    let goldSum = commodities.data.reduce((acc, val) => {
      return val.type === "gold" ? acc + val.totalWeight : acc;
    }, 0);

    let silverSum = commodities.data.reduce((acc, val) => {
      return val.type === "silver" ? acc + val.totalWeight : acc;
    }, 0);

    let platSum = commodities.data.reduce((acc, val) => {
      return val.type === "platinum" ? acc + val.totalWeight : acc;
    }, 0);

    let goldPortfolioPurchased = commodities.data.reduce((acc, val) => {
      return val.type === "gold" ? acc + val.costPriceTotalUSD : acc;
    }, 0);

    let silverPortfolioPurchased = commodities.data.reduce((acc, val) => {
      return val.type === "silver" ? acc + val.costPriceTotalUSD : acc;
    }, 0);

    let platPortfolioPurchased = commodities.data.reduce((acc, val) => {
      return val.type === "platinum" ? acc + val.costPriceTotalUSD : acc;
    }, 0);

    const sqlService = await getSql();
    let currentGold = sqlService.data.find(function(element) {
      return element.type === "PGOLDbid";
    });

    let currentSilver = sqlService.data.find(function(element) {
      return element.type === "PSILVERbid";
    });

    let currentPlat = sqlService.data.find(function(element) {
      return element.type === "PPLATINUMbid";
    });

    const minMax = [
      goldSum * currentGold.value,
      silverSum * currentSilver.value,
      platSum * currentPlat.value,
      goldPortfolioPurchased,
      silverPortfolioPurchased,
      platPortfolioPurchased
    ];

    const rows = [];
    rows.push(
      createData(
        "Gold",
        Number((goldSum * currentGold.value).toFixed(2)),
        Number(goldPortfolioPurchased.toFixed(2))
      )
    );
    rows.push(
      createData(
        "Silver",
        Number((silverSum * currentSilver.value).toFixed(2)),
        Number(silverPortfolioPurchased.toFixed(2))
      )
    );
    rows.push(
      createData(
        "Platinum",
        Number((platSum * currentPlat.value).toFixed(2)),
        Number(platPortfolioPurchased.toFixed(2))
      )
    );

    let max = Math.max(...minMax);
    let num = max.toFixed(0).length - 2;
    max = Math.ceil(max / Math.pow(10, num)) * Math.pow(10, num);

    this.setState({
      rows,
      isLoading: false,
      max,
      min: Math.min(...minMax)
    });
  }

  render() {
    const { classes } = this.props;

    const CustomTooltip = ({ active, payload, label }) => {
      if (active) {
        return (
          <div className={classes.tooltip}>
            <p>{`${payload[0].name} : ${currencyFormat(payload[0].value)}`}</p>
            <p>{`${payload[1].name} : ${currencyFormat(payload[1].value)}`}</p>
          </div>
        );
      }

      return null;
    };

    return (
      <React.Fragment>
        <Grid item xs={4} md={4} lg={4}>
          <Paper className={classes.barHeight}>
            <Title>Comparison by Metal Type</Title>
            {this.state.isLoading && (
              <CircularProgress size={80} className={classes.progress} />
            )}
            {!this.state.isLoading && (
              <ResponsiveContainer height="80%">
                <BarChart
                  margin={{
                    top: 40,
                    right: 30,
                    left: 20,
                    bottom: 5
                  }}
                  data={this.state.rows}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    type="number"
                    domain={[0, this.state.max]}
                    padding={{ top: 30 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    name="Current Portfolio"
                    dataKey="currentPortfolio"
                    fill="#8884d8"
                  />
                  <Bar
                    name="Portfolio Purchased"
                    dataKey="portfolioPurchased"
                    fill="#82ca9d"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </React.Fragment>
    );
  }
}

ComparisonMetalChart.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ComparisonMetalChart);
