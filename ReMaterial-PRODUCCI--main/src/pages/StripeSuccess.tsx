import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const StripeSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-2xl shadow p-6 bg-white">
        <h1 className="text-2xl font-semibold mb-2">¡Pago completado!</h1>
        <p className="text-slate-600 mb-6">
          Gracias por tu suscripción. Tu pago se ha procesado correctamente.
          {sessionId ? ' (Ref: ' + sessionId + ')' : ''}
        </p>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl shadow border border-slate-200 hover:bg-slate-50"
            aria-label="Ir al panel"
          >
            Ir al panel
          </button>

          <button
            onClick={() => navigate('/settings/billing')}
            className="px-4 py-2 rounded-xl shadow border border-slate-200 hover:bg-slate-50"
            aria-label="Abrir facturación"
          >
            Ver facturación
          </button>

          <button
            onClick={() => navigate('/plans')}
            className="px-4 py-2 rounded-xl shadow border border-slate-200 hover:bg-slate-50"
            aria-label="Ver planes"
          >
            Ver planes
          </button>
        </div>
      </div>
    </div>
  );
};

export default StripeSuccess;