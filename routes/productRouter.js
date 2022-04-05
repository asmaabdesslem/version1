const Product = require("../model/productModel");
const Comment = require("../model/commentModel");
const User = require("../model/User");
const natural = require("natural");
const stopword = require("stopword");



const wordDict = {
  "aren't": "are not",
  "can't": "cannot",
  "couldn't": "could not",
  "didn't": "did not",
  "doesn't": "does not",
  "don't": "do not",
  "hadn't": "had not",
  "hasn't": "has not",
  "haven't": "have not",
  "he'd": "he would",
  "he'll": "he will",
  "he's": "he is",
  "i'd": "I would",
  "i'd": "I had",
  "i'll": "I will",
  "i'm": "I am",
  "isn't": "is not",
  "it's": "it is",
  "it'll": "it will",
  "i've": "I have",
  "let's": "let us",
  "mightn't": "might not",
  "mustn't": "must not",
  "shan't": "shall not",
  "she'd": "she would",
  "she'll": "she will",
  "she's": "she is",
  "shouldn't": "should not",
  "that's": "that is",
  "there's": "there is",
  "they'd": "they would",
  "they'll": "they will",
  "they're": "they are",
  "they've": "they have",
  "we'd": "we would",
  "we're": "we are",
  "weren't": "were not",
  "we've": "we have",
  "what'll": "what will",
  "what're": "what are",
  "what's": "what is",
  "what've": "what have",
  "where's": "where is",
  "who'd": "who would",
  "who'll": "who will",
  "who're": "who are",
  "who's": "who is",
  "who've": "who have",
  "won't": "will not",
  "wouldn't": "would not",
  "you'd": "you would",
  "you'll": "you will",
  "you're": "you are",
  "you've": "you have",
  "'re": " are",
  "wasn't": "was not",
  "we'll": " will",
  "didn't": "did not"
}

// Contractions to standard lexicons Conversion
const convertToStandard = text => {
  const data = text.split(' ');
  data.forEach((word, index) => {
      Object.keys(wordDict).forEach(key => {
          if (key === word.toLowerCase()) {
              data[index] = wordDict[key]
          };
      });
  });

  return data.join(' ');
}

// LowerCase Conversion
const convertTolowerCase = text => {
  return text.toLowerCase();
}

// Pure Alphabets extraction
const removeNonAlpha = text => {

  // This specific Regex means that replace all
  //non alphabets with empty string.
  return text.replace(/[^a-zA-Z\s]+/g, '');
}
var express = require("express");

const {
  requireAuth,
  checkUser,
  notReqAuthentication,
} = require("../middleware/authMiddleware");
const bodyParser = require("body-parser");
const multer = require("multer");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

var Router = express.Router();

//MailKey
//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

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);
// Multer config ************************************************
const MIME_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  // destination
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE[file.mimetype];
    let error = new Error("Mime type is invalid");
    if (isValid) {
      error = null;
    }
    //Affecter la destination
    cb(null, "/images");
  },
  //file name
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const extension = MIME_TYPE[file.mimetype];
    const imgName = name + "-" + Date.now() + "--" + "." + extension;
    //Affecter file name
    cb(null, imgName);
  },
});

// ***************************************************************

// const {
//   verifyToken,
//   verifyTokenAndAuthorization,
//   verifyTokenAndAdmin,
// } = require("./verifyToken");

//CREATE
//with token
//Router.post("/", verifyTokenAndAdmin, async (req, res) => {

