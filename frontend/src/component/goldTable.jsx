/* eslint-disable no-script-url */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import commodityService from "../services/commodityService";
import auth from "../services/authService";
import { getSql } from "../services/sqlService";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper
  },
  paper: {
    padding: theme.spacing(0),
    margin: theme.spacing(1),
    display: "flex",
    flexDirection: "column"
  },
  progress: {
    color: "primary",
    position: "static",
    marginLeft: "45%",
    marginTop: "20%"
  },
  barHeight: {
    height: 400
  }
});
// Generate Order Data
function createWeightData(id, metal, portfolioPurchasedUSD, metalTotalWeight) {
  return {
    id,
    metal,
    portfolioPurchasedUSD,
    metalTotalWeight
  };
}

function createCurrentMarketData(
  id,
  metal,
  currentPrice,
  currentPortfolioSGD,
  currentPortfolioUSD,
  profitMetalType,
  portfolioPurchasedUSD,
  profitPercentage
) {
  return {
    id,
    metal,
    currentPrice,
    currentPortfolioSGD,
    currentPortfolioUSD,
    profitMetalType,
    portfolioPurchasedUSD,
    profitPercentage
  };
}

function currencyFormat(num) {
  return "$" + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

class GoldTable extends Component {
  state = {
    rows: [],
    sqlData: [],
    conversionRate: "",
    isLoading: false
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

    const rows = [];
    rows.push(
      createWeightData(0, "Gold", goldPortfolioPurchased, goldSum.toFixed(4))
    );

    rows.push(
      createWeightData(
        1,
        "Silver",
        silverPortfolioPurchased,
        silverSum.toFixed(4)
      )
    );

    rows.push(
      createWeightData(
        2,
        "Platinum",
        platPortfolioPurchased,
        platSum.toFixed(4)
      )
    );
    this.setState({ rows });

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

    let conversionRateArr = sqlService.data.find(function(element) {
      return element.type === "USSGDbid";
    });

    const conversionRate = conversionRateArr.value;
    const sqlData = [];

    sqlData.push(
      createCurrentMarketData(
        0,
        "Gold",
        Number(currentGold.value),
        goldSum * currentGold.value * conversionRate,
        goldSum * currentGold.value,
        goldSum * currentGold.value - goldPortfolioPurchased,
        goldPortfolioPurchased,
        (
          (
            (goldSum * currentGold.value - goldPortfolioPurchased) /
            goldPortfolioPurchased
          ).toFixed(2) * 100
        ).toFixed(2)
      )
    );

    sqlData.push(
      createCurrentMarketData(
        1,
        "Silver",
        Number(currentSilver.value),
        silverSum * currentSilver.value * conversionRate,
        silverSum * currentSilver.value,
        silverSum * currentSilver.value - silverPortfolioPurchased,
        silverPortfolioPurchased,
        (
          ((silverSum * currentSilver.value - silverPortfolioPurchased) /
            silverPortfolioPurchased) *
          100
        ).toFixed(2)
      )
    );

    sqlData.push(
      createCurrentMarketData(
        2,
        "Platinum",
        Number(currentPlat.value),
        platSum * currentPlat.value * conversionRate,
        platSum * currentPlat.value,
        platSum * currentPlat.value - platPortfolioPurchased,
        platPortfolioPurchased,
        (
          ((platSum * currentPlat.value - platPortfolioPurchased) /
            platPortfolioPurchased) *
          100
        ).toFixed(2)
      )
    );

    this.setState({ sqlData, conversionRate, isLoading: false });
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Grid item xs={8} md={8} lg={8}>
          <Paper className={classes.barHeight}>
            {this.state.isLoading && (
              <CircularProgress size={80} className={classes.progress} />
            )}
            {!this.state.isLoading && (
              <React.Fragment>
                <Grid direction={"row"} container>
                  <Grid item xs={6}>
                    <Paper className={classes.paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Metals</TableCell>
                            <TableCell>Portfolio in Troy Ounces</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {this.state.rows.map(row => (
                            <TableRow key={row.id}>
                              <TableCell>{row.metal} (oz)</TableCell>
                              <TableCell align="center">
                                {row.metalTotalWeight}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper className={classes.paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {/* <button onClick={() => this.handleClick()}> Click </button> */}
                            {/* <TableCell> Metal</TableCell> */}
                            <TableCell />
                            <TableCell>Current Market Price</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {this.state.sqlData.map(sql => (
                            <TableRow key={sql.id}>
                              <TableCell>{sql.metal} (USD/oz)</TableCell>
                              <TableCell align="center">
                                {currencyFormat(sql.currentPrice)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell>USD/SGD</TableCell>
                            <TableCell align="center">
                              {this.state.conversionRate}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper className={classes.paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Metals</TableCell>
                            <TableCell>Current Portfolio in SGD</TableCell>
                            <TableCell>Current Portfolio in USD</TableCell>
                            <TableCell>
                              Portfolio when Purchased in USD
                            </TableCell>
                            <TableCell>Profit / Metal Type</TableCell>
                            <TableCell>Profit Percentage</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {this.state.sqlData.map(sql => (
                            <TableRow key={sql.id}>
                              <TableCell>{sql.metal}</TableCell>
                              <TableCell size="small" align="right">
                                {currencyFormat(sql.currentPortfolioSGD)}
                              </TableCell>
                              <TableCell size="small" align="right">
                                {currencyFormat(sql.currentPortfolioUSD)}
                              </TableCell>
                              <TableCell size="small" align="right">
                                {currencyFormat(sql.portfolioPurchasedUSD)}
                              </TableCell>
                              <TableCell size="small" align="right">
                                {currencyFormat(sql.profitMetalType)}
                              </TableCell>
                              <TableCell size="small" align="right">
                                {sql.profitPercentage}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  </Grid>
                </Grid>
              </React.Fragment>
            )}
          </Paper>
        </Grid>
      </React.Fragment>
    );
  }
}

GoldTable.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(GoldTable);
