const express = require("express");
const request = require("request");
const config = require("config");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator/check");

const Profile = require("../../dbModels/Profile");
const User = require("../../dbModels/User");
const Post = require("../../dbModels/Post");
const Img = require("../../dbModels/Img");

// @route    POST api/img
// @desc     Post current users profile
// @access   Private
router.post(
  "/",
  auth,
  [
    check("text", "Must be an image")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    try {
      // Using upsert option (creates new doc if no match is found):
      let newImg = new Img({
        img: req.body.image,
        user: req.user.id
      });

      const img = newImg.save();

      //   let img = await Img.findOneAndUpdate(
      //     { user: req.user.id, img: req.body.image },

      //     { new: true, upsert: true }
      //   );
      res.json(img);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
