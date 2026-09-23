import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface RegisterProps {
  onLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onLogin }) => {
  const { register } = useAuth();

  // ============================================================
  // REGISTRATION FORM STATES
  // ============================================================

  const [name, setName] = useState('');
  const [investigatorId, setInvestigatorId] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ============================================================
  // OTP STATES
  // ============================================================

  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // ============================================================
  // GENERAL STATES
  // ============================================================

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // ============================================================
  // API URL
  // ============================================================

  const API_URL = (
    import.meta.env.VITE_API_URL ||
    'http://127.0.0.1:8000/api/v1'
  ).replace(/\/+$/, '');

  // ============================================================
  // REGISTER
  // ============================================================

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    // ----------------------------------------------------------
    // PASSWORD VALIDATION
    // ----------------------------------------------------------

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // ----------------------------------------------------------
    // MOBILE VALIDATION
    // ----------------------------------------------------------

    if (mobile.length !== 10) {
      setError('Mobile number must be 10 digits.');
      return;
    }

    setLoading(true);

    try {
      const result = await register(
        {
          name,
          email,
          investigatorId,
          mobile,
          department,
          designation,
        },
        password
      );

      // --------------------------------------------------------
      // REGISTRATION FAILED
      // --------------------------------------------------------

      if (!result || result.success !== true) {
        setError(
          result?.message ||
          'Registration failed. Please check your details and try again.'
        );
        return;
      }

      // --------------------------------------------------------
      // REGISTRATION SUCCESSFUL
      // --------------------------------------------------------

      setSuccess(
        `Account created successfully! A 6-digit OTP has been sent to ${email}.`
      );

      // Show OTP screen
      setShowOTP(true);

      // Clear passwords
      setPassword('');
      setConfirmPassword('');

    } catch (err) {
      console.error('Registration error:', err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          'Unable to connect to the authentication server.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // VERIFY OTP
  // ============================================================

  const handleVerifyOTP = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    // ----------------------------------------------------------
    // OTP VALIDATION
    // ----------------------------------------------------------

    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setOtpLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            email: email,
            otp: otp,
          }),
        }
      );

      const responseText = await response.text();

      let data: any = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        data = {};
      }

      // --------------------------------------------------------
      // VERIFICATION FAILED
      // --------------------------------------------------------

      if (!response.ok) {
        setError(
          data.detail ||
          data.message ||
          'OTP verification failed. Please try again.'
        );
        return;
      }

      // --------------------------------------------------------
      // VERIFICATION SUCCESSFUL
      // --------------------------------------------------------

      setSuccess(
        'Email verified successfully! You can now login.'
      );

      setOtp('');

      // Small delay so user can see success message
      setTimeout(() => {
        onLogin();
      }, 1200);

    } catch (err) {
      console.error('OTP verification error:', err);

      setError(
        'Unable to connect to the authentication server.'
      );

    } finally {
      setOtpLoading(false);
    }
  };

  // ============================================================
  // RESEND OTP
  // ============================================================

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');

    setResendLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/resend-otp?email=${encodeURIComponent(email)}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const responseText = await response.text();

      let data: any = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        data = {};
      }

      // --------------------------------------------------------
      // RESEND FAILED
      // --------------------------------------------------------

      if (!response.ok) {
        setError(
          data.detail ||
          data.message ||
          'Unable to resend OTP.'
        );
        return;
      }

      // --------------------------------------------------------
      // RESEND SUCCESSFUL
      // --------------------------------------------------------

      setSuccess(
        `A new OTP has been sent to ${email}.`
      );

      setOtp('');

    } catch (err) {
      console.error('Resend OTP error:', err);

      setError(
        'Unable to connect to the authentication server.'
      );

    } finally {
      setResendLoading(false);
    }
  };

  // ============================================================
  // OTP SCREEN
  // ============================================================

  if (showOTP) {
    return (
      <div className="min-h-screen bg-setu-bg flex items-center justify-center px-4 py-8">

        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">

            <h1 className="text-3xl font-bold text-setu-text">
              Investigator Portal
            </h1>

            <p className="mt-2 text-setu-text/60">
              Secure Investigation & Intelligence System
            </p>

          </div>

          {/* OTP Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">

            {/* Icon */}
            <div className="flex justify-center mb-5">

              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">

                <span className="text-3xl">
                  📧
                </span>

              </div>

            </div>

            {/* Title */}
            <h2 className="text-2xl font-semibold text-setu-text text-center mb-2">
              Verify Your Email
            </h2>

            <p className="text-sm text-setu-text/60 text-center mb-6">
              We have sent a 6-digit verification OTP to:
            </p>

            <p className="text-sm font-semibold text-blue-600 text-center mb-6 break-all">
              {email}
            </p>

            {/* Success Message */}
            {success && (
              <div className="mb-5">

                <p className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-3 rounded-lg text-center">
                  {success}
                </p>

              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-5">

                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 rounded-lg text-center">
                  {error}
                </p>

              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleVerifyOTP}>

              <label className="block text-sm font-medium mb-2 text-center">
                Enter OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6);

                  setOtp(value);
                }}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-[0.5em] font-semibold"
                disabled={otpLoading}
                required
              />

              {/* Verify Button */}
              <button
                type="submit"
                disabled={
                  otpLoading ||
                  otp.length !== 6
                }
                className="w-full mt-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {otpLoading
                  ? 'Verifying OTP...'
                  : 'Verify Email'}
              </button>

            </form>

            {/* Resend OTP */}
            <div className="text-center mt-5">

              <p className="text-sm text-setu-text/60 mb-2">
                Didn't receive the OTP?
              </p>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-blue-600 font-semibold hover:underline disabled:opacity-50"
              >
                {resendLoading
                  ? 'Sending...'
                  : 'Resend OTP'}
              </button>

            </div>

            {/* Back to Registration */}
            <div className="text-center mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">

              <button
                type="button"
                onClick={() => {
                  setShowOTP(false);
                  setOtp('');
                  setError('');
                  setSuccess('');
                }}
                disabled={otpLoading || resendLoading}
                className="text-sm text-setu-text/60 hover:text-setu-text"
              >
                ← Back to Registration
              </button>

            </div>

          </div>

          {/* Footer */}
          <p className="text-center text-xs text-setu-text/40 mt-6">
            Authorized Investigator Access Only
          </p>

        </div>

      </div>
    );
  }

  // ============================================================
  // REGISTRATION SCREEN
  // ============================================================

  return (
    <div className="min-h-screen bg-setu-bg flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold text-setu-text">
            Investigator Portal
          </h1>

          <p className="mt-2 text-setu-text/60">
            Secure Investigation & Intelligence System
          </p>

        </div>

        {/* Registration Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">

          <h2 className="text-2xl font-semibold text-setu-text mb-2">
            Investigator Registration
          </h2>

          <p className="text-sm text-setu-text/60 mb-6">
            Create your authorized investigator account
          </p>

          {/* Success Message */}
          {success && (
            <div className="mb-5">

              <div className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-4 rounded-lg">

                <p className="font-semibold mb-1">
                  Registration Successful
                </p>

                <p>
                  {success}
                </p>

              </div>

            </div>
          )}

          <form
            onSubmit={handleRegister}
            className="grid md:grid-cols-2 gap-5"
          >

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Investigator ID */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Investigator ID
              </label>

              <input
                type="text"
                value={investigatorId}
                onChange={(e) =>
                  setInvestigatorId(e.target.value)
                }
                placeholder="INV-2026-001"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Official Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Official Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investigator@department.gov"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Mobile Number
              </label>

              <input
                type="tel"
                value={mobile}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 10);

                  setMobile(value);
                }}
                placeholder="Enter mobile number"
                maxLength={10}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Department / Organization
              </label>

              <input
                type="text"
                value={department}
                onChange={(e) =>
                  setDepartment(e.target.value)
                }
                placeholder="Enter department"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Designation
              </label>

              <input
                type="text"
                value={designation}
                onChange={(e) =>
                  setDesignation(e.target.value)
                }
                placeholder="Investigation Officer"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Create password"
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm password"
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="md:col-span-2">

                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-lg">
                  {error}
                </p>

              </div>
            )}

            {/* Register Button */}
            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Creating Account...'
                  : 'Create Investigator Account'}
              </button>

            </div>

          </form>

          {/* Login Link */}
          <div className="text-center mt-6 text-sm">

            <span className="text-setu-text/60">
              Already have an account?
            </span>{' '}

            <button
              type="button"
              onClick={onLogin}
              disabled={loading}
              className="text-blue-600 font-semibold hover:underline disabled:opacity-50"
            >
              Login
            </button>

          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-setu-text/40 mt-6">
          Authorized Investigator Access Only
        </p>

      </div>

    </div>
  );
};

export { Register };
export default Register;