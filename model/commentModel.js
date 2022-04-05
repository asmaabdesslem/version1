const mongoose = require("mongoose");
const mongoosePaginate= require('mongoose-paginate-v2')
const CommentSchema = new mongoose.Schema(
  {
    commentaire: { type: String, required: true },
    numReponses: { type: String, required: false },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    reponses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reponse",
      },
    ],
    postedby: { type: String, required: false, ref: "User" },
    likes: { type: Number, required: false },
    dislikes: { type: Number, required: false },
    usersLiked: { type: [String], required: false },
    usersDisliked: { type: [String], required: false },
    analysis_scoring : Number,

  },

  { timestamps: true }
);
CommentSchema.plugin(mongoosePaginate)
//generate model
const Comment = mongoose.model("Comment", CommentSchema);

//export model
module.exports = Comment;
