import { Eye, EyeOff } from 'lucide-react';
import AuthInput from './AuthInput';
import type { InputHTMLAttributes } from 'react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  shown: boolean;
  onToggle: () => void;
}

export default function PasswordInput({ label, error, shown, onToggle, id, ...props }: PasswordInputProps) {
  return (
    <div className="relative">
      <AuthInput
        id={id}
        label={label}
        error={error}
        type={shown ? 'text' : 'password'}
        className="pr-12"
        {...props}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-[34px] flex h-9 w-9 items-center justify-center rounded-full text-[#5F5044] transition-colors hover:bg-[#F7F1E7] hover:text-[#27180F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B89255]"
        aria-label={shown ? 'Hide password' : 'Show password'}
      >
        {shown ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
      </button>
    </div>
  );
}
