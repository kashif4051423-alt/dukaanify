import { StarIcon } from './StarIcon'

const reviews = [
  {
    id: 1,
    name: 'Ali Madina Furniture',
    role: 'Store Owner',
    content: 'Dukaanify نے ہماری فروخت 300% بڑھا دی۔ سب کچھ خود کار ہے، بہت آسان!',
    rating: 5,
    initials: 'AM',
  },
  {
    id: 2,
    name: 'Hassan Ahmed',
    role: 'Business Manager',
    content: 'یہ بہترین platform ہے۔ Google Sheets میں خودکار sync، orders manage کرنا بہت آسان ہے۔',
    rating: 5,
    initials: 'HA',
  },
  {
    id: 3,
    name: 'Fatima Khan',
    role: 'E-commerce Owner',
    content: 'سب سے بہترین feature - WhatsApp integration! میرے customers براہ راست WhatsApp کے ذریعے آرڈر دے سکتے ہیں۔',
    rating: 5,
    initials: 'FK',
  },
]

export function ReviewsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-indigo-50/30 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            ہمارے گاہکوں کو کیا پسند ہے
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ہزاروں کامیاب کاروباری افراد نے Dukaanify کو اپنا اعتماد دیا ہے
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-indigo-300 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-amber-400 fill-current" />
                ))}
              </div>

              {/* Comment */}
              <p className="text-gray-700 mb-6 leading-relaxed text-right" dir="rtl">
                "{review.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shrink-0">
                  {review.initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-gray-200">
          <div className="text-center">
            <p className="text-4xl font-bold text-indigo-600 mb-2">5000+</p>
            <p className="text-gray-600">خوش دکاندار</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-indigo-600 mb-2">500K+</p>
            <p className="text-gray-600">کل آرڈرز</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-indigo-600 mb-2">PKR 10B+</p>
            <p className="text-gray-600">کل سیلز</p>
          </div>
        </div>
      </div>
    </section>
  )
}
