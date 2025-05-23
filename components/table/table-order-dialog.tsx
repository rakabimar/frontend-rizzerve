"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_URLS } from "@/lib/constants";
import type { TableWithOrderResponse } from "@/types/table";
import { useAuth } from "@/context/auth-context";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tableId: string;
}

export default function TableOrderDialog({
  open,
  onOpenChange,
  tableId,
}: Props) {
  const { user } = useAuth();
  const [data, setData] = useState<TableWithOrderResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const abort = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const url = `${API_URLS.TABLE_SERVICE_URL}${API_URLS.TABLE_API_URL}/${tableId}`;
        const res = await fetch(url, {
          signal: abort.signal,
          headers: { Authorization: `Bearer ${user?.token ?? ""}` },
        });
        if (!res.ok) throw new Error(await res.text());
        setData(await res.json());
      } catch {
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, [open, tableId, user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Current order for table #{data?.nomorMeja}</DialogTitle>
        </DialogHeader>

        {loading && <p>Loading…</p>}
        {!loading && !data?.currentOrder && <p>No active order.</p>}

        {data?.currentOrder && (
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge>{data.currentOrder.orderStatus}</Badge>
            </div>

            <UiTable>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.currentOrder.items.map((it) => (
                  <TableRow key={it.menuItemId}>
                    <TableCell>{it.menuItemName}</TableCell>
                    <TableCell>{it.quantity}</TableCell>
                    <TableCell>{it.price.toFixed(2)}</TableCell>
                    <TableCell>{it.subtotal.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </UiTable>

            <div className="flex justify-end font-bold">
              Total&nbsp;:&nbsp;Rp&nbsp;
              {data.currentOrder.totalPrice.toFixed(2)}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}