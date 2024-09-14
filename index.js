require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/redirect-url", async (req, res) => {
  console.log("Received request with query:", req.query);
  const previewUrl = req.query.previewUrl;

  try {
    const response = await axios.get(previewUrl, {
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      },
    });

    const fullUrl = response.request.res.responseUrl;
    console.log("This is the full url", fullUrl);

    const urlObject = new URL(fullUrl);
    console.log("This is the urlObject", urlObject);
    const origin = urlObject.origin;

    console.log("This is the origin", origin);

    res.status(200).json({ finalUrl: origin });
  } catch (error) {
    console.error("Error fetching final URL:", error.message);
    if (error.response) {
      const redirectUrl = error.response.request.res.responseUrl;
      res.status(200).json({ finalUrl: redirectUrl, error: "404 Not Found" });
    } else {
      res.status(500).json({
        error: "An unexpected error occurred",
        details: error.message,
      });
    }
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Proxy server running on ${PORT}`);
});
