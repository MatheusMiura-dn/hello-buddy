import { createServerFn } from "@tanstack/react-start";
import {
  createOrderServer,
  listOrdersServer,
  findOrderServer,
  findPublicOrderServer,
  updateOrderStatusServer,
  createOrderInput,
  adminInput,
  codeInput,
  publicCodeInput,
  updateOrderInput,
} from "./orders.server";

export const createOrder = createServerFn({ method: "POST" }).validator(createOrderInput).handler(async ({ data }) => createOrderServer(data));
export const listOrders = createServerFn({ method: "GET" }).validator(adminInput).handler(async ({ data }) => listOrdersServer(data));
export const findOrder = createServerFn({ method: "GET" }).validator(codeInput).handler(async ({ data }) => findOrderServer(data));
export const findPublicOrder = createServerFn({ method: "GET" }).validator(publicCodeInput).handler(async ({ data }) => findPublicOrderServer(data));
export const updateOrderStatus = createServerFn({ method: "POST" }).validator(updateOrderInput).handler(async ({ data }) => updateOrderStatusServer(data));
