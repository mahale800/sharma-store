import React from 'react';
import { Star, ThumbsUp, CheckCircle, MessageSquare } from 'lucide-react';
import Button from './Button';

const ReviewList = ({ reviewsCount, rating }) => {
    // Mock Reviews Data
    const reviews = [
        {
            id: 1,
            user: "Rahul S.",
            rating: 5,
            date: "2 days ago",
            comment: "Absolutely love the quality! It exceeded my expectations. The packaging was also very premium.",
            verified: true,
            likes: 12
        },
        {
            id: 2,
            user: "Priya M.",
            rating: 4,
            date: "1 week ago",
            comment: "Good product for the price. Fast delivery as well.",
            verified: true,
            likes: 5
        },
        {
            id: 3,
            user: "Amit K.",
            rating: 5,
            date: "3 weeks ago",
            comment: "Best purchase I've made on Sharma Store so far. Highly recommended!",
            verified: true,
            likes: 8
        }
    ];

    return (
        <section className="py-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                    <MessageSquare size={20} className="text-orange-500" />
                    Customer Reviews
                </h3>
                <Button variant="outline" size="sm" className="rounded-xl">Write a Review</Button>
            </div>

            {/* Rating Summary */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center gap-8 justify-between">
                <div className="text-center md:text-left">
                    <div className="text-5xl font-black text-gray-900 mb-1">{rating}</div>
                    <div className="flex justify-center md:justify-start gap-1 mb-2 text-yellow-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={20} fill={s <= Math.round(rating) ? "currentColor" : "none"} className={s <= Math.round(rating) ? "" : "text-gray-300"} />
                        ))}
                    </div>
                    <p className="text-sm font-bold text-gray-500">{reviewsCount} Verified Ratings</p>
                </div>

                {/* Visual Bar Graph (Mock) */}
                <div className="flex-1 w-full max-w-sm space-y-2">
                    {[5, 4, 3, 2, 1].map((stars, i) => (
                        <div key={stars} className="flex items-center gap-3 text-xs font-bold text-gray-500">
                            <span className="w-3">{stars}</span>
                            <Star size={10} className="text-gray-400" />
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400 rounded-full"
                                    style={{ width: `${[70, 20, 5, 3, 2][i]}%` }}
                                ></div>
                            </div>
                            <span className="w-8 text-right">{[70, 20, 5, 3, 2][i]}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center font-bold text-orange-700 text-sm">
                                    {review.user.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900 text-sm">{review.user}</span>
                                        {review.verified && <CheckCircle size={12} className="text-green-500" />}
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} size={10} fill={s <= review.rating ? "currentColor" : "none"} className={s <= review.rating ? "" : "text-gray-200"} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-400">{review.date}</span>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed mb-3 pl-14">{review.comment}</p>

                        <div className="pl-14">
                            <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors group">
                                <ThumbsUp size={14} className="group-hover:scale-110 transition-transform" /> Helpful ({review.likes})
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">View All Reviews</Button>
            </div>
        </section>
    );
};

export default ReviewList;
