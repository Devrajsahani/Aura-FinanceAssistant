// src/services/fcmSender.js
import { initFirebaseAdmin } from "./firebaseAdmin.js";
import DeviceToken from "../models/DeviceToken.js";

/**
 * payload: object containing title, body, data etc.
 * userId: target userId (string)
 */
export async function sendFCMNotification(userId, payload = {}) {
  const admin = initFirebaseAdmin();

  // fetch tokens for user
  const tokens = await DeviceToken.find({ user: userId, active: true }).lean();

  if (!tokens || tokens.length === 0) {
    console.log("[FCM] no tokens for", userId);
    return { success: 0, failure: 0 };
  }

  const registrationTokens = tokens.map((t) => t.token);

  // Build message objects: using notification + data
  const message = {
    notification: {
      title: payload.title || "AURA Alert",
      body: payload.body || payload.message || "You have a notification",
    },
    data: payload.data || {},
  };

  try {
    // sendMulticast is better for many tokens
    const response = await admin.messaging().sendMulticast({
      tokens: registrationTokens,
      notification: message.notification,
      data: message.data,
    });

    // Clean up invalid tokens
    const failedTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const code = resp.error?.code;
        // typical codes: 'messaging/invalid-registration-token', 'messaging/registration-token-not-registered'
        if (code === "messaging/invalid-registration-token" || code === "messaging/registration-token-not-registered") {
          failedTokens.push(registrationTokens[idx]);
        }
      }
    });

    if (failedTokens.length) {
      await DeviceToken.updateMany({ token: { $in: failedTokens } }, { active: false });
      console.log("[FCM] disabled invalid tokens:", failedTokens.length);
    }

    console.log(`[FCM] sent: success=${response.successCount} failure=${response.failureCount}`);
    return { success: response.successCount, failure: response.failureCount, errors: response.responses };
  } catch (err) {
    console.error("[FCM] send error:", err);
    throw err;
  }
}
