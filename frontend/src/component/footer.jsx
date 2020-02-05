import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Link from "@material-ui/core/Link";

const styles = theme => ({
  footer: {
    position: "relative",
    bottom: 0,
    width: "100%",
    backgroundColor: "#dcdcdc",
    textAlign: "center"
  }
});
class Footer extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <footer className={classes.footer}>
          <Container>
            <Typography variant="body1">
              &copy; 2019 All rights reserved. GoldSilver Central Pte. Ltd.
            </Typography>
            <Typography>UEN: 201107187N</Typography>
            <a
              href="https://www.goldsilvercentral.com.sg/agreement-policy/"
              target="_blank"
            >
              Agreement &amp; Policy
            </a>
          </Container>
        </footer>
      </div>
    );
  }
}

Footer.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Footer);
