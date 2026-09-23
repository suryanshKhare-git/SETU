import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

interface Investigator {
  name: string;
  email: string;
  investigatorId: string;
  mobile: string;
  department: string;
  designation: string;
  role?: string;
}

interface RegisterResult {
  success: boolean;
  verification_required?: boolean;
  verification_link?: string;
  message?: string;
}

interface AuthContextType {
  investigator: Investigator | null;

  login: (
    email: string,
    password: string
  ) => Promise<boolean>;

  register: (
    investigator: Investigator,
    password: string
  ) => Promise<RegisterResult>;

  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const API_URL = (
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000/api/v1'
).replace(/\/+$/, '');

export const AuthProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {

  // =========================================================
  // CURRENT LOGGED-IN INVESTIGATOR
  // =========================================================

  const [investigator, setInvestigator] =
    useState<Investigator | null>(() => {

      const saved =
        localStorage.getItem('investigator');

      if (!saved) {
        return null;
      }

      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem('investigator');
        localStorage.removeItem('access_token');

        return null;
      }
    });


  // =========================================================
  // LOGIN
  // =========================================================

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {

    try {

      const endpoint =
        `${API_URL}/auth/login`;

      console.log(
        'LOGIN API:',
        endpoint
      );

      const response = await fetch(
        endpoint,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );


      // -----------------------------------------------------
      // READ RESPONSE
      // -----------------------------------------------------

      const rawText =
        await response.text();

      console.log(
        'LOGIN STATUS:',
        response.status
      );

      console.log(
        'LOGIN RESPONSE:',
        rawText
      );


      // -----------------------------------------------------
      // SERVER ERROR
      // -----------------------------------------------------

      if (!response.ok) {

        let message =
          `Login failed. Server returned ${response.status}.`;

        try {

          const errorData =
            JSON.parse(rawText);

          message =
            errorData.detail ||
            errorData.message ||
            errorData.error ||
            message;

        } catch {

          if (rawText.trim()) {
            message = rawText;
          }
        }

        console.error(
          'Login server error:',
          message
        );

        return false;
      }


      // -----------------------------------------------------
      // PARSE JSON
      // -----------------------------------------------------

      let data: any;

      try {

        data =
          JSON.parse(rawText);

      } catch {

        console.error(
          'Invalid JSON received from login server.'
        );

        return false;
      }


      console.log(
        'PARSED LOGIN RESPONSE:',
        data
      );


      // =====================================================
      // IMPORTANT FIX
      // =====================================================
      //
      // Backend successful login response contains
      // access_token.
      //
      // We should NOT depend only on data.success because
      // backend may not send "success": true.
      //
      // =====================================================

      if (!data.access_token) {

        console.error(
          'Login rejected:',
          data.message ||
          data.detail ||
          data.error ||
          'Access token not received from server.'
        );

        return false;
      }


      // -----------------------------------------------------
      // GET INVESTIGATOR DATA
      // -----------------------------------------------------

      const loggedInInvestigator =
        data.investigator || {

          name: 'Investigator',

          email: email,

          investigatorId: 'INV-001',

          mobile: '',

          department: 'Investigation',

          designation: 'Investigation Officer',
        };


      // -----------------------------------------------------
      // SAVE INVESTIGATOR IN STATE
      // -----------------------------------------------------

      setInvestigator(
        loggedInInvestigator
      );


      // -----------------------------------------------------
      // SAVE INVESTIGATOR IN LOCAL STORAGE
      // -----------------------------------------------------

      localStorage.setItem(
        'investigator',
        JSON.stringify(
          loggedInInvestigator
        )
      );


      // -----------------------------------------------------
      // SAVE JWT TOKEN
      // -----------------------------------------------------

      localStorage.setItem(
        'access_token',
        data.access_token
      );


      console.log(
        'LOGIN SUCCESSFUL'
      );

      return true;

    } catch (error) {

      console.error(
        'LOGIN CONNECTION ERROR:',
        error
      );

      return false;
    }
  };


  // =========================================================
  // REGISTER
  // =========================================================

  const register = async (
    investigatorData: Investigator,
    password: string
  ): Promise<RegisterResult> => {

    try {

      const endpoint =
        `${API_URL}/auth/register`;

      console.log(
        'REGISTER API:',
        endpoint
      );


      const response = await fetch(
        endpoint,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },

          body: JSON.stringify({

            name:
              investigatorData.name,

            email:
              investigatorData.email,

            investigatorId:
              investigatorData.investigatorId,

            mobile:
              investigatorData.mobile,

            department:
              investigatorData.department,

            designation:
              investigatorData.designation,

            password:
              password,
          }),
        }
      );


      // -----------------------------------------------------
      // READ RESPONSE
      // -----------------------------------------------------

      const rawText =
        await response.text();

      console.log(
        'REGISTER STATUS:',
        response.status
      );

      console.log(
        'REGISTER RESPONSE:',
        rawText
      );


      // -----------------------------------------------------
      // SERVER ERROR
      // -----------------------------------------------------

      if (!response.ok) {

        let message =
          `Registration failed. Server returned ${response.status}.`;

        try {

          const errorData =
            JSON.parse(rawText);

          message =
            errorData.detail ||
            errorData.message ||
            errorData.error ||
            message;

        } catch {

          if (rawText.trim()) {
            message = rawText;
          }
        }

        console.error(
          'Registration server error:',
          message
        );

        throw new Error(message);
      }


      // -----------------------------------------------------
      // PARSE JSON
      // -----------------------------------------------------

      let data: RegisterResult;

      try {

        data =
          JSON.parse(rawText);

      } catch {

        throw new Error(
          'Invalid response received from authentication server.'
        );
      }


      console.log(
        'PARSED REGISTER RESPONSE:',
        data
      );


      // -----------------------------------------------------
      // CHECK REGISTRATION
      // -----------------------------------------------------

      if (!data.success) {

        throw new Error(
          data.message ||
          'Registration was rejected by the server.'
        );
      }


      console.log(
        'REGISTRATION SUCCESSFUL'
      );


      return data;

    } catch (error) {

      console.error(
        'REGISTRATION ERROR:',
        error
      );

      throw error;
    }
  };


  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = async (): Promise<void> => {

    try {

      const token =
        localStorage.getItem(
          'access_token'
        );


      await fetch(
        `${API_URL}/auth/logout`,
        {
          method: 'POST',

          headers: {
            'Accept': 'application/json',

            ...(token
              ? {
                  'Authorization':
                    `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

    } catch (error) {

      console.error(
        'LOGOUT API ERROR:',
        error
      );

    } finally {

      // -----------------------------------------------------
      // CLEAR STATE
      // -----------------------------------------------------

      setInvestigator(null);


      // -----------------------------------------------------
      // CLEAR LOCAL STORAGE
      // -----------------------------------------------------

      localStorage.removeItem(
        'investigator'
      );

      localStorage.removeItem(
        'access_token'
      );


      console.log(
        'LOGOUT SUCCESSFUL'
      );
    }
  };


  // =========================================================
  // AUTH CONTEXT PROVIDER
  // =========================================================

  return (
    <AuthContext.Provider
      value={{
        investigator,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


// ===========================================================
// USE AUTH HOOK
// ===========================================================

export const useAuth = () => {

  const context =
    useContext(AuthContext);

  if (!context) {

    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
};