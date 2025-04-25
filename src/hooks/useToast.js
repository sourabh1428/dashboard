import { useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom hook for displaying toast notifications
 * This hook provides a consistent interface for showing different types of toast notifications
 */
export const useToast = () => {
  const showToast = useCallback(
    ({ title, description, variant = 'default', duration = 3000 }) => {
      if (variant === 'destructive') {
        return toast.error(
          <div>
            {title && <p className="font-semibold">{title}</p>}
            {description && <p className="text-sm">{description}</p>}
          </div>, 
          { duration }
        );
      }
      
      if (variant === 'success') {
        return toast.success(
          <div>
            {title && <p className="font-semibold">{title}</p>}
            {description && <p className="text-sm">{description}</p>}
          </div>, 
          { duration }
        );
      }
      
      return toast(
        <div>
          {title && <p className="font-semibold">{title}</p>}
          {description && <p className="text-sm">{description}</p>}
        </div>, 
        { duration }
      );
    },
    []
  );

  return { toast: showToast };
};

export default useToast; 