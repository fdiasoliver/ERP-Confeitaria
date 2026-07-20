"use client";

// setState calls inside async fetch effects are intentional (no cascade risk).
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { getOrdersByPhone } from "@/services/orderService";
import type { Order } from "@/lib/types";

interface UseUserOrdersResult {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUserOrders(phone: string | null): UseUserOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(phone));
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!phone) return;

    setIsLoading(true);
    setError(null);

    getOrdersByPhone(phone)
      .then(setOrders)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erro desconhecido"))
      .finally(() => setIsLoading(false));
  }, [phone, tick]);

  return { orders, isLoading, error, refetch: () => setTick((t) => t + 1) };
}
