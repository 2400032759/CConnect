import { useState, useEffect } from 'react';

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);

  useEffect(() => {
    const calculateStrength = () => {
      let score = 0;
      const newFeedback: string[] = [];

      if (password.length === 0) {
        setStrength(0);
        setFeedback([]);
        return;
      }

      // Length check
      if (password.length >= 8) {
        score += 1;
      } else {
        newFeedback.push('At least 8 characters');
      }

      // Lowercase check
      if (/[a-z]/.test(password)) {
        score += 1;
      } else {
        newFeedback.push('At least one lowercase letter');
      }

      // Uppercase check
      if (/[A-Z]/.test(password)) {
        score += 1;
      } else {
        newFeedback.push('At least one uppercase letter');
      }

      // Number check
      if (/\d/.test(password)) {
        score += 1;
      } else {
        newFeedback.push('At least one number');
      }

      // Special character check
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score += 1;
      } else {
        newFeedback.push('At least one special character');
      }

      setStrength(score);
      setFeedback(newFeedback);
    };

    calculateStrength();
  }, [password]);

  const getStrengthColor = () => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength <= 1) return 'Very Weak';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  if (password.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          ></div>
        </div>
        <span className="text-xs font-medium text-gray-600">
          {getStrengthText()}
        </span>
      </div>
      
      {feedback.length > 0 && (
        <div className="text-xs text-gray-500">
          <p className="font-medium">Improve your password:</p>
          <ul className="list-disc list-inside space-y-1">
            {feedback.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};