const mongoose = require("mongoose");

const ImgSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  img: {
    type: String
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  }
});

module.exports = Img = mongoose.model("img", ImgSchema);
