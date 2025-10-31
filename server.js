const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Movie Review API is running");
});

app.use("/api/movies", require("./routes/route"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
