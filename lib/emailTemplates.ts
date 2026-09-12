/**
 * Authentic Email Templates for Quarter Spoon Network // Tha Network.
 * Voice: Executive street-smart authenticity, grounded, respectful, cinematic standard.
 * Always signed: "Tha Hogg"
 */

export interface EmailTemplateResult {
  subject: string;
  text: string;
  html: string;
}

export function getThankYouEmailTemplate(recipientName?: string): EmailTemplateResult {
  const nameGreeting = recipientName && recipientName.trim() !== "Quarter Spoon Member" && recipientName.trim() !== "Tha Network VIP"
    ? ` ${recipientName.trim().split(" ")[0]}`
    : "";

  const subject = "Welcome to Tha Network // You're Locked In";

  const text = `Peace${nameGreeting},

Appreciate you locking in with Tha Network.

When we built Quarter Spoon, it wasn't just to put up another website or chase algorithms. It was about creating a dedicated frequency where the visual art, the sound, and the real stories get delivered raw and uncut—the way they were meant to be experienced.

Here is what being on this list means for you:
• First-look access to unreleased Unda Tha Radar films and visual drops before they hit any public feed.
• Direct studio dispatches, session archives, and creative breakdowns you won't find anywhere else.
• Private invitations to screenings, project debuts, and network events.

No spam, no corporate noise. Just authentic work coming straight from the deck.

Keep your notifications on and your eyes open. We are just getting started.

Respect,

Tha Hogg
Quarter Spoon Network // Unda Tha Radar Filmz
Fresno, CA`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#05060A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#E4E4E7;line-height:1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#05060A;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#0A0E1A;border:1px solid #1E293B;border-radius:16px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.85);">
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #0B1A30 0%, #05060A 100%);padding:36px 32px;border-bottom:1px solid #1E293B;text-align:left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display:inline-block;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#38BDF8;font-weight:700;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.3);padding:4px 10px;border-radius:999px;margin-bottom:12px;">
                      OFFICIAL DISPATCH // THA NETWORK
                    </span>
                    <h1 style="margin:0;font-size:24px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:#FFFFFF;">
                      Quarter Spoon <span style="color:#38BDF8;">Network</span>
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 32px;font-size:15px;color:#D4D4D8;">
              <p style="margin:0 0 20px 0;font-size:17px;font-weight:700;color:#FFFFFF;">
                Peace${nameGreeting},
              </p>

              <p style="margin:0 0 18px 0;line-height:1.7;">
                Appreciate you locking in with <strong>Tha Network</strong>.
              </p>

              <p style="margin:0 0 24px 0;line-height:1.7;color:#A1A1AA;">
                When we built Quarter Spoon, it wasn't just to put up another website or chase algorithms. It was about creating a dedicated frequency where the visual art, the sound, and the real stories get delivered raw and uncut—the way they were meant to be experienced.
              </p>

              <!-- Access Highlights Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#06080F;border:1px solid rgba(56,189,248,0.2);border-radius:12px;margin:24px 0;padding:20px;">
                <tr>
                  <td>
                    <span style="display:block;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#FBBF24;font-weight:800;margin-bottom:12px;">
                      WHAT YOU ARE UNLOCKED FOR:
                    </span>
                    <ul style="margin:0;padding-left:20px;color:#E4E4E7;font-size:14px;line-height:1.8;">
                      <li style="margin-bottom:8px;"><strong>First-look access</strong> to unreleased Unda Tha Radar films and visual drops before they hit any public feed.</li>
                      <li style="margin-bottom:8px;"><strong>Direct studio dispatches</strong>, session archives, and creative breakdowns you won't find anywhere else.</li>
                      <li><strong>Private invitations</strong> to upcoming screenings, project debuts, and network events.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px 0;line-height:1.7;color:#A1A1AA;">
                No spam, no corporate noise. Just authentic work coming straight from the deck. Keep your notifications on and your eyes open. We are just getting started.
              </p>

              <!-- Signature -->
              <div style="border-top:1px solid #1E293B;padding-top:24px;margin-top:28px;">
                <p style="margin:0 0 4px 0;font-weight:800;font-size:15px;color:#FFFFFF;">
                  Respect,
                </p>
                <p style="margin:0 0 2px 0;font-weight:900;font-size:18px;color:#38BDF8;letter-spacing:0.5px;">
                  Tha Hogg
                </p>
                <p style="margin:0;font-size:12px;color:#71717A;letter-spacing:1px;text-transform:uppercase;">
                  Quarter Spoon Network &bull; Unda Tha Radar Filmz &bull; Fresno, CA
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#05060A;border-top:1px solid #18181B;padding:20px 32px;text-align:center;font-size:11px;color:#52525B;">
              You received this official broadcast because you subscribed to Tha Network at Quarter Spoon Network.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export function getInviteEmailTemplate(recipientName?: string, portalUrl = "http://localhost:3000"): EmailTemplateResult {
  const nameGreeting = recipientName && recipientName.trim() !== "Quarter Spoon Member"
    ? ` ${recipientName.trim().split(" ")[0]}`
    : "";

  const subject = "You're in the building, now get the full frequency // Tha Network";

  const text = `Peace${nameGreeting},

Noticed you checked in to the Quarter Spoon Network portal recently. Respect for tapping in and exploring the visuals.

Quick word: right now you have access to the studio floor, but you're missing out on what happens behind closed doors. We run a private dispatch list called "Tha Network"—and that's where the real transmission lives.

When you join Tha Network, you get:
• Exclusive visual cuts and unreleased film archives before they go live anywhere else.
• Private updates on upcoming projects from Unda Tha Radar Filmz.
• Direct dispatches and studio game straight from the source.

It takes one click to lock in, zero cost, and no fluff filling up your inbox. If you're going to be in the space, tap into the full frequency.

Lock into Tha Network here:
${portalUrl}?subscribe=tha-network

Catch you on the other side.

Respect,

Tha Hogg
Quarter Spoon Network // Unda Tha Radar Filmz
Fresno, CA`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#05060A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#E4E4E7;line-height:1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#05060A;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#0A0E1A;border:1px solid #1E293B;border-radius:16px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.85);">
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #0B1A30 0%, #05060A 100%);padding:36px 32px;border-bottom:1px solid #1E293B;text-align:left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display:inline-block;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#FBBF24;font-weight:700;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.3);padding:4px 10px;border-radius:999px;margin-bottom:12px;">
                      PRIVATE INVITATION // THE INNER FREQUENCY
                    </span>
                    <h1 style="margin:0;font-size:24px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:#FFFFFF;">
                      Quarter Spoon <span style="color:#38BDF8;">Network</span>
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 32px;font-size:15px;color:#D4D4D8;">
              <p style="margin:0 0 20px 0;font-size:17px;font-weight:700;color:#FFFFFF;">
                Peace${nameGreeting},
              </p>

              <p style="margin:0 0 18px 0;line-height:1.7;">
                Noticed you checked in to the Quarter Spoon Network portal recently. Respect for tapping in and exploring the visuals.
              </p>

              <p style="margin:0 0 24px 0;line-height:1.7;color:#A1A1AA;">
                Quick word: right now you have access to the studio floor, but you're missing out on what happens behind closed doors. We run a private dispatch list called <strong>&ldquo;Tha Network&rdquo;</strong>—and that's where the real transmission lives.
              </p>

              <!-- Benefits Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#06080F;border:1px solid rgba(251,191,36,0.25);border-radius:12px;margin:24px 0;padding:20px;">
                <tr>
                  <td>
                    <span style="display:block;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#38BDF8;font-weight:800;margin-bottom:12px;">
                      WHY YOU WANT IN:
                    </span>
                    <ul style="margin:0;padding-left:20px;color:#E4E4E7;font-size:14px;line-height:1.8;">
                      <li style="margin-bottom:8px;"><strong>Exclusive visual cuts</strong> and unreleased film archives before they go live anywhere else.</li>
                      <li style="margin-bottom:8px;"><strong>Private updates</strong> on upcoming productions from Unda Tha Radar Filmz.</li>
                      <li><strong>Direct dispatches</strong> and studio game straight from the source.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px 0;line-height:1.7;color:#A1A1AA;">
                It takes one click to lock in, zero cost, and no fluff filling up your inbox. If you're going to be in the space, tap into the full frequency.
              </p>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:28px 0;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}?subscribe=tha-network" style="display:inline-block;background-color:#0284C7;color:#FFFFFF;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:2px;text-decoration:none;padding:16px 36px;border-radius:10px;box-shadow:0 10px 25px -5px rgba(2,132,199,0.5);border:1px solid rgba(56,189,248,0.4);">
                      Join Tha Network &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px 0;line-height:1.7;color:#71717A;text-align:center;font-size:12px;">
                Catch you on the other side.
              </p>

              <!-- Signature -->
              <div style="border-top:1px solid #1E293B;padding-top:24px;margin-top:28px;">
                <p style="margin:0 0 4px 0;font-weight:800;font-size:15px;color:#FFFFFF;">
                  Respect,
                </p>
                <p style="margin:0 0 2px 0;font-weight:900;font-size:18px;color:#FBBF24;letter-spacing:0.5px;">
                  Tha Hogg
                </p>
                <p style="margin:0;font-size:12px;color:#71717A;letter-spacing:1px;text-transform:uppercase;">
                  Quarter Spoon Network &bull; Unda Tha Radar Filmz &bull; Fresno, CA
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#05060A;border-top:1px solid #18181B;padding:20px 32px;text-align:center;font-size:11px;color:#52525B;">
              Sent to active members of Quarter Spoon Network.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export function getDigitalWorkflowAnnouncementTemplate(
  recipientName?: string,
  portalUrl = "http://localhost:3000"
): EmailTemplateResult {
  const nameGreeting =
    recipientName &&
    recipientName.trim() !== "Quarter Spoon Member" &&
    recipientName.trim() !== "Tha Network VIP"
      ? ` ${recipientName.trim().split(" ")[0]}`
      : "";

  const subject = "Exclusive Creator Drop: Digital Workflow Vault is Live // Tha Network";

  const text = `Peace${nameGreeting},

First off, appreciate you taking the time to lock in with Tha Network. As a genuine thank you for your support, I just opened up a brand new private sector on the platform built strictly for digital creators:

>> "DIGITAL WORKFLOW" (Subscriber Exclusive Vault)

Inside, you will find "Tha Prompt Zone"—loaded with master-grade T2I (Text-To-Image) and I2V (Image-To-Video) prompt templates:
• The Plug-And-Play Production Suite (Vol. 1): 10 cinematic scene blueprints ready to swap and render.
• Monster Master Set: 6-second timeline JSON architecture fused with Arri RAW 6.5K, ACEScg color, and Unreal Engine path-traced optics.

Both are available for instant 1-click download right to your device.

AND HERE IS THE DEAL:
Every single month, I will be dropping a brand new bundle of prompts and creator tools into the Digital Workflow vault for you to use on your own productions. No extra cost, no games. Just real tools for real creators.

Want a specific look, lighting setup, or cinematic genre? Check out "Tha Suggestion Box" inside the vault and tell me what you want built next.

Unlock your blueprints here:
${portalUrl}/digital-workflow

Respect,

Tha Hogg
Quarter Spoon Network // Unda Tha Radar Filmz
Fresno, CA`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#05060A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#E4E4E7;line-height:1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#05060A;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#0A0E1A;border:1px solid #1E293B;border-radius:16px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.85);">
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #0B1A30 0%, #05060A 100%);padding:36px 32px;border-bottom:1px solid #1E293B;text-align:left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display:inline-block;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#FBBF24;font-weight:800;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.3);padding:4px 10px;border-radius:999px;margin-bottom:12px;">
                      SUBSCRIBER EXCLUSIVE // CREATOR TOOLKIT
                    </span>
                    <h1 style="margin:0;font-size:24px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:#FFFFFF;">
                      Digital <span style="color:#38BDF8;">Workflow</span>
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 32px;font-size:15px;color:#D4D4D8;">
              <p style="margin:0 0 20px 0;font-size:17px;font-weight:700;color:#FFFFFF;">
                Peace${nameGreeting},
              </p>

              <p style="margin:0 0 18px 0;line-height:1.7;">
                First off, appreciate you taking the time to lock in with <strong>Tha Network</strong>. As a genuine thank you for your support, I just opened up a brand new private sector on the platform built strictly for digital creators:
              </p>

              <!-- Announcement Banner -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#06080F;border:1px solid rgba(56,189,248,0.25);border-radius:12px;margin:24px 0;padding:22px;">
                <tr>
                  <td>
                    <span style="display:block;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#38BDF8;font-weight:800;margin-bottom:8px;">
                      VAULT ACCESS UNLOCKED:
                    </span>
                    <h3 style="margin:0 0 12px 0;font-size:18px;color:#FFFFFF;text-transform:uppercase;font-weight:900;">
                      Tha Prompt Zone (T2I & I2V Blueprints)
                    </h3>
                    <ul style="margin:0;padding-left:20px;color:#E4E4E7;font-size:14px;line-height:1.8;">
                      <li style="margin-bottom:8px;"><strong>The Plug-And-Play Production Suite (Vol. 1):</strong> 10 master cinematic templates pre-baked with camera optics, lighting stacks, and 6s I2V JSON timelines.</li>
                      <li><strong>Monster Master Set:</strong> Forensic-grade T2I & I2V architecture with Arri Alexa 65 LF, ACEScg color, and Unreal Engine path-traced rendering.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Monthly Promise Banner -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#161B26;border-left:4px solid #FBBF24;border-radius:6px;margin:24px 0;padding:16px 20px;">
                <tr>
                  <td>
                    <span style="display:block;font-size:12px;font-weight:800;color:#FBBF24;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">
                      MONTHLY PROMPT BUNDLE COMMITMENT
                    </span>
                    <p style="margin:0;font-size:13px;color:#E4E4E7;line-height:1.6;">
                      Every single month, I will be dropping a brand new bundle of prompts and creator blueprints into the vault for you to use on your own visual productions.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px 0;line-height:1.7;color:#A1A1AA;">
                Got a specific vibe or scene you need crafted? Check out <strong>Tha Suggestion Box</strong> inside the vault and tell me what you want built next.
              </p>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:28px 0;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}/digital-workflow" style="display:inline-block;background-color:#0284C7;color:#FFFFFF;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:2px;text-decoration:none;padding:16px 36px;border-radius:10px;box-shadow:0 10px 25px -5px rgba(2,132,199,0.5);border:1px solid rgba(56,189,248,0.4);">
                      Access Digital Workflow &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <div style="border-top:1px solid #1E293B;padding-top:24px;margin-top:28px;">
                <p style="margin:0 0 4px 0;font-weight:800;font-size:15px;color:#FFFFFF;">
                  Respect,
                </p>
                <p style="margin:0 0 2px 0;font-weight:900;font-size:18px;color:#38BDF8;letter-spacing:0.5px;">
                  Tha Hogg
                </p>
                <p style="margin:0;font-size:12px;color:#71717A;letter-spacing:1px;text-transform:uppercase;">
                  Quarter Spoon Network &bull; Unda Tha Radar Filmz &bull; Fresno, CA
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#05060A;border-top:1px solid #18181B;padding:20px 32px;text-align:center;font-size:11px;color:#52525B;">
              Sent to active subscribers of Tha Network.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
