#!/bin/sh
set -e

echo "🔄 Generating Prisma Client..."
pnpm prisma generate

echo "🔄 Pushing database schema..."
pnpm prisma db push --accept-data-loss

echo "⏳ Waiting for Prisma client to be ready..."
sleep 3

echo "🚀 Starting development server..."
exec pnpm dev
