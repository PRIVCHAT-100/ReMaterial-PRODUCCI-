import React from 'react';
import { useNavigate } from 'react-router-dom';

const StripeCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-2xl shadow p-6 bg-white">
        <h1 className="text-2xl font-semibold mb-2">Pago cancelado</h1>
        <p className="text-slate-600 mb-6">
          Has cancelado el proceso de pago. Puedes reintentarlo cuando quieras.
        </p>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate('/plans')}
            className="px-4 py-2 rounded-xl shadow border border-slate-200 hover:bg-slate-50"
            aria-label="Volver a planes"
          >
            Volver a planes
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl shadow border border-slate-200 hover:bg-slate-50"
            aria-label="Volver"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default StripeCancel;