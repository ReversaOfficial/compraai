---
name: Delivery/Courier System
description: Complete courier (freteiro) management system with freight table, delivery orders, payouts, and admin controls
type: feature
---
Tables: couriers, delivery_orders, courier_payouts, entregaai_settings (has platform_fee_percent)
Admin pages: /admin/tabela-frete, /admin/freteiros, /admin/entregas, /admin/financeiro-freteiros
Delivery order created automatically at checkout when customer selects EntregaAí
Formula: platform_fee = freight_value * platform_fee_percent / 100; courier_net = freight_value - platform_fee
Status flow: waiting → accepted → pickup → in_route → delivered (or cancelled)
Daily closing: mark deliveries as paid, creates courier_payout record
