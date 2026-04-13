# Project Memory

## Core
Marketplace multi-loja brasileiro "CompraAi". PT-BR interface. Tailwind semantic tokens only.
Platform fee = 10%. Split payment per store on checkout.
Auth: localStorage mock (AuthContext) + Supabase Cloud for data persistence.
Never edit client.ts, types.ts, .env — auto-generated.
Não alterar layout/estética do projeto.

## Memories
- [Checkout architecture](mem://features/checkout) — Split payment flow, tables, fee calculation
- [DB schema](mem://features/db-schema) — All tables: orders, order_items, payments, payment_splits, payouts, transaction_logs, store_bank_accounts
- [Engagement features](mem://features/engagement) — Favorites, reviews, notifications, popup ads, recent searches
