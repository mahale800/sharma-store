import React from 'react';
import { Star, User, ThumbsUp } from 'lucide-react';

const MOCK_REVIEWS = [
    {
        id: 1,
        user: "Aditi S.",
        rating: 5,
        date: "2 days ago",
        comment: "Absolutely love the quality! It came exactly as described and the packaging was super cute. Will definitely buy again.",
        likes: 12
    },
    {
        id: 2,
        user: "Rahul K.",
        rating: 4,
        date: "1 week ago",
        comment: "Good product for the price. Delivery was a bit slow but the item is worth it.",
        likes: 5
    },
    {
        id: 3,
        user: "Priya M.",
        rating: 5,
        date: "2 weeks ago",
        comment: "Perfect for gifting! My sister loved it. The finish is premium.",
        likes: 24
    }
];

const ReviewList = ({ reviewsCount, rating }) => {
    return (
        <div className="mt-16 border-t border-gray-100 pt-10">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                Ratings & Reviews
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{reviewsCount}</span>
            </h3>

            {/* Overall Rating Summary */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center gap-8">
                <div className="text-center">
                    <div className="text-5xl font-black text-gray-900 mb-1">{rating}</div>
                    <div className="flex text-yellow-400 gap-1 justify-center mb-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={20} fill={i < Math.floor(rating) ? "currentColor" : "none"} className={i < Math.floor(rating) ? "" : "text-gray-300"} />
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Overall Rating</p>
                </div>

                <div className="flex-1 w-full max-w-sm space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-3 text-xs font-bold text-gray-500">
                            <span className="w-3">{star}</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400 rounded-full"
                                    style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : 2}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Review Cards */}
            <div className="space-y-6">
                {MOCK_REVIEWS.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                <User size={14} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">{review.user}</h4>
                                <p className="text-[10px] text-gray-400">{review.date}</p>
                            </div>
                        </div>
                        <div className="flex text-yellow-400 gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                            ))}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            {review.comment}
                        </p>
                        <button className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-gray-600 transition-colors">
                            <ThumbsUp size={12} /> Helpful ({review.likes})
                        </button>
                    </div>
                ))}
            </div>

            <button className="w-full mt-6 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                View All Reviews
            </button>
        </div>
    );
};

export default ReviewList;
