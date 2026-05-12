const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },

  // Star ratings by category
  ratings: {
    overall: { type: Number, required: true, min: 1, max: 5 },
    food: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    ambiance: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
  },

  // Review content
  title: { type: String, maxlength: 100 },
  content: { type: String, required: true, minlength: 10 },
  images: [{ type: String }],
  tags: [{ type: String }],

  // Gamification metrics
  wordCount: { type: Number, default: 0 },
  keywordScore: { type: Number, default: 0 },
  mediaBonus: { type: Number, default: 0 },
  pointsAwarded: { type: Number, default: 0 },
  qualityTier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },

  // AI-suggested keywords used
  aiKeywordsUsed: [{ type: String }],

  // Engagement
  helpfulCount: { type: Number, default: 0 },
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  isVerified: { type: Boolean, default: true },
  restaurantReply: {
    content: String,
    repliedAt: Date,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Calculate gamification score before saving
reviewSchema.pre('save', function () {
  if (this.isModified('content')) {
    const words = this.content.trim().split(/\s+/).filter(w => w.length > 0);
    this.wordCount = words.length;

    // Keyword scoring - detect descriptive quality keywords
    const qualityKeywords = [
      'delicious', 'amazing', 'fresh', 'crispy', 'juicy', 'flavorful', 'authentic',
      'excellent', 'outstanding', 'wonderful', 'fantastic', 'incredible', 'perfect',
      'disappointing', 'bland', 'overpriced', 'cold', 'slow', 'rude', 'excellent',
      'prompt', 'courteous', 'ambiance', 'atmosphere', 'cozy', 'romantic', 'noisy',
      'spicy', 'sweet', 'salty', 'aromatic', 'tender', 'crunchy', 'smooth',
    ];
    const contentLower = this.content.toLowerCase();
    const keywordsFound = qualityKeywords.filter(kw => contentLower.includes(kw));
    this.keywordScore = Math.min(keywordsFound.length * 5, 30);

    // Media bonus
    this.mediaBonus = (this.images && this.images.length > 0) ? 20 : 0;

    // Calculate total points
    const wordPoints = Math.min(Math.floor(this.wordCount / 10) * 5, 50); // Max 50 from words
    this.pointsAwarded = wordPoints + this.keywordScore + this.mediaBonus;

    // Determine quality tier
    if (this.pointsAwarded >= 80) this.qualityTier = 'platinum';
    else if (this.pointsAwarded >= 55) this.qualityTier = 'gold';
    else if (this.pointsAwarded >= 30) this.qualityTier = 'silver';
    else this.qualityTier = 'bronze';
  }
});

reviewSchema.index({ restaurant: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
