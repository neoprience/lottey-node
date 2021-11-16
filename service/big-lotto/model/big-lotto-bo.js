const mongoose = require("../../../db/mongo");

const schema = mongoose.Schema(
  {
    frontZone: Array,
    backZone: Array
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "create_time",
      updatedAt: "update_time",
    },
  }
);

const model = mongoose.model("biglotto", schema, "biglotto");

module.exports = model;
