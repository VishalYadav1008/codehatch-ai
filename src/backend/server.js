import express from "express";
const app = express();
const PORT = 5000;

app.get("/", (req, res) => {
  res.send("DevNest AI Backend Running 🚀");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:5000`));
