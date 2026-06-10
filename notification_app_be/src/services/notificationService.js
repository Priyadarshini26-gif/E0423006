import axios from "axios";
import env from "../config/env.js";
import { Log } from "../../../logging_middleware/src/logger.js";
 
const TYPE_WEIGHT = {
  Placement: 300,
  Result:    200,
  Event:     100,
};
 

class MinHeap {
  constructor() {
    this.heap = [];
  }
 
  size() {
    return this.heap.length;
  }
 
  peek() {
    return this.heap[0] || null;
  }
 
  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }
 
  pop() {
    const min = this.heap[0];
    const last = this.heap.pop();
 
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
 
    return min;
  }
 
  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
 
      if (this.heap[parentIndex].score <= this.heap[index].score) break;
 
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }
 
  _sinkDown(index) {
    const length = this.heap.length;
 
    while (true) {
      const left  = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;
 
      if (left < length && this.heap[left].score < this.heap[smallest].score) {
        smallest = left;
      }
      if (right < length && this.heap[right].score < this.heap[smallest].score) {
        smallest = right;
      }
      if (smallest === index) break;
 
      [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
      index = smallest;
    }
  }
 
  toSortedArray() {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }
}
 
const computeScore = (notification, minTimestamp, maxTimestamp) => {
  const typeScore = TYPE_WEIGHT[notification.Type] ?? 0;
 
  const range = maxTimestamp - minTimestamp || 1;
  const recencyScore = Math.floor(
    ((new Date(notification.Timestamp).getTime() - minTimestamp) / range) * 99
  );
 
  return typeScore + recencyScore;
};
 
export const fetchNotifications = async () => {
  await Log("backend", "info", "service", "Fetching notifications from test server");
 
  try {
    const response = await axios.get(env.NOTIFICATION_API_URL, {
      headers: {
        Authorization: `Bearer ${env.AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
 
    const notifications = response.data.notifications;
    await Log("backend", "info", "service", `Fetched ${notifications.length} notifications`);
 
    return notifications;
 
  } catch (error) {
    await Log("backend", "error", "service", `Failed to fetch notifications: ${error.message}`);
    throw new Error("Unable to fetch notifications from the test server");
  }
};
 
export const getTopNNotifications = async (n = 10) => {
  await Log("backend", "info", "service", `Computing top ${n} priority notifications`);
 
  const notifications = await fetchNotifications();
 
  if (!notifications.length) {
    await Log("backend", "warn", "service", "No notifications found");
    return [];
  }
 
  const timestamps = notifications.map((n) => new Date(n.Timestamp).getTime());
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
 
  const heap = new MinHeap();
 
  for (const notification of notifications) {
    const score = computeScore(notification, minTimestamp, maxTimestamp);
    const item  = { ...notification, score };
 
    heap.push(item);
 
    if (heap.size() > n) {
      heap.pop();
    }
  }
 
  const topN = heap.toSortedArray();
 
  await Log("backend", "info", "service",
    `Top ${n} notifications computed. Highest score: ${topN[0]?.score}`
  );
 
  return topN;
};