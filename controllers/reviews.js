const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");

// ✅ Create Review
module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("reviews");

  // ✅ Check if this user already submitted a review
  const hasReviewed = listing.reviews.some(review =>
    review.author.equals(req.user._id)
  );

  if (hasReviewed) {
    req.flash("error", "You have already reviewed this listing.");
    return res.redirect(`/listings/${listing._id}`);
  }

  // ✅ If not reviewed yet, allow creation
  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success", "New Review Created!");
  res.redirect(`/listings/${listing._id}`);
};

// ✅ Destroy Review
module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted!");
  res.redirect(`/listings/${id}`);
};
