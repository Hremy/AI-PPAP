import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  CogIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const features = [
    {
      icon: ChartBarIcon,
      title: "Performance Analytics",
      description: "Advanced AI-powered analytics to track and improve employee performance with real-time insights."
    },
    {
      icon: UserGroupIcon,
      title: "Team Management",
      description: "Comprehensive team management tools with role-based access and collaborative workflows."
    },
    {
      icon: CogIcon,
      title: "Smart Automation",
      description: "Automated performance reviews, goal tracking, and productivity optimization powered by AI."
    },
    {
      icon: ShieldCheckIcon,
      title: "Enterprise Security",
      description: "Bank-level security with encrypted data, secure authentication, and compliance standards."
    }
  ];

  const benefits = [
    "Increase team productivity by up to 40%",
    "Reduce performance review time by 75%",
    "Improve employee satisfaction scores",
    "Data-driven decision making",
    "Real-time performance insights",
    "Automated goal tracking and feedback"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Director",
      company: "TechCorp Inc.",
      content: "AI-PPAP transformed how we manage performance. Our team productivity increased by 35% in just 3 months.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Team Lead",
      company: "Innovation Labs",
      content: "The AI insights are incredible. We can now identify performance bottlenecks before they become issues.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "CEO",
      company: "StartupXYZ",
      content: "Best investment we've made. The automated reviews save us hours every week while improving quality.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-secondary font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-secondary">
                AI-PPAP
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/features" 
                className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link 
                to="/login" 
                className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-primary text-secondary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all transform hover:scale-105 shadow-md"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-secondary mb-6">
              AI-Powered Performance &
              <span className="text-primary">
                {" "}Productivity Assessment
              </span>
            </h1>
            <p className="text-xl text-secondary/70 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your team's performance with intelligent analytics, automated reviews, 
              and data-driven insights that drive real results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/register" 
                className="bg-primary text-secondary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <span>Start Free Trial</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <button className="text-secondary/70 hover:text-secondary px-8 py-4 rounded-xl text-lg font-semibold transition-colors flex items-center space-x-2">
                <span>Watch Demo</span>
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-secondary border-y-[4px] border-y-transparent ml-1"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl text-secondary/70 max-w-2xl mx-auto">
              Everything you need to optimize performance, boost productivity, and drive success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 rounded-2xl bg-background hover:bg-white hover:shadow-xl transition-all duration-300 border border-primary/20">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <feature.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-3">{feature.title}</h3>
                <p className="text-secondary/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
                Measurable Results That Matter
              </h2>
              <p className="text-xl text-secondary/70 mb-8">
                Join thousands of companies already using AI-PPAP to transform their performance management.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-secondary/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-primary mb-2">40%</div>
                  <div className="text-secondary/70">Average Productivity Increase</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-background rounded-xl">
                    <div className="text-2xl font-bold text-primary mb-1">75%</div>
                    <div className="text-sm text-secondary/70">Time Saved</div>
                  </div>
                  <div className="p-4 bg-background rounded-xl">
                    <div className="text-2xl font-bold text-primary mb-1">95%</div>
                    <div className="text-sm text-secondary/70">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-secondary/70">
              See what our customers are saying about AI-PPAP
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-background rounded-2xl p-6 hover:shadow-lg transition-shadow border border-primary/10">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-primary fill-current" />
                  ))}
                </div>
                <p className="text-secondary/80 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-secondary">{testimonial.name}</div>
                  <div className="text-secondary/70 text-sm">{testimonial.role}</div>
                  <div className="text-secondary/60 text-sm">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
            Ready to Transform Your Team's Performance?
          </h2>
          <p className="text-xl text-secondary/80 mb-8">
            Join thousands of companies using AI-PPAP to drive results. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-secondary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-secondary/5 transition-colors flex items-center justify-center space-x-2 shadow-md"
            >
              <span>Start Free Trial</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link 
              to="/login" 
              className="border-2 border-secondary text-secondary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-secondary hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-secondary font-bold text-sm">AI</span>
                </div>
                <span className="text-xl font-bold">AI-PPAP</span>
              </div>
              <p className="text-white/70">
                AI-Powered Performance & Productivity Assessment Platform
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
            <p>&copy; 2025 AI-PPAP. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
