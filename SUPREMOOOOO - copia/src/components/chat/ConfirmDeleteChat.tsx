import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Diálogo controlado de confirmación de borrado de chat.
 * - No usamos AlertDialogTrigger para que JAMÁS se abra por los "3 puntos".
 * - Solo se abre cuando el padre pone open=true (al pulsar Eliminar).
 */
export default function ConfirmDeleteChat(props: {
  open: boolean;
  chatName?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void; // El padre borra y cierra
}) {
  const { open, chatName, onCancel, onConfirm } = props;
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    try {
      setBusy(true);
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={() => { /* controlado por el padre */ }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Eliminar este chat{chatName ? `: “${chatName}”` : ""}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará la conversación de forma permanente. No se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy} onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction disabled={busy} onClick={handleConfirm}>
            {busy ? "Eliminando…" : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
