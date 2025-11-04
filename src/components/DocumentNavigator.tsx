import { Search, Filter, CheckCircle, Clock, AlertCircle, XCircle, Edit3, Flag } from "lucide-react";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";

type DocumentNavigatorProps = {
  stats: {
    total: number;
    completed: number;
    processing: number;
    pending: number;
    failed: number;
    edited: number;
    flagged: number;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: string | null;
  onFilterStatusChange: (status: string | null) => void;
  filterEdited: boolean | null;
  onFilterEditedChange: (edited: boolean | null) => void;
};

export function DocumentNavigator({
  stats,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterEdited,
  onFilterEditedChange,
}: DocumentNavigatorProps) {
  return (
    <div className="w-72 bg-white border-r-2 border-neutral-300 flex flex-col">
      {/* Search */}
      <div className="flex-none p-4 border-b-2 border-neutral-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" strokeWidth={2.5} />
          <Input
            type="text"
            placeholder="Search chunks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-2 border-neutral-300 focus:border-purple-500"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Overview Stats */}
          <div>
            <h4 className="text-xs text-neutral-600 uppercase tracking-wider mb-3">Overview</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                <span className="text-sm text-neutral-700">Total Chunks</span>
                <span className="text-sm tabular-nums text-neutral-900">{stats.total}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status Filters */}
          <div>
            <h4 className="text-xs text-neutral-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Filter className="w-3 h-3" strokeWidth={2.5} />
              Filter by Status
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => onFilterStatusChange(filterStatus === "completed" ? null : "completed")}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all border-2 ${
                  filterStatus === "completed"
                    ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                    : "border-transparent hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                  <span className="text-sm">Completed</span>
                </div>
                <span className="text-sm tabular-nums">{stats.completed}</span>
              </button>

              <button
                onClick={() => onFilterStatusChange(filterStatus === "processing" ? null : "processing")}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all border-2 ${
                  filterStatus === "processing"
                    ? "bg-blue-50 border-blue-400 text-blue-900"
                    : "border-transparent hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                  <span className="text-sm">Processing</span>
                </div>
                <span className="text-sm tabular-nums">{stats.processing}</span>
              </button>

              <button
                onClick={() => onFilterStatusChange(filterStatus === "pending" ? null : "pending")}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all border-2 ${
                  filterStatus === "pending"
                    ? "bg-neutral-100 border-neutral-400 text-neutral-900"
                    : "border-transparent hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-neutral-600" strokeWidth={2.5} />
                  <span className="text-sm">Pending</span>
                </div>
                <span className="text-sm tabular-nums">{stats.pending}</span>
              </button>

              <button
                onClick={() => onFilterStatusChange(filterStatus === "failed" ? null : "failed")}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all border-2 ${
                  filterStatus === "failed"
                    ? "bg-red-50 border-red-400 text-red-900"
                    : "border-transparent hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                  <span className="text-sm">Failed</span>
                </div>
                <span className="text-sm tabular-nums">{stats.failed}</span>
              </button>
            </div>
          </div>

          <Separator />

          {/* Other Filters */}
          <div>
            <h4 className="text-xs text-neutral-600 uppercase tracking-wider mb-3">Quick Filters</h4>
            <div className="space-y-1">
              <button
                onClick={() => onFilterEditedChange(filterEdited === true ? null : true)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all border-2 ${
                  filterEdited === true
                    ? "bg-blue-50 border-blue-400 text-blue-900"
                    : "border-transparent hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                  <span className="text-sm">Edited Only</span>
                </div>
                <span className="text-sm tabular-nums">{stats.edited}</span>
              </button>

              <button
                className="w-full flex items-center justify-between p-2.5 rounded-lg transition-all border-2 border-transparent hover:bg-neutral-50"
              >
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                  <span className="text-sm">Flagged Only</span>
                </div>
                <span className="text-sm tabular-nums">{stats.flagged}</span>
              </button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
