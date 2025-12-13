# Network Request Failed - Troubleshooting Guide

## Error: "Network request failed"

This error means your app cannot reach the backend server. Follow these steps:

## Step 1: Verify Backend Server is Running

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd MusicOnTheGo/backend
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

3. You should see:
   ```
   ✅ Connected to MongoDB Atlas
   🚀 Server running on port 5050
   ```

4. Test the server in your browser:
   - Open: `http://localhost:5050`
   - You should see: "Welcome to MusicOnTheGo Backend API!"

## Step 2: Check Your API URL Configuration

### For iOS Simulator (Mac):
- ✅ Uses: `http://localhost:5050` (default)
- No configuration needed

### For Android Emulator:
- ✅ Uses: `http://10.0.2.2:5050` (default)
- No configuration needed

### For Physical Device (iPhone/Android):
- ❌ `localhost` won't work!
- You need your computer's IP address

#### Find Your IP Address:

**On Mac:**
```bash
ipconfig getifaddr en0
# or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
# Look for IPv4 Address (usually 192.168.x.x)
```

**On Linux:**
```bash
hostname -I
# or
ip addr show
```

#### Set the API URL:

1. Create or edit `.env` file in `MusicOnTheGo/frontend/`:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:5050
   ```
   
   Example:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.100:5050
   ```

2. **Restart Expo** after changing `.env`:
   ```bash
   # Stop Expo (Ctrl+C)
   # Then restart:
   npx expo start -c
   ```

## Step 3: Verify Network Connection

1. **Both devices must be on the same WiFi network**
   - Your computer and phone must be on the same network
   - Check WiFi settings on both devices

2. **Check Firewall**
   - Make sure your computer's firewall allows connections on port 5050
   - On Mac: System Settings → Network → Firewall
   - On Windows: Windows Defender Firewall

3. **Test Connection**
   - On your phone's browser, try: `http://YOUR_IP:5050`
   - You should see the backend welcome message
   - If not, the server isn't reachable from your phone

## Step 4: Check Backend CORS Configuration

Make sure your backend allows requests from your frontend. Check `MusicOnTheGo/backend/server.js`:

```javascript
app.use(cors()); // This should allow all origins in development
```

## Step 5: Check Console Logs

The app now logs the API URL being used. Check your Expo console for:
```
[API] POST http://localhost:5050/api/uploads/profile-image
```

This will show you:
- What URL is being used
- What method is being called
- The platform (iOS/Android)

## Common Issues & Solutions

### Issue: "Network request failed" on physical device
**Solution:** Set `EXPO_PUBLIC_API_URL` to your computer's IP address (not localhost)

### Issue: Server not reachable from phone
**Solution:** 
1. Check both devices are on same WiFi
2. Check firewall settings
3. Try accessing `http://YOUR_IP:5050` in phone's browser

### Issue: Works on simulator but not physical device
**Solution:** Simulators use `localhost`, physical devices need your IP address

### Issue: Backend shows connection but request fails
**Solution:** Check CORS configuration in `server.js`

## Quick Test

1. **Backend running?** → Visit `http://localhost:5050` in browser
2. **On same network?** → Check WiFi on both devices
3. **Correct IP?** → Check `.env` file has correct IP
4. **Firewall blocking?** → Temporarily disable to test

## Still Not Working?

1. Check the Expo console for the exact URL being used
2. Check the backend console for incoming requests
3. Try using `http://` instead of `https://`
4. Make sure port 5050 is not blocked
5. Try a different port (change in `server.js` and `.env`)

