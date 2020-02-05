import React, { Component } from "react";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Legend,
  Tooltip
} from "recharts";
import Title from "./userTitle";
import { getSql } from "../services/sqlService";
import commodityService from "../services/commodityService";
import auth from "../services/authService";
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
    marginLeft: "35%",
    marginTop: "20%"
  },
  fixedHeight: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    margin: theme.spacing(1),
    height: 300
  },
  tooltip: {
    border:"5px solid white",
    outline:"1px solid lightgray",
    backgroundColor: "white"
  }
});
// Generate Sales Data
function createData(name, value) {
  return { name, value };
}

function currencyFormat(num) {
  return "$" + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

class EstimatedPortfolioHoldingsChart extends Component {
  state = {
    rows: [],
    colors: ["#A86C24", "#8D8C8A", "#333333"],
    isLoading: false
  };

  async componentDidMount() {
    this.setState({ isLoading: true });
    const commodities = auth.getCurrentUser().isAdmin
      ? await commodityService.getCommodities()
      : await commodityService.getCommodity();

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
    let goldSum = commodities.data.reduce((acc, val) => {
      return val.type === "gold" ? acc + val.totalWeight : acc;
    }, 0);

    let silverSum = commodities.data.reduce((acc, val) => {
      return val.type === "silver" ? acc + val.totalWeight : acc;
    }, 0);

    let platSum = commodities.data.reduce((acc, val) => {
      return val.type === "platinum" ? acc + val.totalWeight : acc;
    }, 0);

    const rows = [];
    rows.push(
      createData("Gold", Number((goldSum * currentGold.value).toFixed(2)))
    );
    rows.push(
      createData("Silver", Number((silverSum * currentSilver.value).toFixed(2)))
    );
    rows.push(
      createData("Platinum", Number((platSum * currentPlat.value).toFixed(2)))
    );

    this.setState({ rows, isLoading: false });
  }
  render() {
    const { classes } = this.props;
    const colors = this.state.colors;
    const rows = this.state.rows;
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      index
    }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + (radius + 65) * Math.cos(-midAngle * RADIAN);
      const y = cy + (radius + 65) * Math.sin(-midAngle * RADIAN);

      return (
        <text
          x={x}
          y={y}
          fill="black"
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    const CustomTooltip = ({ active, payload, label }) => {
      if (active) {
        return (
          <div className ={classes.tooltip}>
            <p >{`${payload[0].name} : ${currencyFormat(payload[0].value)}`}</p>
          </div>
        );
      }
    
      return null;
    };
    return (
      <React.Fragment>
        <Grid item xs={4} md={4} lg={4}>
          <Paper className={classes.fixedHeight}>
            <Title>Current Estimated Holdings in USD</Title>
            {this.state.isLoading && (
              <CircularProgress size={80} className={classes.progress} />
            )}
            {!this.state.isLoading && (
              <ResponsiveContainer>
                <PieChart width={1460} height={500}>
                  <Legend verticalAlign="top" height={36} />
                  <Pie
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#A86C24"
                    label={renderCustomizedLabel}
                    labelLine={true}
                    data={rows}
                  >
                    {this.state.rows.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </React.Fragment>
    );
  }
}

EstimatedPortfolioHoldingsChart.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(EstimatedPortfolioHoldingsChart);
