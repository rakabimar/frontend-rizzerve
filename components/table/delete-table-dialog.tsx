"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { API_URLS } from "@/lib/constants";
import type { Table } from "@/types/table";
import { useAuth } from "@/context/auth-context";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  table: Table;
  onSuccess: () => void;
}

export default function DeleteTableDialog({
  open,
  onOpenChange,
  table,
  onSuccess,
}: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URLS.TABLE_SERVICE_URL}${API_URLS.TABLE_API_URL}/${table.id}/delete`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user?.token ?? ""}` },
        }
      );
      if (!res.ok) throw new Error(await res.text());
      toast({ title: "Table deleted" });
      onSuccess();
      onOpenChange(false);
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Deletion failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete table #{table.nomorMeja}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}