'use client';

import { useState } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  StarIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  FaceSmileIcon,
  FaceFrownIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface FeedbackData {
  type: 'rating' | 'suggestion' | 'bug' | 'general';
  rating?: number;
  message: string;
  email?: string;
  page: string;
  userAgent: string;
  timestamp: Date;
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'type' | 'rating' | 'message' | 'success'>('type');
  const [feedbackType, setFeedbackType] = useState<FeedbackData['type']>('general');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setStep('type');
    setFeedbackType('general');
    setRating(0);
    setMessage('');
    setEmail('');
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const feedbackData: FeedbackData = {
      type: feedbackType,
      rating: feedbackType === 'rating' ? rating : undefined,
      message,
      email: email || undefined,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
    };

    try {
      // 这里可以发送到实际的反馈API
      console.log('Feedback submitted:', feedbackData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep('success');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = [
    {
      type: 'rating' as const,
      icon: StarIcon,
      title: 'Rate this page',
      description: 'How would you rate your experience?'
    },
    {
      type: 'suggestion' as const,
      icon: FaceSmileIcon,
      title: 'Suggestion',
      description: 'Share your ideas for improvement'
    },
    {
      type: 'bug' as const,
      icon: FaceFrownIcon,
      title: 'Report a bug',
      description: 'Something not working as expected?'
    },
    {
      type: 'general' as const,
      icon: ChatBubbleLeftRightIcon,
      title: 'General feedback',
      description: 'Any other comments or questions'
    }
  ];

  return (
    <>
      {/* 反馈按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        aria-label="Give feedback"
        title="Give Feedback"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>

      {/* 反馈弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
            />
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              {/* 标题栏 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {step === 'success' ? 'Thank you!' : 'Send Feedback'}
                </h2>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* 步骤1：选择反馈类型 */}
              {step === 'type' && (
                <div className="space-y-3">
                  <p className="text-gray-600 mb-4">What would you like to share?</p>
                  {feedbackTypes.map(({ type, icon: Icon, title, description }) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFeedbackType(type);
                        setStep(type === 'rating' ? 'rating' : 'message');
                      }}
                      className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                    >
                      <Icon className="w-6 h-6 text-gray-500 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{title}</div>
                        <div className="text-sm text-gray-500">{description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 步骤2：评分 */}
              {step === 'rating' && (
                <div className="text-center">
                  <p className="text-gray-600 mb-6">How would you rate this page?</p>
                  <div className="flex justify-center space-x-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      >
                        {star <= rating ? (
                          <StarIconSolid className="w-8 h-8 text-yellow-400" />
                        ) : (
                          <StarIcon className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setStep('type')}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep('message')}
                      disabled={rating === 0}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* 步骤3：消息 */}
              {step === 'message' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Your message
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us more about your experience..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We&apos;ll only use this to follow up if needed
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setStep(feedbackType === 'rating' ? 'rating' : 'type')}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!message.trim() || isSubmitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Feedback'}
                    </button>
                  </div>
                </div>
              )}

              {/* 步骤4：成功 */}
              {step === 'success' && (
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <HandThumbUpIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-gray-600 mb-6">
                    Your feedback has been sent successfully. We appreciate your input!
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      resetForm();
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 快速反馈按钮组件
export function QuickFeedback() {
  const [_feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showThanks, setShowThanks] = useState(false);

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    setShowThanks(true);
    
    // 记录反馈
    console.log('Quick feedback:', { type, page: window.location.pathname });
    
    // 3秒后隐藏感谢消息
    setTimeout(() => {
      setShowThanks(false);
      setFeedback(null);
    }, 3000);
  };

  if (showThanks) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <HandThumbUpIcon className="w-5 h-5" />
        <span className="text-sm">Thanks for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">Was this helpful?</span>
      <div className="flex space-x-2">
        <button
          onClick={() => handleFeedback('positive')}
          className="p-2 text-gray-400 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
          aria-label="Yes, this was helpful"
        >
          <HandThumbUpIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleFeedback('negative')}
          className="p-2 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
          aria-label="No, this was not helpful"
        >
          <HandThumbDownIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
