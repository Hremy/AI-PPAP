import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../components/ui/select.jsx';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Download, 
  Search 
} from 'lucide-react';

// Mock data - replace with actual API call
const mockEvaluations = [
  {
    id: 1,
    employeeName: 'John Doe',
    employeeId: 'EMP001',
    department: 'Engineering',
    position: 'Software Engineer',
    submittedAt: '2025-08-15T10:30:00Z',
    overallScore: 4.2,
    status: 'Submitted',
    ratings: {
      communication: 4,
      teamwork: 5,
      problem_solving: 4,
      initiative: 3,
      quality: 5
    }
  },
  // Add more mock data as needed
];

const EvaluationsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });

  // In a real app, this would be an API call
  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ['evaluations'],
    queryFn: async () => {
      // Replace with actual API call
      // const response = await api.get('/api/evaluations');
      // return response.data;
      return mockEvaluations;
    }
  });

  const handlePreviousMonth = () => {
    setDateRange(prev => ({
      start: startOfMonth(new Date(prev.start.setMonth(prev.start.getMonth() - 1))),
      end: endOfMonth(new Date(prev.start))
    }));
  };

  const handleNextMonth = () => {
    setDateRange(prev => ({
      start: startOfMonth(new Date(prev.start.setMonth(prev.start.getMonth() + 1))),
      end: endOfMonth(new Date(prev.start))
    }));
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    // Filter by search term
    const matchesSearch = 
      evaluation.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || 
                         evaluation.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Filter by date range
    const evaluationDate = parseISO(evaluation.submittedAt);
    const matchesDate = isWithinInterval(evaluationDate, { 
      start: dateRange.start, 
      end: dateRange.end 
    });

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Generate month options for the filter
  const months = [];
  const currentDate = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);
    months.push({
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy')
    });
  }

  if (isLoading) {
    return <div>Loading evaluations...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold">Employee Evaluations</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search evaluations..."
              className="pl-8 sm:w-[200px] lg:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              {format(dateRange.start, 'MMM yyyy')}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              className="h-9 w-9 p-0"
              disabled={format(dateRange.start, 'yyyy-MM') === format(new Date(), 'yyyy-MM')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="sm" className="ml-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvaluations.length > 0 ? (
              filteredEvaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell className="font-medium">
                    <div className="font-medium">{evaluation.employeeName}</div>
                    <div className="text-xs text-muted-foreground">{evaluation.employeeId}</div>
                  </TableCell>
                  <TableCell>{evaluation.department}</TableCell>
                  <TableCell>{evaluation.position}</TableCell>
                  <TableCell>
                    {format(parseISO(evaluation.submittedAt), 'MMM d, yyyy')}
                    <div className="text-xs text-muted-foreground">
                      {format(parseISO(evaluation.submittedAt), 'h:mm a')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      evaluation.status === 'Submitted' 
                        ? 'bg-blue-100 text-blue-800' 
                        : evaluation.status === 'Draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {evaluation.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium">{evaluation.overallScore.toFixed(1)}/5</div>
                    <div className="text-xs text-muted-foreground">
                      {evaluation.ratings ? 
                        `${Object.values(evaluation.ratings).reduce((a, b) => a + b, 0) / Object.keys(evaluation.ratings).length}/5` : 
                        'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No evaluations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {filteredEvaluations.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing <span className="font-medium">{filteredEvaluations.length}</span> of{' '}
            <span className="font-medium">{evaluations.length}</span> evaluations
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={filteredEvaluations.length <= 10}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationsTable;
