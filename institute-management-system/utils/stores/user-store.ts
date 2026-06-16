import { getStaffByTokenService } from "@/service/user/user.service";
import { StaffModel } from "@/model/user/staff/staff.respond.model";

// Module-level singleton — shared across all components, no provider needed
let user: StaffModel | undefined = undefined;
let fetchStarted = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeUser(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCurrentUser(): StaffModel | undefined {
  return user;
}

export function loadUser(): void {
  if (fetchStarted) return;
  fetchStarted = true;
  getStaffByTokenService()
    .then((response) => {
      user = response;
      notify();
    })
    .catch(() => {
      fetchStarted = false; // allow retry on error
    });
}
