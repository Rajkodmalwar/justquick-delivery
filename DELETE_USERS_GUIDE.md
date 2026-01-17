# 🗑️ Delete Users Guide

## How to Delete Users from Database

I've created an API endpoint to delete users. Here are different ways to use it:

---

## Method 1: Using Browser DevTools Console

### Step 1: Open DevTools
```
Press: F12
Go to: Console tab
```

### Step 2: Run Delete Command
```javascript
// Replace USER_ID with the actual user ID from Supabase
const userId = "user-id-from-supabase"; // e.g., "f47ac10b-58cc-4372-a567-0e02b2c3d479"

fetch(`/api/admin/users/${userId}/delete`, {
  method: 'DELETE'
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err))
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "User [ID] deleted successfully"
}
```

**Expected Error Response:**
```json
{
  "error": "Failed to delete user"
}
```

---

## Method 2: Using Curl (Terminal)

```bash
curl -X DELETE \
  https://hyperlocal-delivery-app.vercel.app/api/admin/users/USER_ID/delete
```

Replace `USER_ID` with actual ID.

---

## Method 3: Using Postman

1. Open Postman
2. Create new request
3. Set method to: **DELETE**
4. Set URL to:
   ```
   https://hyperlocal-delivery-app.vercel.app/api/admin/users/USER_ID/delete
   ```
5. Click **Send**

---

## How to Get User ID from Supabase

### Step 1: Open Supabase Console
```
Go to: https://app.supabase.com
Click your project
```

### Step 2: Go to Auth Users
```
Left sidebar: Authentication
Click: Users
```

### Step 3: Find the User
```
Look for user email in the list
Click on the user row
Copy the User ID (long alphanumeric string)
```

### Step 3 Alternative: Check Supabase Logs
```
Left sidebar: Authentication
Click: Logs
Look for the user's email
Find the user ID associated with it
```

---

## ✅ Example

```javascript
// Delete user with ID: f47ac10b-58cc-4372-a567-0e02b2c3d479

fetch('/api/admin/users/f47ac10b-58cc-4372-a567-0e02b2c3d479/delete', {
  method: 'DELETE'
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log("✅ User deleted:", data.message)
  } else {
    console.error("❌ Error:", data.error)
  }
})
.catch(err => console.error("❌ Request failed:", err))
```

---

## ⚠️ Important Notes

1. **No Confirmation:** Deleting a user is immediate and cannot be undone
2. **Cascading Delete:** User account and related data are removed from Supabase
3. **Requires Valid User ID:** Must use exact ID from Supabase Auth Users
4. **Admin Access:** Endpoint uses server-side admin credentials

---

## 🔍 Verify User was Deleted

### In Supabase Dashboard
```
1. Go to: https://app.supabase.com
2. Click your project
3. Authentication → Users
4. Search for the user email
5. Should NOT appear in the list (means deleted)
```

### Using API
```javascript
// After deleting, try to get the session for that user
fetch('/auth/callback?code=...')
// Should fail or redirect to login
```

---

## Bulk Delete Multiple Users

```javascript
// Delete multiple users in sequence
const userIds = [
  "id1-here",
  "id2-here",
  "id3-here"
];

async function deleteMultipleUsers() {
  for (const userId of userIds) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/delete`, {
        method: 'DELETE'
      });
      const data = await res.json();
      console.log(`User ${userId}:`, data);
    } catch (err) {
      console.error(`Failed to delete ${userId}:`, err);
    }
  }
}

deleteMultipleUsers();
```

---

## ❌ Common Errors

### Error: "User ID is required"
```
Cause: No ID provided in URL
Fix: Make sure URL is: /api/admin/users/[ACTUAL-USER-ID]/delete
```

### Error: "Failed to delete user"
```
Cause: Invalid User ID or user doesn't exist
Fix:
  1. Verify ID is correct from Supabase
  2. Check if user still exists in Supabase
  3. Make sure ID is in correct format (UUID)
```

### Error: "Internal server error"
```
Cause: Server-side issue or missing environment variables
Fix:
  1. Check that SUPABASE_SERVICE_ROLE_KEY is set in Vercel
  2. Wait 1 minute and try again
  3. Check Vercel logs for errors
```

---

## 🔐 Security

The endpoint uses `SUPABASE_SERVICE_ROLE_KEY` which is:
- ✅ Never exposed to client-side
- ✅ Only available on server
- ✅ Required for admin operations
- ✅ Protected by Supabase RLS policies

---

## Alternative: Delete via Supabase Dashboard

If you prefer not to use the API:

```
1. Go to: https://app.supabase.com
2. Click your project
3. Authentication → Users
4. Click on the user
5. Click "Delete User" button
6. Confirm deletion
```

---

## Testing Locally

If testing on localhost:

```javascript
// Localhost
fetch('/api/admin/users/USER_ID/delete', {
  method: 'DELETE'
})

// Production
fetch('https://hyperlocal-delivery-app.vercel.app/api/admin/users/USER_ID/delete', {
  method: 'DELETE'
})
```

---

**Summary:**
- Use DELETE `/api/admin/users/[id]/delete` to delete users
- Get user ID from Supabase Authentication → Users
- Works on both localhost and production
- Verify deletion in Supabase console
