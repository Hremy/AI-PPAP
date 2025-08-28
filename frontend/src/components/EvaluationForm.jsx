import React, { useState } from 'react';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const EvaluationForm = () => {
  const [formData, setFormData] = useState({
    rating: 0,
    skills: [
      { name: 'Technical Skills', value: 0 },
      { name: 'Communication', value: 0 },
      { name: 'Teamwork', value: 0 },
      { name: 'Problem Solving', value: 0 },
      { name: 'Leadership', value: 0 },
    ],
    feedback: '',
  });

  // Get the current user from auth context
  const { user } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const evaluationData = {
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
      userRole: user?.role,
      ...formData,
      submittedAt: new Date().toISOString()
    };

    console.log('Submitting evaluation:', evaluationData);
    // TODO: Make API call to submit evaluation
  };

  const handleSkillRating = (index, value) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index].value = value;
    setFormData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const RatingStars = ({ value, onChange }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            {star <= value ? (
              <StarIconSolid className="w-6 h-6 text-yellow-400" />
            ) : (
              <StarIconOutline className="w-6 h-6 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background rounded-2xl shadow-xl overflow-hidden border border-primary/20">
          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-secondary mb-2">Performance Evaluation</h2>
              <p className="text-secondary/70">Help us understand your team's performance with this quick evaluation</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm text-secondary/80">
                  Your evaluation will be submitted with your account information. You're logged in as: 
                  <span className="font-medium text-secondary">
                    {/* This will be dynamically populated with user data */}
                    {user?.name} ({user?.email})
                  </span>
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary/80 mb-1">
                  Overall Performance Rating
                </label>
                <RatingStars 
                  value={formData.rating} 
                  onChange={(value) => setFormData(prev => ({ ...prev, rating: value }))} 
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-primary/80">
                  Rate Specific Skills
                </label>
                {formData.skills.map((skill, index) => (
                  <div key={skill.name} className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <span className="text-sm font-medium text-primary/80 mb-2 sm:mb-0 sm:w-1/3">
                      {skill.name}
                    </span>
                    <div className="sm:w-2/3">
                      <div className="flex items-center justify-between">
                        <RatingStars 
                          value={skill.value} 
                          onChange={(value) => handleSkillRating(index, value)} 
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {skill.value.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-secondary/80 mb-1">
                  Additional Feedback
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  rows={4}
                  value={formData.feedback}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary/70 transition-all"
                  placeholder="Share your thoughts on performance, areas of improvement, and suggestions..."
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-primary text-secondary py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
                >
                  Submit Evaluation
                </button>
              </div>
              
              <p className="text-xs text-secondary/60 text-center">
                Your feedback is valuable to us. All responses are confidential.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EvaluationForm;
