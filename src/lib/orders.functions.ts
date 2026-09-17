import { createServerFn } from "@tanstack/react-start";
import {
  createOrder as createOrderServer,
  listOrders as listOrdersServer,
  findOrder as findOrderServer,
  findPublicOrder as findPublicOrderServer,
  updateOrderStatus as updateOrderStatusServer,
} from "./orders.server";

export const createOrder = createServerFn({ method: "POST" }).handler(async ({ data }) => createOrderServer({ data }));

export const listOrders = createServerFn({ method: "GET" }).handler(async ({ data }) => listOrdersServer({ data }));

export const findOrder = createServerFn({ method: "GET" }).handler(async ({ data }) => findOrderServer({ data }));

export const findPublicOrder = createServerFn({ method: "GET" }).handler(async ({ data }) => findPublicOrderServer({ data }));

export const updateOrderStatus = createServerFn({ method: "POST" }).handler(async ({ data }) => updateOrderStatusServer({ data }));
