import { useState } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from './sidebar';
import { Search, Filter, ShieldCheck, Download } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';

type Page = 'landing' | 'dashboard' | 'progress' | 'results' | 'history';

interface HistoryPageProps {
  onNavigate: (page: Page) => void;
}

export function HistoryPage({ onNavigate }: HistoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock history data
  const history = [
    {
      id: 1,
      timestamp: '2025-11-08 14:23:15',
      model: 'Logistic Regression',
      dataset: 'customer_churn.csv',
      accuracy: 94.5,
      proofHash: '0x8f3a9b2c7d5e...2f3',
      status: 'verified',
    },
    {
      id: 2,
      timestamp: '2025-11-08 12:15:42',
      model: 'Decision Tree',
      dataset: 'fraud_detection.csv',
      accuracy: 91.2,
      proofHash: '0x7e2b8a1c6d4f...1e2',
      status: 'verified',
    },
    {
      id: 3,
      timestamp: '2025-11-07 18:45:33',
      model: 'Logistic Regression',
      dataset: 'spam_classifier.csv',
      accuracy: 88.7,
      proofHash: '0x6d1a9b0c5e3f...0d1',
      status: 'verified',
    },
    {
      id: 4,
      timestamp: '2025-11-07 15:30:21',
      model: 'Decision Tree',
      dataset: 'credit_scoring.csv',
      accuracy: 92.8,
      proofHash: '0x5c0b8a9d4e2f...9c0',
      status: 'verified',
    },
    {
      id: 5,
      timestamp: '2025-11-06 11:20:18',
      model: 'Logistic Regression',
      dataset: 'sentiment_analysis.csv',
      accuracy: 86.4,
      proofHash: '0x4b9a7c8d3e1f...8b9',
      status: 'verified',
    },
  ];

  const filteredHistory = history.filter(
    (item) =>
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dataset.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar currentPage="history" onNavigate={onNavigate} />
      
      <div className="flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl mb-2 text-cyan-400">Training History & Audit</h1>
          <p className="text-gray-400 mb-8">View all your past training sessions and proofs</p>

          {/* Search and Filter */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-6 mb-8">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search by model or dataset..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-cyan-400/30 text-white focus:border-cyan-400"
                />
              </div>
              <Button
                variant="outline"
                className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </Card>

          {/* History Table */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8">
            <h2 className="text-2xl mb-6 text-cyan-300">Past Sessions</h2>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-cyan-400/20 hover:bg-transparent">
                    <TableHead className="text-cyan-400">Timestamp</TableHead>
                    <TableHead className="text-cyan-400">Model</TableHead>
                    <TableHead className="text-cyan-400">Dataset</TableHead>
                    <TableHead className="text-cyan-400">Accuracy</TableHead>
                    <TableHead className="text-cyan-400">Proof Hash</TableHead>
                    <TableHead className="text-cyan-400">Status</TableHead>
                    <TableHead className="text-cyan-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-cyan-400/10 hover:bg-cyan-400/5"
                    >
                      <TableCell className="text-gray-300">{item.timestamp}</TableCell>
                      <TableCell className="text-gray-300">{item.model}</TableCell>
                      <TableCell className="text-gray-400 font-mono text-sm">{item.dataset}</TableCell>
                      <TableCell className="text-cyan-400">{item.accuracy}%</TableCell>
                      <TableCell className="font-mono text-sm text-purple-400">{item.proofHash}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredHistory.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No training sessions found.</p>
              </div>
            )}
          </Card>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-400/30 p-6">
              <p className="text-sm text-gray-400 mb-2">Total Sessions</p>
              <p className="text-3xl text-cyan-400">{history.length}</p>
            </Card>
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-400/30 p-6">
              <p className="text-sm text-gray-400 mb-2">Average Accuracy</p>
              <p className="text-3xl text-blue-400">
                {(history.reduce((acc, item) => acc + item.accuracy, 0) / history.length).toFixed(1)}%
              </p>
            </Card>
            <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-400/30 p-6">
              <p className="text-sm text-gray-400 mb-2">Verified Proofs</p>
              <p className="text-3xl text-purple-400">{history.filter(h => h.status === 'verified').length}</p>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
