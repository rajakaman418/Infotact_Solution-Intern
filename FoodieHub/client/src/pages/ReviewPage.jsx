import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Zap, Trophy, Sparkles, ChevronRight, Check } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TIER_CONFIG = {
  bronze: { color: '#cd7f32', label: 'Bronze', min: 0 },
  silver: { color: '#c0c0c0', label: 'Silver', min: 30 },
  gold: { color: '#ffd700', label: 'Gold', min: 55 },
  platinum: { color: '#e5e4e2', label: 'Platinum', min: 80 },
};

const ReviewPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [order, setOrder] = useState(null);
  const [suggestions, setSuggestions] = useState({ suggestions: [], prompts: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Review state
  const [overallRating, setOverallRating] = useState(0);
  const [ratings, setRatings] = useState({ food: 0, service: 0, ambiance: 0, value: 0 });
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [rewards, setRewards] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, suggestionsRes] = await Promise.all([
          api.get(`/orders/${orderId}`),
          api.get(`/reviews/suggestions/${orderId}`),
        ]);
        setOrder(orderRes.data.data);
        setSuggestions(suggestionsRes.data);
      } catch (err) {
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId]);

  // Calculate preview score
  const wordCount = content.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const wordPoints = Math.min(Math.floor(wordCount / 10) * 5, 50);
  const keywordPoints = Math.min(selectedKeywords.length * 5, 30);
  const previewPoints = wordPoints + keywordPoints;
  const tier = previewPoints >= 80 ? 'platinum' : previewPoints >= 55 ? 'gold' : previewPoints >= 30 ? 'silver' : 'bronze';
  const tierConfig = TIER_CONFIG[tier];

  const toggleKeyword = (kw) => {
    const withKw = content + (content ? ' ' : '') + kw;
    if (!selectedKeywords.includes(kw)) {
      setSelectedKeywords((prev) => [...prev, kw]);
      setContent(withKw);
    } else {
      setSelectedKeywords((prev) => prev.filter((k) => k !== kw));
      setContent(content.replace(kw, '').trim());
    }
  };

  const handleSubmit = async () => {
    if (overallRating === 0) { toast.error('Please rate your experience!'); return; }
    if (content.trim().length < 20) { toast.error('Please write at least 20 characters!'); return; }

    setSubmitting(true);
    try {
      const { data } = await api.post('/reviews', {
        orderId,
        ratings: { overall: overallRating, ...ratings },
        title,
        content,
        aiKeywordsUsed: selectedKeywords,
        tags: selectedKeywords,
      });

      setRewards(data.rewards);
      setSubmitted(true);

      // Update local user points
      if (data.rewards) {
        updateUser({ loyaltyPoints: data.rewards.totalUserPoints });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner spinner-lg" />
    </div>
  );

  if (submitted && rewards) {
    return (
      <div className="page">
        <div className="container-sm">
          <div className="card animate-slideUp" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%', margin: '0 auto 2rem',
              background: `linear-gradient(135deg, ${TIER_CONFIG[rewards.qualityTier]?.color}, var(--primary))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 40px ${TIER_CONFIG[rewards.qualityTier]?.color}60`,
              animation: 'glow 2s infinite',
            }}>
              <Trophy size={48} color="white" />
            </div>

            <div className={`badge badge-${rewards.qualityTier}`} style={{ margin: '0 auto 1rem', fontSize: '0.875rem', padding: '0.375rem 1rem' }}>
              {TIER_CONFIG[rewards.qualityTier]?.label} Review
            </div>

            <h2 className="font-display font-bold text-3xl" style={{ marginBottom: '0.75rem' }}>
              🎉 Review Submitted!
            </h2>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>
              You've earned loyalty points for your detailed review!
            </p>

            {/* Points Breakdown */}
            <div style={{
              background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)',
              padding: '1.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem',
            }}>
              {[
                { label: 'Word Bonus', value: Math.min(Math.floor(rewards.wordCount / 10) * 5, 50), sub: `${rewards.wordCount} words` },
                { label: 'Keyword Score', value: rewards.keywordScore, sub: 'Quality keywords' },
                { label: 'Total Points', value: rewards.pointsAwarded, sub: 'Awarded!', highlight: true },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div className={`font-bold text-3xl ${item.highlight ? 'gradient-text' : ''}`} style={{ color: item.highlight ? undefined : 'var(--accent)' }}>
                    +{item.value}
                  </div>
                  <div className="text-sm font-semibold" style={{ marginTop: '0.25rem' }}>{item.label}</div>
                  <div className="text-xs text-muted">{item.sub}</div>
                </div>
              ))}
            </div>

            {rewards.newBadges?.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <p className="font-semibold" style={{ marginBottom: '0.75rem' }}>🏆 New Badges Earned!</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {rewards.newBadges.map((badge) => (
                    <span key={badge} className="badge badge-gold" style={{ padding: '0.375rem 0.875rem' }}>
                      🏅 {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/orders')}>My Orders</button>
              <button className="btn btn-primary" onClick={() => navigate('/restaurants')}>
                Order Again <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const StarRating = ({ value, onChange, size = 28 }) => {
    const [hover, setHover] = useState(0);
    return (
      <div className="flex items-center gap-1 stars">
        {Array(5).fill(0).map((_, i) => (
          <button
            key={i}
            onMouseEnter={() => setHover(i + 1)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i + 1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.15s ease' }}
          >
            <Star
              size={size}
              fill={(hover || value) > i ? 'currentColor' : 'none'}
              style={{ transform: (hover || value) > i ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.15s ease' }}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="page">
      <div className="container-sm">
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="font-display font-bold text-3xl" style={{ marginBottom: '0.5rem' }}>
            Rate Your Experience ⭐
          </h1>
          <p className="text-muted">
            {order?.restaurant?.name} · Earn loyalty points for detailed reviews!
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          {/* Review Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Overall Rating */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 className="font-semibold" style={{ marginBottom: '1.25rem' }}>Overall Rating *</h3>
              <StarRating value={overallRating} onChange={setOverallRating} size={36} />
              {overallRating > 0 && (
                <p className="text-sm" style={{ marginTop: '0.625rem', color: 'var(--accent)' }}>
                  {['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent!'][overallRating]}
                </p>
              )}
            </div>

            {/* Category Ratings */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 className="font-semibold" style={{ marginBottom: '1.25rem' }}>Rate Specific Aspects</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {[
                  { key: 'food', label: 'Food Quality' },
                  { key: 'service', label: 'Service' },
                  { key: 'ambiance', label: 'Ambiance' },
                  { key: 'value', label: 'Value for Money' },
                ].map((cat) => (
                  <div key={cat.key} className="flex items-center justify-between">
                    <span className="text-sm text-muted">{cat.label}</span>
                    <StarRating
                      value={ratings[cat.key]}
                      onChange={(v) => setRatings((prev) => ({ ...prev, [cat.key]: v }))}
                      size={18}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Review Title */}
            <div className="form-group">
              <label className="form-label">Review Title (Optional)</label>
              <input
                id="review-title"
                className="input"
                placeholder="Summarize your experience in one line..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            {/* AI Prompts */}
            {suggestions.prompts?.length > 0 && (
              <div className="card" style={{ padding: '1.25rem', background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)' }}>
                <p className="text-sm font-semibold" style={{ marginBottom: '0.875rem', color: 'var(--info)' }}>
                  ✨ AI Writing Prompts
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {suggestions.prompts.map((prompt, i) => (
                    <button
                      key={i}
                      className="text-sm text-muted"
                      style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '0.375rem 0.625rem', borderRadius: 8, transition: 'all 0.15s' }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                      onClick={() => setContent((prev) => prev ? prev + ' ' + prompt.toLowerCase() : prompt)}
                    >
                      💬 {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Review Content */}
            <div className="form-group">
              <div className="flex justify-between items-center" style={{ marginBottom: '0.375rem' }}>
                <label className="form-label">Your Review *</label>
                <span className="text-xs text-muted">{wordCount} words · {previewPoints} pts preview</span>
              </div>
              <textarea
                id="review-content"
                className="input"
                rows={6}
                placeholder="Tell others about your experience. The more detail you provide, the more points you earn!"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Keyword Chips */}
            {suggestions.suggestions?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted" style={{ marginBottom: '0.75rem' }}>
                  🏷️ Click keywords to add them to your review
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.suggestions.map((kw) => (
                    <button
                      key={kw}
                      className={`keyword-chip ${selectedKeywords.includes(kw) ? 'selected' : ''}`}
                      onClick={() => toggleKeyword(kw)}
                    >
                      {selectedKeywords.includes(kw) && <Check size={12} />}
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              id="submit-review-btn"
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={submitting || overallRating === 0}
            >
              {submitting ? (
                <><div className="spinner" style={{ width: 18, height: 18 }} /> Submitting...</>
              ) : (
                <>Submit Review & Earn {previewPoints}+ Points <Zap size={18} /></>
              )}
            </button>
          </div>

          {/* Live Score Preview */}
          <div>
            <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '5rem' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <Sparkles size={18} color="var(--accent)" />
                <h3 className="font-semibold">Review Score Preview</h3>
              </div>

              {/* Tier Badge */}
              <div style={{
                textAlign: 'center', padding: '1.25rem',
                background: `${tierConfig.color}15`,
                border: `1px solid ${tierConfig.color}40`,
                borderRadius: 'var(--radius-md)', marginBottom: '1.25rem',
              }}>
                <div className="font-display font-bold text-4xl" style={{ color: tierConfig.color }}>
                  +{previewPoints}
                </div>
                <div className="font-semibold" style={{ color: tierConfig.color, marginTop: '0.25rem' }}>
                  {tierConfig.label} Review
                </div>
                <div className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>Estimated points</div>
              </div>

              {/* Score Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div className="flex justify-between text-sm" style={{ marginBottom: '0.375rem' }}>
                    <span className="text-muted">Word Count ({wordCount} words)</span>
                    <span className="font-semibold">{wordPoints}/50</span>
                  </div>
                  <div className="review-progress">
                    <div className="review-progress-bar" style={{ width: `${(wordPoints / 50) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm" style={{ marginBottom: '0.375rem' }}>
                    <span className="text-muted">Keywords Used ({selectedKeywords.length})</span>
                    <span className="font-semibold">{keywordPoints}/30</span>
                  </div>
                  <div className="review-progress">
                    <div className="review-progress-bar" style={{ width: `${(keywordPoints / 30) * 100}%`, background: 'linear-gradient(90deg, var(--accent), var(--primary))' }} />
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <p className="text-xs font-semibold" style={{ marginBottom: '0.625rem', color: 'var(--accent)' }}>
                  💡 Tips to earn more
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {[
                    { done: wordCount >= 50, text: 'Write 50+ words for max word points' },
                    { done: selectedKeywords.length >= 3, text: 'Use 3+ descriptive keywords' },
                    { done: overallRating > 0, text: 'Add an overall rating' },
                  ].map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {tip.done ? (
                        <Check size={12} color="var(--success)" />
                      ) : (
                        <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid var(--border)', flexShrink: 0 }} />
                      )}
                      <span className={tip.done ? '' : 'text-muted'}>{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
