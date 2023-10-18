//Reference
const { Sequelize, DataTypes } = require("sequelize");

//SQL Connection
const icx_database = require("../instance/ms_instance");
const Pcmb_data = icx_database.define('pcmb_data', {
  // Model attributes are defined here

//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allownull: false,
//     primaryKey: true,
//   },
  Timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  PROCESS: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  MODEL: {
    type: DataTypes.STRING,
    allowNull: false,
  },
 
  TOTAL_LG: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  LG_STEP_OD: {
  type: DataTypes.FLOAT,
  allowNull: false,
  },
  LG_STEP_ID_CP: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }, 
  ID_TOP: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }, 
  ID_BOTTOM: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }, 
  OD1: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }, 
  OD2: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }, 
  OD3: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }, 

}
);

(async () => {
await Pcmb_data.sync({ force: false });
})();

module.exports = Pcmb_data;