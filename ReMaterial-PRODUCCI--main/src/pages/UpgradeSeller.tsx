import { useNavigate } from "react-router-dom";

export default function UpgradeSeller() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-3">Hazte vendedor</h1>
      <p className="text-sm opacity-80 mb-6">
        Tu cuenta actual es de <strong>comprador</strong>. Para publicar materiales,
        acceder al <em>Dashboard</em> y gestionar tus productos, cambia a cuenta vendedora.
      </p>
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 rounded-xl border" onClick={() => navigate(-1)}>Volver</button>
        <button className="px-4 py-2 rounded-xl border font-medium" onClick={() => navigate("/settings/account?promote=seller")}>
          Cambiar a vendedor
        </button>
      </div>
    </div>
  );
}
