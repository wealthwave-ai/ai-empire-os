# n8n Workflow Import Guide

n8n instance: **https://n8n.srv1623291.hstgr.cloud**

---

## How to Import

1. Open your n8n instance
2. Click **Workflows** in the left sidebar
3. Click **+ Add workflow** → **Import from file**
4. Select the `.json` file
5. Click **Save** after configuring all placeholders (see below)

---

## Workflow 1 — Lead Notification (`lead-notification.json`)

**What it does:** Sends a WhatsApp message via WATI when a new lead submits the form.

**Webhook URL after import:**
```
https://n8n.srv1623291.hstgr.cloud/webhook/lead-notification
```
Set this as `NEXT_PUBLIC_N8N_LEAD_WEBHOOK` in your Vercel env vars and call it from your `/api/razorpay` route after lead creation.

**Placeholders to replace in the node "Send WhatsApp - WATI":**

| Placeholder | Replace with |
|---|---|
| `YOUR_WATI_ENDPOINT` | Your WATI server URL (e.g. `live-mt-server.wati.io`) |
| `YOUR_WATI_API_TOKEN` | API token from WATI Dashboard → API |

**Payload expected from Next.js:**
```json
{ "name": "Amit Sharma", "phone": "919876543210", "email": "amit@example.com" }
```
Phone must include country code without `+` (e.g. `919876543210`).

---

## Workflow 2 — Payment Confirmation (`payment-confirmation.json`)

**What it does:** Listens for Razorpay `payment.captured` webhook and sends a WhatsApp confirmation.

**Webhook URL after import:**
```
https://n8n.srv1623291.hstgr.cloud/webhook/razorpay-webhook
```

**Set this in Razorpay Dashboard:**
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add URL: `https://n8n.srv1623291.hstgr.cloud/webhook/razorpay-webhook`
3. Select event: `payment.captured`
4. Set the same secret as `RAZORPAY_WEBHOOK_SECRET`

**Placeholders to replace in the node "Send WhatsApp - Confirmation":**

| Placeholder | Replace with |
|---|---|
| `YOUR_WATI_ENDPOINT` | Same as Workflow 1 |
| `YOUR_WATI_API_TOKEN` | Same as Workflow 1 |

**Note:** This workflow reads `customer_name` and `customer_phone` from Razorpay's `payload.payment.entity.notes`. These are populated automatically by the `/api/razorpay` route.

---

## Workflow 3 — Daily Auto Post (`auto-posting.json`)

**What it does:** Every day at 9 AM IST, generates a Hindi numerology tip via Claude and posts to Instagram + Facebook.

**Schedule:** `30 3 * * *` (UTC) = 9:00 AM IST

**Placeholders to replace:**

| Node | Placeholder | Replace with |
|---|---|---|
| Claude - Generate Content | `YOUR_ANTHROPIC_API_KEY` | From console.anthropic.com |
| Instagram - Create Media Container | `YOUR_IG_USER_ID` | Instagram Business Account ID |
| Instagram - Create Media Container | `YOUR_STATIC_IMAGE_URL` | Public URL of a branded background image (Instagram requires an image) |
| Instagram - Create Media Container | `YOUR_META_PAGE_ACCESS_TOKEN` | Long-lived Page Access Token from Meta |
| Instagram - Publish Post | `YOUR_IG_USER_ID` | Same as above |
| Instagram - Publish Post | `YOUR_META_PAGE_ACCESS_TOKEN` | Same as above |
| Facebook - Post to Page | `YOUR_FB_PAGE_ID` | Facebook Page ID |
| Facebook - Post to Page | `YOUR_META_PAGE_ACCESS_TOKEN` | Same as above |

**How to get Meta credentials:**
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create an app → Add Instagram Graph API + Pages API products
3. Generate a long-lived Page Access Token (60-day expiry — set a reminder)
4. Find your IG User ID: `GET https://graph.facebook.com/v19.0/me?fields=id,name&access_token=YOUR_TOKEN`

**Important:** Instagram posts require an image. Host a branded numerology-themed background image (1080×1080px) publicly (Cloudinary, S3, or any public URL) and paste it as `YOUR_STATIC_IMAGE_URL`.

---

## After Import Checklist

- [ ] Workflow 1 active → Test by submitting the lead form
- [ ] Workflow 2 active → Test via Razorpay Dashboard → Webhooks → Send test event
- [ ] Workflow 3 active → Test by clicking "Test workflow" manually before activating schedule
- [ ] WATI API token configured in both WhatsApp workflows
- [ ] Meta access token added to auto-posting workflow
- [ ] Razorpay webhook URL updated in Razorpay Dashboard
- [ ] n8n instance is accessible publicly (webhooks won't fire if it's behind a private network)
