import { CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

const PasswordRegexPopover = ({ password }: { password: string }) => {
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);

  useEffect(() => {
    setHasLowerCase(/[a-z]/.test(password));
    setHasUpperCase(/[A-Z]/.test(password));
    setHasSpecialChar(/[^a-zA-Z0-9]/.test(password));
  }, [password]);

  return (
    <div className="absolute -bottom-15 md:bottom-0 md:-right-72 mt-3 p-6 bg-white border border-gray-300 rounded shadow-lg">
      <p className="text-sm font-semibold mb-5">Password must contain:</p>
      <ul className="mt-2 space-y-2">
        <li className="flex items-center">
          {hasLowerCase ? (
            <CheckCircle className="text-green-500 mr-2 size-5" />
          ) : (
            <XCircle className="text-red-500 mr-2 size-5" />
          )}
          <span className={hasLowerCase ? "text-green-500" : "text-red-500"}>
            At least one lowercase letter
          </span>
        </li>
        <li className="flex items-center">
          {hasUpperCase ? (
            <CheckCircle className="text-green-500 mr-2 size-5" />
          ) : (
            <XCircle className="text-red-500 mr-2 size-5" />
          )}
          <span className={hasUpperCase ? "text-green-500" : "text-red-500"}>
            At least one uppercase letter
          </span>
        </li>
        <li className="flex items-center">
          {hasSpecialChar ? (
            <CheckCircle className="text-green-500 mr-2 size-5" />
          ) : (
            <XCircle className="text-red-500 mr-2 size-5" />
          )}
          <span className={hasSpecialChar ? "text-green-500" : "text-red-500"}>
            At least one Special letter <br /> (e.g.,!, @, #, $, %, ^, &, *)
          </span>
        </li>
      </ul>
    </div>
  );
};
export default PasswordRegexPopover;
