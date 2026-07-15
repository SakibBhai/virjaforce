#!/bin/bash
cd /home/z/my-project
# Start dev server and keep it alive
bun run dev &
DEV_PID=$!
echo "Dev PID: $DEV_PID"

# Keep alive by pinging every 10 seconds
while true; do
  sleep 10
  if ! kill -0 $DEV_PID 2>/dev/null; then
    echo "Server died, restarting..."
    bun run dev &
    DEV_PID=$!
    echo "New Dev PID: $DEV_PID"
  fi
  # Also ping the server to keep it warm
  curl -s -o /dev/null http://localhost:3000/ 2>/dev/null &
done
