/**
 * ConversationActions.tsx
 * Menú de acciones por conversación: sin scrolls al abrir (portal fijo al viewport).
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renameConversation, setArchived, softDelete, mute, unmute } from "./chatApi";
import { useTranslation } from "react-i18next";

type Props = {
  conversation: any;
  userId: string;
  onChange?: () => void; // refrescar lista tras acción
};

export default function ConversationActions({ conversation, userId, onChange }: Props) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // refs para posicionamiento/close
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  const syncPosition = () => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos({
      top: Math.round(r.bottom + 8), // 8px de separación
      right: Math.round(window.innerWidth - r.right),
    });
  };

  useEffect(() => {
    if (!open) return;

    // calcular posición inicial
    syncPosition();

    const handleScroll = () => syncPosition(); // re-posicionar en cualquier scroll
    const handleResize = () => syncPosition();
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
      setRenaming(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setRenaming(false);
      }
    };

    // usar fase de captura para detectar scrolls en contenedores
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const doRename = async () => {
    const title = newTitle.trim();
    if (!title) return;
    await renameConversation(conversation.id, userId, title);
    setRenaming(false);
    setNewTitle("");
    setOpen(false);
    onChange?.();
  };

  const doArchive = async (archived: boolean) => {
    await setArchived(conversation.id, userId, archived);
    setOpen(false);
    onChange?.();
  };

  const doDelete = async () => {
    await softDelete(conversation.id, userId);
    setOpen(false);
    onChange?.();
  };

  const doMute = async (hours: number) => {
    const until = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    await mute(conversation.id, userId, until);
    setOpen(false);
    onChange?.();
  };

  const doUnmute = async () => {
    await unmute(conversation.id, userId);
    setOpen(false);
    onChange?.();
  };

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
          // reset de renombrado si se vuelve a abrir/cerrar
          if (!open) {
            setRenaming(false);
            setNewTitle("");
          }
        }}
        title="Acciones"
      >
        ⋮
      </Button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: pos.top,
              right: pos.right,
              zIndex: 60,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            className="w-64 rounded-md border bg-background shadow-lg p-2 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            {!renaming ? (
              <>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => setRenaming(true)}
                >
                  Renombrar
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => doArchive(true)}
                  >
                    Archivar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => doArchive(false)}
                  >
                    Restaurar
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => doMute(1)}>
                    Silenciar 1h
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => doMute(8)}>
                    8h
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => doMute(24)}>
                    24h
                  </Button>
                </div>

                <Button variant="outline" className="w-full" onClick={doUnmute}>
                  Quitar silencio
                </Button>

                <Button variant="destructive" className="w-full" onClick={doDelete}>{t('ui.eliminar-solo-para-m')}</Button>
              </>
            ) : (
              <div className="space-y-2">
                <Input
                  autoFocus
                  placeholder={t('ui.nuevo-t-tulo')}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") doRename();
                    if (e.key === "Escape") {
                      setRenaming(false);
                      setNewTitle("");
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={doRename} disabled={!newTitle.trim()}>{t('ui.guardar')}</Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setRenaming(false);
                      setNewTitle("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}