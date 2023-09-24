const Sequelize = require("sequelize");
const dbms = new Sequelize("mms_demo", "sa", "sa@admin", {
  host: 'localhost',
  dialect: "mssql",
  dialectOptions: {
    options: {
      instanceName: "SQLEXPRESS",
    },
  },
  timezone: '+07:00'
});
(async () => {
  await dbms.authenticate();
})();
module.exports = dbms;