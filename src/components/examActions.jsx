import { Edit, Trash2, Eye } from "lucide-react";



const ExamActions = ({ exam, onView, onEdit, onDelete }) => {
    return (
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onView(exam)}
          className="text-gray-400 hover:text-blue-600"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
        
        {exam.status === 'upcoming' && (
          <>
            <button
              onClick={() => onEdit(exam)}
              className="text-gray-400 hover:text-blue-600"
              title="Edit Exam"
            >
              <Edit className="h-4 w-4" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this exam?')) {
                  onDelete(exam);
                }
              }}
              className="text-gray-400 hover:text-red-600"
              title="Delete Exam"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    )}

    export default ExamActions