import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { TimeSeriesData } from '../data/mockData';
import { format } from 'date-fns';

interface DataTableProps {
  data: TimeSeriesData[];
  stationName?: string;
}

type SortField = keyof TimeSeriesData;
type SortDirection = 'asc' | 'desc';

const DataTable = ({ data, stationName = "All Stations" }: DataTableProps) => {
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // Sort data
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'timestamp') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [data, dateRange, sortField, sortDirection]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Lead (ppm)', 'Mercury (ppm)', 'Cadmium (ppm)', 'Arsenic (ppm)'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        `"${format(new Date(row.timestamp), 'yyyy-MM-dd')}"`, // Wrap date in quotes
        row.lead.toFixed(3),
        row.mercury.toFixed(3),
        row.cadmium.toFixed(3),
        row.arsenic.toFixed(3)
      ].join(','))
    ].join('\n');

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pollution-data-${stationName.replace(/\s+/g, '-').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (value: number, pollutant: string) => {
    const thresholds: Record<string, { safe: number; caution: number }> = {
      lead: { safe: 0.2, caution: 0.5 },
      mercury: { safe: 0.05, caution: 0.1 },
      cadmium: { safe: 0.03, caution: 0.06 },
      arsenic: { safe: 0.05, caution: 0.1 },
    };

    const threshold = thresholds[pollutant];
    if (!threshold) return 'text-gray-300';

    if (value <= threshold.safe) return 'text-green-400';
    if (value <= threshold.caution) return 'text-yellow-400';
    return 'text-red-400';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
    >
      {/* Header and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">
            Historical Data
          </h3>
          <p className="text-gray-400 text-sm">
            {stationName} - {filteredData.length} records
          </p>
        </div>

        <div className="flex flex-wrap items-center space-x-4 space-y-2 lg:space-y-0">
          {/* Date Range Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th 
                className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors duration-200"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <SortIcon field="timestamp" />
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors duration-200"
                onClick={() => handleSort('lead')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Lead (ppm)</span>
                  <SortIcon field="lead" />
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors duration-200"
                onClick={() => handleSort('mercury')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Mercury (ppm)</span>
                  <SortIcon field="mercury" />
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors duration-200"
                onClick={() => handleSort('cadmium')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Cadmium (ppm)</span>
                  <SortIcon field="cadmium" />
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors duration-200"
                onClick={() => handleSort('arsenic')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Arsenic (ppm)</span>
                  <SortIcon field="arsenic" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <motion.tr
                key={row.timestamp}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors duration-200"
              >
                <td className="py-3 px-4 text-white">
                  {format(new Date(row.timestamp), 'MMM dd, yyyy')}
                </td>
                <td className={`py-3 px-4 text-right font-mono ${getStatusColor(row.lead, 'lead')}`}>
                  {row.lead.toFixed(3)}
                </td>
                <td className={`py-3 px-4 text-right font-mono ${getStatusColor(row.mercury, 'mercury')}`}>
                  {row.mercury.toFixed(3)}
                </td>
                <td className={`py-3 px-4 text-right font-mono ${getStatusColor(row.cadmium, 'cadmium')}`}>
                  {row.cadmium.toFixed(3)}
                </td>
                <td className={`py-3 px-4 text-right font-mono ${getStatusColor(row.arsenic, 'arsenic')}`}>
                  {row.arsenic.toFixed(3)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors duration-200"
            >
              Previous
            </button>
            <span className="text-sm text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DataTable;