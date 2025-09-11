import { http } from "./http";

export const EventsAPI = {
  list: () => http.get("/events").then(r => r.data),
  clear: () => http.delete("/events").then(r => r.data),

  sendRebalance: (payload) => http.post("/integrations/n8n/rebalance", payload).then(r => r.data),
  sendGamification: (payload) => http.post("/integrations/n8n/gamification", payload).then(r => r.data),
  sendAlert: (payload) => http.post("/integrations/n8n/alert", payload).then(r => r.data),
  mockCheckout: (plan) => http.post("/billing/webhook/mock", { type:"checkout.session.completed", data:{ plan } }).then(r=>r.data)
};
