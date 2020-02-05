import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import auth from "../services/authService";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import commodityService from "../services/commodityService";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import { Link } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import PascalCase from "pascal-case";

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
  },
  paper: {
    padding: theme.spacing(2),
    overflow: "auto",
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: theme.spacing(1)
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: "40%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  backButton: {
    padding: theme.spacing(0),
    marginBottom: theme.spacing(1)
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  }
});

class AdminCommodityForm extends Component {
  state = {
    data: {
      certificateNum: "",
      conversionRate: "",
      _id: "",
      date: "",
      type: "",
      sealNum: "",
      serialNum: "",
      storageLocation: "",
      description: "",
      quantity: "",
      totalWeight: "",
      costPerPieceUSD: "",
      costPerPieceSGD: "",
      costPriceTotalUSD: "",
      costPriceTotalSGD: "",
      owner: {
        customerNum: ""
      }
    },
    options: ["gold", "silver", "platinum"],
    id: this.props.match.params.id
  };

  async componentDidMount() {
    try {
      const response = await commodityService.getCommodityById(this.state.id);
      const data = response.data;
      this.setState({ data });
    } catch (ex) {}
  }

  handleChange = e => {
    const target = e.target ? e.target : e.currentTarget;
    const data = { ...this.state.data };
    data[target.name] = target.value;

    if (target.name === "costPerPieceSGD") {
      data["costPerPieceUSD"] = target.value / this.state.data.conversionRate;
      data["costPriceTotalUSD"] =
        (target.value / this.state.data.conversionRate) *
        this.state.data.quantity;
      data["costPriceTotalSGD"] = target.value * this.state.data.quantity;
    } else if (target.name === "costPerPieceUSD") {
      data["costPerPieceSGD"] = target.value * this.state.data.conversionRate;
      data["costPriceTotalSGD"] =
        target.value *
        this.state.data.conversionRate *
        this.state.data.quantity;
      data["costPriceTotalUSD"] = target.value * this.state.data.quantity;
    }

    if (target.name === "conversionRate") {
      data["costPerPieceUSD"] = "";
      data["costPerPieceSGD"] = "";
      data["costPriceTotalUSD"] = "";
      data["costPriceTotalSGD"] = "";
    }

    if (target.name === "quantity") {
      data["costPriceTotalSGD"] =
        target.value *
        this.state.data.conversionRate *
        this.state.data.costPerPieceUSD;
      data["costPriceTotalUSD"] =
        (this.state.data.costPerPieceSGD / this.state.data.conversionRate) *
        target.value;
    }

    if (target.name === "customerNum") {
      data.owner.customerNum = target.value;
    }

    this.setState({ data });
  };

  handleSubmit = async e => {
    e.preventDefault();
    await commodityService.saveCommodity(this.state.data, this.state.id);
    this.goBack();
  };

  goBack = () => {
    this.props.history.goBack();
  };

  render() {
    const { classes } = this.props;
    const {
      certificateNum,
      conversionRate,
      _id,
      date,
      type,
      sealNum,
      serialNum,
      storageLocation,
      description,
      quantity,
      totalWeight,
      costPerPieceUSD,
      costPerPieceSGD,
      costPriceTotalUSD,
      costPriceTotalSGD,
      owner
    } = this.state.data;
    const { options } = this.state;

    const costPerPieceUSDString = costPerPieceUSD.toString().split(".");
    const costPerPieceSGDString = costPerPieceSGD.toString().split(".");

    return (
      <div className={classes.root}>
        <TabContainer>
          <Container maxWidth="lg">
            <Button
              className={classes.backButton}
              variant="text"
              size="large"
              color="primary"
              onClick={this.goBack}
            >
              <ChevronLeft />
              Back
            </Button>
            <Paper className={classes.paper}>
              <Typography component="h1" variant="h5">
                Add / Edit Commodity
              </Typography>
              <form
                className={classes.form}
                noValidate
                // onSubmit={this.handleSubmit}
              >
                <Grid container spacing={1} alignItems="center">
                  {owner && (
                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="customerNum"
                        label="Customer Number"
                        name="customerNum"
                        onChange={this.handleChange}
                        value={owner.customerNum}
                        autoFocus
                      />
                    </Grid>
                  )}

                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="date"
                      name="date"
                      label="Date"
                      type="date"
                      InputLabelProps={{
                        shrink: true
                      }}
                      value={date.substring(0, 10)}
                      onChange={this.handleChange}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <FormControl
                      variant="outlined"
                      className={classes.formControl}
                    >
                      <InputLabel htmlFor="outlined-age-simple">
                        Type
                      </InputLabel>
                      <Select
                        onChange={this.handleChange}
                        input={
                          <OutlinedInput name="type" id="type" value={type} />
                        }
                        value={PascalCase(type)}
                      >
                        {options.map(option => (
                          <MenuItem
                            key={PascalCase(option)}
                            value={PascalCase(option)}
                          >
                            {PascalCase(option)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="certificateNum"
                      label="Certificate Number"
                      name="certificateNum"
                      value={certificateNum}
                      onChange={this.handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="sealNum"
                      label="Seal Number"
                      name="sealNum"
                      value={sealNum}
                      onChange={this.handleChange}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="storageLocation"
                      label="Storage Location"
                      name="storageLocation"
                      value={storageLocation}
                      onChange={this.handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="serialNum"
                      label="Serial Number"
                      name="serialNum"
                      value={serialNum}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="description"
                      label="Description"
                      name="description"
                      value={description}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="quantity"
                      label="Quantity"
                      value={quantity}
                      onChange={this.handleChange}
                      type="number"
                      InputLabelProps={{
                        shrink: true
                      }}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="totalWeight"
                      label="Total Weight"
                      name="totalWeight"
                      value={totalWeight}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="conversionRate"
                      label="Conversion Rate"
                      name="conversionRate"
                      value={conversionRate}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="costPerPieceUSD"
                      label="Cost Per Piece USD"
                      name="costPerPieceUSD"
                      value={
                        costPerPieceUSDString[1]
                          ? costPerPieceUSDString[1].length > 2
                            ? Number(costPerPieceUSD).toFixed(2)
                            : costPerPieceUSD
                          : costPerPieceUSD
                      }
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="costPerPieceSGD"
                      label="Cost Per Piece SGD"
                      name="costPerPieceSGD"
                      value={
                        costPerPieceSGDString[1]
                          ? costPerPieceSGDString[1].length > 2
                            ? Number(costPerPieceSGD).toFixed(2)
                            : costPerPieceSGD
                          : costPerPieceSGD
                      }
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="costPriceTotalUSD"
                      label="Cost Price Total USD"
                      name="costPriceTotalUSD"
                      value={Number(costPriceTotalUSD).toFixed(2)}
                      disabled
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="costPriceTotalSGD"
                      label="Cost Price Total SGD"
                      name="costPriceTotalSGD"
                      value={Number(costPriceTotalSGD).toFixed(2)}
                      disabled
                      onChange={this.handleChange}
                    />
                  </Grid>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={this.handleSubmit}
                  >
                    Add / Update
                  </Button>
                </Grid>
              </form>
            </Paper>
          </Container>
        </TabContainer>
      </div>
    );
  }
}

AdminCommodityForm.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AdminCommodityForm);