//ma8ir token
Router.post(
  "/",
  checkUser,
  multer({ storage: storage }).single("img"),
  async (req, res) => {
    console.log("product", req.body);
    let url = req.protocol + "://" + req.get("host");
    // const newProduct = new Product(req.body);
    //*********************************************************************** */
    User.findById(req.user._id).then((result) => {
      if (!result) {
        console.log("eerr");
      }
      console.log("ee", result.firstName);
    });
    //*********************************************************************** */

    const newProduct = new Product({
      name: req.body.name,
      user: req.user._id,
      brand: req.body.brand,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      comments: req.body.comments,
      countInStock: req.body.countInStock,
      //image: url + "/images/" + req.file.filename,
      //req.body
    });

    try {
      const savedProduct = await newProduct.save().then((result) => {
        transporter.sendMail({
          to: "bouricha.fadi@esprit.tn",
          from: "fadiasg01@gmail.com",
          subject: "product ajoutee",
          html: `
          <p>Product Added</p> `,
          //  <h5>click in this <a href="${EMAIL}/reset/${token}">link</a> to reset password</h5>
        });
        // res.json({message:"check your email"})
      });
      res.status(200).json(savedProduct);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

//UPDATE
Router.put("/:id", checkUser, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
Router.delete("/:id", checkUser, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT
Router.get("/find/:id", checkUser, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL PRODUCTS
Router.get("/afficheProducts", checkUser, async (req, res) => {
  // const qNew = req.query.new;
  // const qCategory = req.query.category;
  // try {
  //   let products;

  //   if (qNew) {
  //     products = await Product.find().sort({ createdAt: -1 }).limit(1);
  //   } else if (qCategory) {
  //     products = await Product.find({
  //       categories: {
  //         $in: [qCategory],
  //       },
  //     });
  //   } else {
  //     products = await Product.find();
  //   }

  //   res.status(200).json(products);
  // } catch (err) {
  //   res.status(500).json(err);
  // }
  if (req.query.page && req.query.limit) {
    Product.paginate({}, { page: req.query.page, limit: req.query.limit })
      .then((data) => {
        res.status(200).json({
          data,
        });
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  } else {
    Product.find()
      .then((data) => {
        res.status(200).json({
          data,
        });
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  }
});

// ******************* LIKE ******************************
Router.post("/LikeProduct/:id", checkUser, (req, res, next) => {
  Product.findOne({
    _id: req.params.id,
  }).then((product) => {
    // LIKE
    if (req.body.like == 1) {
      if (product.usersDisliked.includes(req.user._id)) {
        product.usersDisliked.pull(req.user._id);
        product.dislikes = product.dislikes - 1;
        product.usersLiked.push(req.user._id);
        product.likes = product.likes + 1;
      } else {
        if (!product.usersLiked.includes(req.user._id)) {
          product.usersLiked.push(req.user._id);
          product.likes = product.likes + 1;
        } else {
          product.usersLiked.pull(req.user._id);
          product.likes = product.likes - 1;
        }
      }
    }

    //DISLIKE
    else if (req.body.like == -1) {
      if (product.usersLiked.includes(req.user._id)) {
        product.usersLiked.pull(req.user._id);
        product.likes = product.likes - 1;
        product.usersDisliked.push(req.user._id);
        product.dislikes = product.dislikes + 1;
      } else {
        if (!product.usersDisliked.includes(req.user._id)) {
          product.usersDisliked.push(req.user._id);
          product.dislikes = product.dislikes + 1;
        } else {
          product.usersDisliked.pull(req.user._id);
          product.dislikes = product.dislikes - 1;
        }
      }
    }

    product
      .save()
      .then(() => {
        res.status(201).json({
          message: "Liked changed successfully!",
        });
      })
      .catch((error) => {
        res.status(400).json({
          error: error,
        });
      });
  });
});

/********************* Commentaires ******************************** */

//reponse
Router.post("/addreponse/:idProd/:id", checkUser, async (req, res) => {
  const commentId = req.params.id;
  const productId = req.params.idProd;

  const comment = await Comment.findById(commentId);
  const product = await Product.findById(productId);
  if (product) {
    if (comment) {
      const reponse = {
        //  name: req.user.name,
        reponse: req.body.reponse,
      };
      comment.reponses.push(reponse);
      //product.comments.reponses.push(reponse);

      comment.numReponses = comment.reponses.length;
      // product.rating =
      //   product.reviews.reduce((a, c) => c.rating + a, 0) /
      //   product.reviews.length;

      const updatedComment = await comment.save();
      // const updatedProduct = await product.save();

      console.log(updatedComment);
      res.status(201).send({
        message: "reponse Created",
        //review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      });
    } else {
      res.status(404).send({ message: "Commentaire Not Found" });
    }
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});

//CREATE
//with token
//Router.post("/", verifyTokenAndAdmin, async (req, res) => {
//ma8ir token
Router.post("/addComment/:id", checkUser, async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  console.log(user.firstName);
  const productId = req.params.id;
  const product = await Product.findById(productId);
  const commentaire = req.body.commentaire;
  const likes = req.body.likes;
  const dislikes = req.body.dislikes;

  const postedby = req.user._id;
  const lexData = convertToStandard(req.body.commentaire);
  console.log("Lexed Data: ",lexData);

  // Convert all data to lowercase
  const lowerCaseData = convertTolowerCase(lexData);
  console.log("LowerCase Format: ",lowerCaseData);

  // Remove non alphabets and special characters
  const onlyAlpha = removeNonAlpha(lowerCaseData);
  console.log("OnlyAlpha: ",onlyAlpha);

  // Tokenization
  const tokenConstructor = new natural.WordTokenizer();
  const tokenizedData = tokenConstructor.tokenize(onlyAlpha);
  console.log("Tokenized Data: ",tokenizedData);

  // Remove Stopwords
  const filteredData = stopword.removeStopwords(tokenizedData);
  console.log("After removing stopwords: ",filteredData);

  // Stemming
  const Sentianalyzer =
  new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
  const analysis_score = Sentianalyzer.getSentiment(filteredData);
  console.log("Sentiment Score: ",analysis_score);

  const newComment = new Comment({
    commentaire,
    likes,
    dislikes,
    product,
    postedby,
    analysis_scoring : analysis_score

  });
  newComment
    .save()
    .then()
    .catch((err)=>{
      console.log(err)
    });
  Product.findById(productId)
    .then((productt) => {
      productt.comments.push(newComment);
      productt
        .save()
        .then(() => res.json("comment added to product"))
        .catch((err)=>{
          console.log(err)
        });
    })

    .catch((err)=>{
      console.log(err)
    });
  // if (product) {
  //   const commentaire = {
  //     //   //  name: req.user.name,
  //     commentaire: req.body.commentaire,
  //   };
  //   console.log(commentaire);
  //   console.log(product);
  //   product.comments.push(commentaire);
  //   product.numComments = product.comments.length;
  //   // product.rating =
  //   //   product.reviews.reduce((a, c) => c.rating + a, 0) /
  //   //   product.reviews.length;
  //   const newComment = new Comment(
  //     req.body
  //   );
  //   const savedComment = await newComment.save()
  //   const updatedProduct = await product.save();
  //   res.status(201).send({
  //     message: "commentaire Created",
  //     //review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
  //   });
  // } else {
  //   res.status(404).send({ message: "Product Not Found" });
  // }
});

//UPDATE
Router.put("/:id", checkUser, async (req, res) => {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedComment);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
Router.delete("/:id", checkUser, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json("Comment has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT
Router.get("/find/:id", checkUser, (req, res) => {
  const comment = Comment.findById(req.params.id, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      res.send(doc);
    }
  });
});

/** afficher touts les Commentaires
 */

Router.get("/afficheComments", checkUser, (req, res, next) => {
  if (req.query.page && req.query.limit) {
    Comment.paginate({}, { page: req.query.page, limit: req.query.limit })
      .then((data) => {
        res.status(200).json({
          data,
        });
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  } else {
    Comment.find()
      .then((data) => {
        res.status(200).json({
          data,
        });
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  }
});

Router.route("/countDocuments").get(function (req, res) {
  Comment.count({}, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

// ******************* LIKE ******************************
Router.post("/Like/:id", checkUser, (req, res, next) => {
  Comment.findOne({
    _id: req.params.id,
  }).then((comment) => {
    // LIKE
    if (req.body.like == 1) {
      if (comment.usersDisliked.includes(req.user._id)) {
        comment.usersDisliked.pull(req.user._id);
        comment.dislikes = comment.dislikes - 1;
        comment.usersLiked.push(req.user._id);
        comment.likes = comment.likes + 1;
      } else {
        if (!comment.usersLiked.includes(req.user._id)) {
          comment.usersLiked.push(req.user._id);
          comment.likes = comment.likes + 1;
        } else {
          comment.usersLiked.pull(req.user._id);
          comment.likes = comment.likes - 1;
        }
      }
    }

    //DISLIKE
    else if (req.body.like == -1) {
      if (comment.usersLiked.includes(req.user._id)) {
        comment.usersLiked.pull(req.user._id);
        comment.likes = comment.likes - 1;
        comment.usersDisliked.push(req.user._id);
        comment.dislikes = comment.dislikes + 1;
      } else {
        if (!comment.usersDisliked.includes(req.user._id)) {
          comment.usersDisliked.push(req.user._id);
          comment.dislikes = comment.dislikes + 1;
        } else {
          comment.usersDisliked.pull(req.user._id);
          comment.dislikes = comment.dislikes - 1;
        }
      }
    }

    comment
      .save()
      .then(() => {
        res.status(201).json({
          message: "Liked changed successfully!",
        });
      })
      .catch((error) => {
        res.status(400).json({
          error: error,
        });
      });
  });
});
module.exports = Router;
