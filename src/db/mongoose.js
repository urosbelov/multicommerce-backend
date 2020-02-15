const mongoose = require("mongoose");

module.exports = {
  start: () => {
    mongoose
      .connect(
        "mongodb+srv://admin:Microsoft-1997@node-mali-vq2vu.mongodb.net/test?retryWrites=true&w=majority",
        {
          useNewUrlParser: true,
          useCreateIndex: true,
          useUnifiedTopology: true,
          useFindAndModify: false
        }
      )
      .then(() => {
        console.log("MongoDB connected...");
      })
      .catch(e => {
        console.log(e);
      });
  }
};
