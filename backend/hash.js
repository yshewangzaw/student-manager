const bcrypt = require("bcrypt");

(async () => {
  console.log(await bcrypt.hash("1234", 10));
})();
