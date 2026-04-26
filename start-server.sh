#!/bin/bash
cd /home/z/my-project
while true; do
  echo "Starting dev server..."
  bun run dev
  echo "Server died, restarting in 3s..."
  sleep 3
done
