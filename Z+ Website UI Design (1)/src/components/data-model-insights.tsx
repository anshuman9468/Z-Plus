import { motion } from 'motion/react';
import { Sidebar } from './sidebar';
import { TrendingUp, Brain, Target, Calendar, BarChart3 } from 'lucide-react';
import { Card } from './ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type Page = 'landing' | 'dashboard' | 'progress' | 'results' | 'history' | 'insights' | 'verifier';

interface DataModelInsightsProps {
  onNavigate: (page: Page) => void;
}

export function DataModelInsights({ onNavigate }: DataModelInsightsProps) {
  // Current model insights
  const performanceOverTime = [
    { epoch: 1, accuracy: 72.5, loss: 0.456 },
    { epoch: 2, accuracy: 78.3, loss: 0.389 },
    { epoch: 3, accuracy: 82.1, loss: 0.321 },
    { epoch: 4, accuracy: 85.8, loss: 0.267 },
    { epoch: 5, accuracy: 88.4, loss: 0.234 },
    { epoch: 6, accuracy: 90.2, loss: 0.198 },
    { epoch: 7, accuracy: 91.8, loss: 0.167 },
    { epoch: 8, accuracy: 93.2, loss: 0.145 },
    { epoch: 9, accuracy: 93.9, loss: 0.132 },
    { epoch: 10, accuracy: 94.5, loss: 0.123 },
  ];

  const featureImportance = [
    { feature: 'Feature A', importance: 0.35 },
    { feature: 'Feature B', importance: 0.28 },
    { feature: 'Feature C', importance: 0.18 },
    { feature: 'Feature D', importance: 0.12 },
    { feature: 'Feature E', importance: 0.07 },
  ];

  const classDistribution = [
    { name: 'Class A', value: 180, color: '#22d3ee' },
    { name: 'Class B', value: 120, color: '#3b82f6' },
  ];

  // Recent data insights
  const recentInsights = [
    {
      id: 1,
      date: '2025-11-08',
      model: 'Logistic Regression',
      dataset: 'customer_churn.csv',
      accuracy: 94.5,
      topFeature: 'Monthly Charges',
      featureImportance: 0.42,
      trend: 'up',
    },
    {
      id: 2,
      date: '2025-11-08',
      model: 'Decision Tree',
      dataset: 'fraud_detection.csv',
      accuracy: 91.2,
      topFeature: 'Transaction Amount',
      featureImportance: 0.38,
      trend: 'stable',
    },
    {
      id: 3,
      date: '2025-11-07',
      model: 'Logistic Regression',
      dataset: 'spam_classifier.csv',
      accuracy: 88.7,
      topFeature: 'Word Count',
      featureImportance: 0.35,
      trend: 'up',
    },
    {
      id: 4,
      date: '2025-11-07',
      model: 'Decision Tree',
      dataset: 'credit_scoring.csv',
      accuracy: 92.8,
      topFeature: 'Credit History',
      featureImportance: 0.45,
      trend: 'up',
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar currentPage="insights" onNavigate={onNavigate} />
      
      <div className="flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-10 h-10 text-cyan-400" />
            <div>
              <h1 className="text-4xl text-cyan-400">Data Model Insights</h1>
              <p className="text-gray-400">Analyze your model performance and data patterns</p>
            </div>
          </div>

          {/* Current Model Insights */}
          <div className="mb-12">
            <h2 className="text-2xl mb-6 text-cyan-300">Current Model Analytics</h2>
            
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Performance Over Time */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8">
                <h3 className="text-xl mb-6 text-cyan-300">Training Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="epoch" stroke="#94a3b8" label={{ value: 'Epoch', position: 'insideBottom', offset: -5, fill: '#94a3b8' }} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(0,191,255,0.3)',
                        borderRadius: '8px',
                      }}
                    />
                    <Line type="monotone" dataKey="accuracy" stroke="#22d3ee" strokeWidth={3} name="Accuracy (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Feature Importance */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8">
                <h3 className="text-xl mb-6 text-cyan-300">Feature Importance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={featureImportance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="feature" type="category" stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(0,191,255,0.3)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="importance" fill="url(#colorGradient)" />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Class Distribution */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8">
                <h3 className="text-xl mb-6 text-cyan-300">Class Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={classDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {classDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(0,191,255,0.3)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* Key Metrics */}
              <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-400/30 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-8 h-8 text-cyan-400" />
                  <h3 className="text-xl text-cyan-300">Accuracy</h3>
                </div>
                <p className="text-5xl text-cyan-400 mb-2">94.5%</p>
                <p className="text-sm text-gray-400">Best performing model</p>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-400/30 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-8 h-8 text-blue-400" />
                  <h3 className="text-xl text-blue-300">Model Type</h3>
                </div>
                <p className="text-2xl text-blue-400 mb-2">Logistic Regression</p>
                <p className="text-sm text-gray-400">Current active model</p>
              </Card>
            </div>
          </div>

          {/* Recent Data Insights */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-cyan-300">Recent Data Insights</h2>
              <div className="text-sm text-gray-500">Last 7 days</div>
            </div>

            <div className="grid gap-6">
              {recentInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-6 hover:border-cyan-400/60 transition-all">
                    <div className="flex items-start gap-6">
                      <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-8 h-8 text-cyan-400" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg text-cyan-300 mb-1">{insight.dataset}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {insight.date}
                              </div>
                              <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4" />
                                {insight.model}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl text-cyan-400">{insight.accuracy}%</p>
                            <p className="text-xs text-gray-500">Accuracy</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-cyan-400/10">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Top Feature</p>
                            <p className="text-sm text-cyan-400">{insight.topFeature}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Feature Importance</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                                  style={{ width: `${insight.featureImportance * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-300">{(insight.featureImportance * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
