import React, { Component } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import PortfolioPurchaseChart from "../component/portfolioPurchaseChart";
import EstimatedPortfolioHoldingsChart from "../component/estimatedPortfolioHoldingsChart";
import PortfolioHoldingsChart from "../component/portfolioHoldingsChart";
import ComparisonMetalChart from "../component/comparisonMetalChart";
import GoldTable from "../component/goldTable";

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
};

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper
  }
});

class DashboardPage extends Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <TabContainer>
          <Container maxWidth="lg" className={classes.container}>
            <Grid container spacing={3}>
              <PortfolioPurchaseChart />
              <EstimatedPortfolioHoldingsChart />
              <PortfolioHoldingsChart />
              <ComparisonMetalChart />
              <GoldTable />
            </Grid>
          </Container>
        </TabContainer>
      </div>
    );
  }
}

DashboardPage.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(DashboardPage);
