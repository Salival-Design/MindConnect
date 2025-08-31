export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export async function getTwilioIceServers(): Promise<IceServer[]> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  // If Twilio credentials are not available, return default STUN servers
  if (!accountSid || !authToken) {
    console.warn("Twilio credentials not found, using default STUN servers");
    return [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ];
  }

  try {
    // Create Twilio token for TURN servers
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Tokens.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.ice_servers || [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ];
  } catch (error) {
    console.error("Error getting Twilio ICE servers:", error);
    // Fallback to Google STUN servers
    return [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ];
  }
}
