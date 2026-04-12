'use client';

import { NavigateToResource } from "@refinedev/nextjs-router/app";

export default function AdminIndex() {
  return <NavigateToResource resource="orders" />;
}
