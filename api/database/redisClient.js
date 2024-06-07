import Redis from "ioredis";

const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

let hasError = false;

redis.on("connect", () => {
  hasError = false; // Reset error when reconnection
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  if (!hasError) {
    hasError = true;
    console.error("Redis connection error:", err);
    redis.quit();
  }
});

export default redis;
