const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { requireAuth } = require("../middlewares/auth");
const { readAllMovies, writeAllMovies } = require("../utils/storage");

const router = express.Router();

router.get("/", async (req, res) => {
  const { director, rating, tag, sort } = req.query;
  const movies = await readAllMovies();
  let results = movies.slice();

  if (director) {
    const d = String(director).toLowerCase();
    results = results.filter(
      (m) => String(m.director || "").toLowerCase() === d
    );
  }
  if (rating !== undefined) {
    const r = Number(rating);
    if (!Number.isNaN(r)) {
      results = results.filter((m) => Number(m.rating) === r);
    }
  }
  if (tag) {
    const t = String(tag).toLowerCase();
    results = results.filter(
      (m) =>
        Array.isArray(m.tags) &&
        m.tags.map((x) => String(x).toLowerCase()).includes(t)
    );
  }

  if (sort) {
    const [field, dirRaw] = String(sort).split(":");
    const dir = (dirRaw || "desc").toLowerCase() === "asc" ? 1 : -1;
    if (field === "rating") {
      results.sort((a, b) => (Number(a.rating) - Number(b.rating)) * dir);
    } else if (field === "date") {
      results.sort(
        (a, b) =>
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          dir
      );
    }
  }

  return res.json(results);
});

router.post("/", requireAuth, async (req, res) => {
  const { movieTitle, director, reviewText, rating, tags } = req.body || {};
  if (!movieTitle || !director || !reviewText || rating === undefined) {
    return res.status(400).json({
      error: "movieTitle, director, reviewText, and rating are required",
    });
  }
  const ratingNum = Number(rating);
  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 10) {
    return res
      .status(400)
      .json({ error: "rating must be a number between 1 and 10" });
  }

  const movies = await readAllMovies();
  const duplicate = movies.find(
    (m) =>
      String(m.movieTitle).toLowerCase() === String(movieTitle).toLowerCase() &&
      m.userId === req.user.id
  );
  if (duplicate) {
    return res
      .status(409)
      .json({ error: "Duplicate review: you already reviewed this movie" });
  }

  const now = new Date().toISOString();
  const newReview = {
    id: uuidv4(),
    movieTitle,
    director,
    reviewText,
    rating: ratingNum,
    tags: Array.isArray(tags)
      ? tags
      : typeof tags === "string" && tags
      ? [tags]
      : [],
    userId: req.user.id,
    createdAt: now,
    updatedAt: now,
  };
  movies.push(newReview);
  await writeAllMovies(movies);
  return res.status(201).json(newReview);
});

router.put("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { reviewText, rating, tags } = req.body || {};
  const movies = await readAllMovies();
  const index = movies.findIndex((m) => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Review not found" });
  }
  const review = movies[index];
  if (review.userId !== req.user.id) {
    return res
      .status(403)
      .json({ error: "Forbidden: you can only update your own review" });
  }

  if (rating !== undefined) {
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 10) {
      return res
        .status(400)
        .json({ error: "rating must be a number between 1 and 10" });
    }
    review.rating = r;
  }
  if (reviewText !== undefined) {
    review.reviewText = reviewText;
  }
  if (tags !== undefined) {
    review.tags = Array.isArray(tags)
      ? tags
      : typeof tags === "string" && tags
      ? [tags]
      : [];
  }
  review.updatedAt = new Date().toISOString();

  movies[index] = review;
  await writeAllMovies(movies);
  return res.json(review);
});


router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const movies = await readAllMovies();
  const index = movies.findIndex((m) => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Review not found" });
  }
  const review = movies[index];
  if (!(req.user.isAdmin || review.userId === req.user.id)) {
    return res
      .status(403)
      .json({ error: "Forbidden: only owner or admin can delete" });
  }

  movies.splice(index, 1);
  await writeAllMovies(movies);
  return res.json({ success: true, message: "Review deleted" });
});

module.exports = router;
