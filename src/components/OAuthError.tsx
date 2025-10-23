// OAuth Error Component
import { useEffect, useState } from 'react';

export default function OAuthError() {
  const [errorDetails, setErrorDetails] = useState<any>(null);

  useEffect(() => {
    // Extract error details from URL
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    const error = urlParams.get('error') || hashParams.get('error');
    const errorCode = urlParams.get('error_code') || hashParams.get('error_code');
    const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
    
    if (error) {
      setErrorDetails({
        error,
        errorCode,
        errorDescription: decodeURIComponent(errorDescription || '')
      });
    }
  }, []);

  const handleRetry = () => {
    // Clear URL parameters and redirect to login
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.reload();
  };

  if (!errorDetails) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error de Autenticación
          </h1>
          
          <p className="text-gray-600 mb-6">
            Hubo un problema al iniciar sesión con Google. Aquí están los detalles:
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2">
              <div>
                <span className="font-semibold text-gray-700">Error:</span>
                <span className="ml-2 text-red-600">{errorDetails.error}</span>
              </div>
              {errorDetails.errorCode && (
                <div>
                  <span className="font-semibold text-gray-700">Código:</span>
                  <span className="ml-2 text-gray-600">{errorDetails.errorCode}</span>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-700">Descripción:</span>
                <span className="ml-2 text-gray-600">{errorDetails.errorDescription}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Intentar de Nuevo
            </button>
            
            <div className="text-sm text-gray-500">
              <p className="mb-2">Si el problema persiste, verifica:</p>
              <ul className="text-left space-y-1">
                <li>• Configuración de Google Cloud Console</li>
                <li>• Redirect URLs en Supabase</li>
                <li>• Conectividad a internet</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
