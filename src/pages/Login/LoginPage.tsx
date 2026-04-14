import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const [keep, setKeep] = useState(true);
  const auth = useAuth();
  const navigate = useNavigate();

  const goHome = () => navigate('/home');

  return (
    <div className="max-w-sm mx-auto px-4 py-8 md:py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Entrar</h1>
      <p className="text-gray-600 mb-6">Login simulado (mesmo fluxo do app Angular).</p>
      
      <label className="flex items-center gap-2 my-4 cursor-pointer">
        <input
          type="checkbox"
          checked={keep}
          onChange={(e) => setKeep(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-gray-700">Manter conectado</span>
      </label>

      <div className="flex flex-col gap-3">
        <button 
          type="button"
          className="px-5 py-3 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          onClick={() => auth.login('admin', keep)}
        >
          Entrar (simulado)
        </button>
        <button
          type="button"
          className="px-5 py-3 bg-white text-primary border-2 border-primary font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          onClick={() => auth.loginWithGoogle(keep)}
        >
          Entrar com Google
        </button>
        <button
          type="button"
          className="px-5 py-3 bg-transparent border-0 text-primary font-medium cursor-pointer hover:underline"
          onClick={goHome}
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
