"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { API_URLS } from "@/lib/constants";
import type { Table, TableStatus } from "@/types/table";
import { useAuth } from "@/context/auth-context";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  table?: Table;
  onSuccess: () => void;
}

export default function TableDialog({
  open,
  onOpenChange,
  table,
  onSuccess,
}: Props) {
  const { toast } = useToast();
  const { user } = useAuth();

  const [nomorMeja, setNomorMeja] = useState<string>(
    table ? String(table.nomorMeja) : ""
  );
  const [status, setStatus] = useState<TableStatus>(
    table?.status ?? "TERSEDIA"
  );
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (table) {
      setNomorMeja(String(table.nomorMeja));
      setStatus(table.status);
    } else {
      setNomorMeja("");
      setStatus("TERSEDIA");
    }
    setErrMsg("");
  }, [table, open]);

  const submit = async () => {
    const noMeja = parseInt(nomorMeja, 10);
    if (!noMeja || noMeja < 1) {
      setErrMsg("Nomor meja harus lebih dari 0");
      return;
    }

    setLoading(true);
    setErrMsg("");
    try {
      const url = table
        ? `${API_URLS.TABLE_SERVICE_URL}${API_URLS.TABLE_API_URL}/${table.id}/update`
        : `${API_URLS.TABLE_SERVICE_URL}${API_URLS.TABLE_API_URL}/create`;
      const method = table ? "PUT" : "POST";
      const body = JSON.stringify({ nomorMeja: noMeja, status });

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token ?? ""}`,
        },
        body,
      });

      if (!res.ok) {
        let msg = "Operation failed";
        try {
          const json = await res.json();
          msg = json.message || msg;
        } catch {
          msg = await res.text();
        }
        throw new Error(msg);
      }

      toast({ title: table ? "Table updated" : "Table created" });
      onSuccess();
      onOpenChange(false);
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{table ? "Update Table" : "Add Table"}</DialogTitle>
          <DialogDescription>
            {table ? "Update table details." : "Create a new table."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nomor Meja</label>
            <Input
              type="number"
              min={1}
              value={nomorMeja}
              onChange={(e) => setNomorMeja(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full border rounded-md h-10 px-3"
              value={status}
              onChange={(e) => setStatus(e.target.value as TableStatus)}
            >
              <option value="TERSEDIA">TERSEDIA</option>
              <option value="TERPAKAI">TERPAKAI</option>
            </select>
          </div>

          <Button
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700"
            onClick={submit}
          >
            {loading ? "Saving…" : table ? "Update table" : "Create table"}
          </Button>

          {errMsg && (
            <p className="text-sm text-red-600 mt-1 text-center">{errMsg}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
