# Authentication Guide

This guide explains how to use the Authentication module in dhan-ts to authenticate users and manage static IPs.

## Table of Contents

- [Overview](#overview)
- [App-Based Authentication (Individual Traders)](#app-based-authentication-individual-traders)
- [Partner Authentication](#partner-authentication)
- [Static IP Management](#static-ip-management)
- [User Profile](#user-profile)

## Overview

The Dhan API supports multiple authentication methods:

1. **Direct Access Token** - Generate token directly from web.dhan.co (valid for 24 hours)
2. **App-Based Authentication** - OAuth-based flow for individual traders using API key & secret
3. **Partner Authentication** - For platforms building on top of Dhan APIs

The `Authentication` module in dhan-ts provides methods for the OAuth-based flows (methods 2 and 3).

## App-Based Authentication (Individual Traders)

Individual traders can use the OAuth-based authentication flow to generate access tokens programmatically.

### Prerequisites

1. Login to [web.dhan.co](https://web.dhan.co)
2. Navigate to My Profile → Access DhanHQ APIs
3. Toggle to 'API key' and enter your app details:
   - App name
   - Redirect URL (where users will be redirected after login)
   - Postback URL (optional)
4. Save your API Key and API Secret

### Authentication Flow

The app-based authentication requires 3 steps:

#### Step 1: Generate Consent

Generate a consent session to initiate the login process.

```typescript
import { DhanHqClient, DhanEnv } from 'dhan-ts';

// Initialize client (can use a dummy access token for auth endpoints)
const client = new DhanHqClient({
  accessToken: 'temp',
  env: DhanEnv.PROD,
  clientId: 'temp'
});

const apiKey = 'your-api-key';
const apiSecret = 'your-api-secret';
const dhanClientId = 'your-dhan-client-id';

// Step 1: Generate consent
const consentResponse = await client.authentication.generateConsentApp(
  apiKey,
  apiSecret,
  dhanClientId
);

console.log('Consent App ID:', consentResponse.consentAppId);
console.log('Status:', consentResponse.consentAppStatus);
```

**Response:**
```json
{
  "consentAppId": "940b0ca1-3ff4-4476-b46e-03a3ce7dc55d",
  "consentAppStatus": "GENERATED",
  "status": "success"
}
```

#### Step 2: Browser-Based Login

Redirect the user to the Dhan login page:

```typescript
const consentAppId = consentResponse.consentAppId;
const loginUrl = `https://auth.dhan.co/login/consentApp-login?consentAppId=${consentAppId}`;

// Redirect user to this URL
// After successful login, user will be redirected to your redirect URL with tokenId
// Example: https://your-redirect-url.com/?tokenId=abc123xyz
```

The user will:
1. Enter Dhan credentials
2. Complete 2FA (OTP/PIN/Password or TOTP)
3. Be redirected to your URL with `tokenId` in the query parameters

#### Step 3: Consume Consent (Get Access Token)

Use the `tokenId` from the redirect to get the access token:

```typescript
const tokenId = 'token-from-redirect-url';

const authResponse = await client.authentication.consumeConsentApp(
  apiKey,
  apiSecret,
  tokenId
);

console.log('Access Token:', authResponse.accessToken);
console.log('Expiry Time:', authResponse.expiryTime);
console.log('Client Name:', authResponse.dhanClientName);
```

**Response:**
```json
{
  "dhanClientId": "1000000001",
  "dhanClientName": "JOHN DOE",
  "dhanClientUcc": "CEFE4265",
  "givenPowerOfAttorney": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiryTime": "2025-09-23T12:37:23"
}
```

Now you can use the `accessToken` to create a new DhanHqClient:

```typescript
const authenticatedClient = new DhanHqClient({
  accessToken: authResponse.accessToken,
  env: DhanEnv.PROD,
  clientId: authResponse.dhanClientId
});

// Use the client for trading
const orders = await authenticatedClient.orders.getOrders();
```

### Complete Example

```typescript
import { DhanHqClient, DhanEnv } from 'dhan-ts';

async function authenticateUser() {
  const client = new DhanHqClient({
    accessToken: 'temp',
    env: DhanEnv.PROD,
    clientId: 'temp'
  });

  const apiKey = process.env.DHAN_API_KEY!;
  const apiSecret = process.env.DHAN_API_SECRET!;
  const dhanClientId = process.env.DHAN_CLIENT_ID!;

  try {
    // Step 1: Generate consent
    const consent = await client.authentication.generateConsentApp(
      apiKey,
      apiSecret,
      dhanClientId
    );

    // Step 2: Redirect user (in a web app, you would redirect here)
    const loginUrl = `https://auth.dhan.co/login/consentApp-login?consentAppId=${consent.consentAppId}`;
    console.log('Redirect user to:', loginUrl);

    // Step 3: After getting tokenId from redirect, consume consent
    // const tokenId = 'get-from-redirect-url';
    // const auth = await client.authentication.consumeConsentApp(
    //   apiKey,
    //   apiSecret,
    //   tokenId
    // );
    //
    // return auth.accessToken;
  } catch (error) {
    console.error('Authentication failed:', error);
    throw error;
  }
}
```

## Partner Authentication

Partners (platforms building on Dhan APIs) can use this flow to authenticate their users.

### Prerequisites

1. Receive `partner_id` and `partner_secret` from Dhan
2. Provide redirect URL to Dhan team

### Authentication Flow

#### Step 1: Generate Consent

```typescript
import { DhanHqClient, DhanEnv } from 'dhan-ts';

const client = new DhanHqClient({
  accessToken: 'temp',
  env: DhanEnv.PROD,
  clientId: 'temp'
});

const partnerId = process.env.PARTNER_ID!;
const partnerSecret = process.env.PARTNER_SECRET!;

// Generate consent
const consentResponse = await client.authentication.generateConsentPartner(
  partnerId,
  partnerSecret
);

console.log('Consent ID:', consentResponse.consentId);
```

**Response:**
```json
{
  "consentId": "ab5aaab6-38cb-41fc-a074-c816e2f9a3e0",
  "consentStatus": "GENERATED"
}
```

#### Step 2: Browser-Based Login

Redirect the user to Dhan login:

```typescript
const consentId = consentResponse.consentId;
const loginUrl = `https://auth.dhan.co/consent-login?consentId=${consentId}`;

// Open this URL in browser or webview
// User will be redirected to your URL with tokenId after successful login
```

#### Step 3: Consume Consent

```typescript
const tokenId = 'token-from-redirect';

const authResponse = await client.authentication.consumeConsentPartner(
  partnerId,
  partnerSecret,
  tokenId
);

console.log('Access Token:', authResponse.accessToken);
console.log('User:', authResponse.dhanClientName);
```

**Response:**
```json
{
  "dhanClientId": "1000000001",
  "dhanClientName": "JOHN DOE",
  "dhanClientUcc": "CEFE4265",
  "givenPowerOfAttorney": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiryTime": "2025-09-23T12:37:23"
}
```

## Static IP Management

Static IP whitelisting is mandatory for order placement APIs as per SEBI guidelines.

### Set IP Address

Set a primary or secondary static IP for your account. Once set, it cannot be modified for 7 days.

```typescript
import { DhanHqClient, DhanEnv, IPFlag } from 'dhan-ts';

const client = new DhanHqClient({
  accessToken: 'your-access-token',
  env: DhanEnv.PROD,
  clientId: 'your-client-id'
});

// Set primary IP
const response = await client.authentication.setIP({
  dhanClientId: 'your-client-id',
  ip: '10.200.10.10',
  ipFlag: IPFlag.PRIMARY
});

console.log(response.message); // "IP saved successfully"
```

### Modify IP Address

Modify an existing IP (only allowed after 7 days from last modification).

```typescript
// Modify primary IP
const response = await client.authentication.modifyIP({
  dhanClientId: 'your-client-id',
  ip: '10.200.20.20',
  ipFlag: IPFlag.PRIMARY
});

console.log(response.status); // "SUCCESS"
```

### Get Current IP Settings

Retrieve currently set IPs and their modification dates.

```typescript
const ipInfo = await client.authentication.getIP();

console.log('Primary IP:', ipInfo.primaryIP);
console.log('Can modify primary from:', ipInfo.modifyDatePrimary);
console.log('Secondary IP:', ipInfo.secondaryIP);
console.log('Can modify secondary from:', ipInfo.modifyDateSecondary);
```

**Response:**
```json
{
  "modifyDateSecondary": "2025-09-30",
  "secondaryIP": "10.420.43.12",
  "modifyDatePrimary": "2025-09-28",
  "primaryIP": "10.420.29.14"
}
```

### IP Management Best Practices

1. **Set both Primary and Secondary IPs** for redundancy
2. **Static IP is required only for order placement** - data APIs don't need IP whitelisting
3. **Plan ahead** - IPs cannot be changed for 7 days
4. **Use IPv4 or IPv6** - both formats are supported
5. **Each user needs unique IP** - cannot share IPs across accounts

## User Profile

Check access token validity and account status.

### Get User Profile

```typescript
const profile = await client.authentication.getUserProfile();

console.log('Client ID:', profile.dhanClientId);
console.log('Token Valid Until:', profile.tokenValidity);
console.log('Active Segments:', profile.activeSegment);
console.log('DDPI Status:', profile.ddpi);
console.log('Data Plan:', profile.dataPlan);
console.log('Data Plan Valid Until:', profile.dataValidity);
```

**Response:**
```json
{
  "dhanClientId": "1100003626",
  "tokenValidity": "30/03/2025 15:37",
  "activeSegment": "Equity, Derivative, Currency, Commodity",
  "ddpi": "Active",
  "mtf": "Active",
  "dataPlan": "Active",
  "dataValidity": "2024-12-05 09:37:52.0"
}
```

### Use Cases

1. **Token Validation** - Check if access token is still valid before making API calls
2. **Account Setup Check** - Verify DDPI and other account features
3. **Health Check** - Use as a test endpoint to verify API connectivity

## TOTP Setup

You can setup Time-based One-Time Password (TOTP) as an alternative to OTP for API authentication.

### How to Enable TOTP

1. Go to [web.dhan.co](https://web.dhan.co) → DhanHQ Trading APIs
2. Select "Setup TOTP"
3. Confirm with OTP on mobile/email
4. Scan QR code with an Authenticator app (Google Authenticator, Authy, etc.)
5. Enter the first TOTP to confirm

Once enabled, TOTP will be available as an option during the browser login step in both app-based and partner authentication flows.

## Error Handling

Always wrap authentication calls in try-catch blocks:

```typescript
try {
  const auth = await client.authentication.consumeConsentApp(
    apiKey,
    apiSecret,
    tokenId
  );

  // Success - use auth.accessToken
} catch (error) {
  if (error.response) {
    console.error('API Error:', error.response.data);
    console.error('Status:', error.response.status);
  } else {
    console.error('Network Error:', error.message);
  }
}
```

## Notes & Limitations

1. **API Key & Secret Validity**: Valid for 12 months from generation date
2. **Access Token Validity**: Check `expiryTime` in the response
3. **Consent Sessions**: You can generate multiple `consentAppId`/`consentId`, but only one active token per user
4. **Rate Limits**: Follow Dhan's API rate limits
5. **Security**: Never expose API keys/secrets in client-side code

## Support

For issues or questions:
- GitHub: [dhan-ts issues](https://github.com/anshuopinion/dhan-ts/issues)
- Dhan Support: Contact through Dhan platform

## References

- [Dhan Authentication Documentation](../Authentication.md)
- [Dhan API Documentation](https://dhanhq.co/docs)
