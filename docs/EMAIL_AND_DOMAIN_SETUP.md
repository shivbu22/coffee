# FindCo Production Domain & Email Configuration Guide

This runbook establishes strict compliance for **findco.in** email deliverability, DNS security, and search indexing before public launch.

---

## 1. Email Authentication (SPF, DKIM, DMARC)

To prevent spoofing and guarantee landing in primary inboxes (not Spam) on Gmail and Outlook, configure the following DNS records on your domain registrar or Cloudflare:

### A. SPF Record (Sender Policy Framework)
Define authorized IP ranges for sending outbound platform emails:
* **Type**: `TXT`
* **Name**: `@` (or `findco.in`)
* **Value**:
  ```text
  v=spf1 include:_spf.resend.com include:_spf.google.com ~all
  ```
  *(Replace `_spf.resend.com` with your active transactional SMTP provider: Resend, Postmark, or SendGrid).*

### B. DKIM Records (DomainKeys Identified Mail)
Cryptographic signature verifying that email content has not been tampered with in transit:
* **Type**: `CNAME`
* **Name**: `resend._domainkey` (or selector provided by SMTP provider)
* **Value**: Provided in your transactional mail dashboard (e.g. `dkim.resend.com`).

### C. DMARC Policy (Domain-based Message Authentication)
Strict policy instructing receiving servers to reject unauthorized forged emails:
* **Type**: `TXT`
* **Name**: `_dmarc` (or `_dmarc.findco.in`)
* **Value**:
  ```text
  v=DMARC1; p=reject; rua=mailto:dmarc-reports@findco.in; ruf=mailto:security@findco.in; pct=100; sp=reject; aspf=r; adkim=r
  ```

---

## 2. Pre-Send Deliverability Audit (`mail-tester.com`)

Before sending live booking invitations or OTP notifications:
1. Open [mail-tester.com](https://www.mail-tester.com/) and copy the unique test address (`test-xxxxx@srv1.mail-tester.com`).
2. Trigger a test verification email from FindCo to that address.
3. Click "Then check your score".
4. **Mandatory Acceptance Criteria**: Score must achieve $\ge 9.5 / 10$ before sending real user emails. Ensure:
   - SpamAssassin score < 0.5.
   - Reverse DNS (PTR) configured.
   - Unsubscribe header included in marketing/activity notification emails.

---

## 3. Search Engine Indexing & AI Bot Citability

### A. Google Search Console & Bing Webmaster Verification
Inject site verification tags into `index.html` `<head>`:
```html
<meta name="google-site-verification" content="YOUR_GOOGLE_SEARCH_CONSOLE_CODE" />
<meta name="msvalidate.01" content="YOUR_BING_WEBMASTER_CODE" />
```

### B. IndexNow Instant Search Crawling
Submit new URLs instantly to Bing, Naver, and Seznam:
* API Endpoint: `https://api.indexnow.org/IndexNow`
* Payload:
  ```json
  {
    "host": "findco.in",
    "key": "YOUR_INDEXNOW_KEY",
    "keyLocation": "https://findco.in/YOUR_INDEXNOW_KEY.txt",
    "urlList": [
      "https://findco.in/",
      "https://findco.in/?tab=discover",
      "https://findco.in/?tab=feed"
    ]
  }
  ```

### C. Search Engine Directives (`robots.txt`)
FindCo's `public/robots.txt` already explicitly authorises AI search agents (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`) for maximum brand citability.

