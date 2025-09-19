import Redis from "ioredis";

const redis = new (Redis as any)();

export default redis;
