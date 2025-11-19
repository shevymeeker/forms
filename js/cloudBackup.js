/**
 * Cloud Backup Manager
 * Handles backup to user's personal cloud storage (Google Drive, Dropbox, iCloud)
 * NO data is sent to OUR servers - user's data stays in THEIR cloud
 */

class CloudBackup {
  constructor() {
    this.providers = {
      googleDrive: {
        clientId: null, // User must configure their own OAuth app
        connected: false,
        accessToken: null
      },
      dropbox: {
        clientId: null,
        connected: false,
        accessToken: null
      },
      icloud: {
        connected: false // Uses Web Share API / File System Access API
      }
    };

    this.loadSavedTokens();
  }

  /**
   * Load saved OAuth tokens from localStorage (not IndexedDB for security)
   */
  loadSavedTokens() {
    try {
      const saved = localStorage.getItem('cloudBackupTokens');
      if (saved) {
        const tokens = JSON.parse(saved);
        if (tokens.googleDrive) {
          this.providers.googleDrive.accessToken = tokens.googleDrive;
          this.providers.googleDrive.connected = true;
        }
        if (tokens.dropbox) {
          this.providers.dropbox.accessToken = tokens.dropbox;
          this.providers.dropbox.connected = true;
        }
      }
    } catch (error) {
      console.error('[CloudBackup] Failed to load tokens:', error);
    }
  }

  /**
   * Save OAuth tokens
   */
  saveTokens() {
    try {
      const tokens = {
        googleDrive: this.providers.googleDrive.accessToken,
        dropbox: this.providers.dropbox.accessToken
      };
      localStorage.setItem('cloudBackupTokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('[CloudBackup] Failed to save tokens:', error);
    }
  }

  /**
   * Configure Google Drive (user must provide their own Client ID)
   */
  configureGoogleDrive(clientId) {
    this.providers.googleDrive.clientId = clientId;
    localStorage.setItem('gdrive_client_id', clientId);
  }

  /**
   * Configure Dropbox (user must provide their own App Key)
   */
  configureDropbox(appKey) {
    this.providers.dropbox.clientId = appKey;
    localStorage.setItem('dropbox_app_key', appKey);
  }

  /**
   * Connect to Google Drive
   */
  async connectGoogleDrive() {
    const clientId = this.providers.googleDrive.clientId || localStorage.getItem('gdrive_client_id');

    if (!clientId) {
      throw new Error('Google Drive Client ID not configured');
    }

    try {
      // Using OAuth 2.0 Implicit Flow
      const redirectUri = window.location.origin + window.location.pathname;
      const scope = 'https://www.googleapis.com/auth/drive.file';

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent(scope)}`;

      // Open auth popup
      const width = 600;
      const height = 600;
      const left = (screen.width / 2) - (width / 2);
      const top = (screen.height / 2) - (height / 2);

      const popup = window.open(
        authUrl,
        'Google Drive Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for OAuth callback
      return new Promise((resolve, reject) => {
        const checkPopup = setInterval(() => {
          try {
            if (popup.closed) {
              clearInterval(checkPopup);
              reject(new Error('Authorization cancelled'));
              return;
            }

            // Check if we got redirected back with access token
            const hash = popup.location.hash;
            if (hash && hash.includes('access_token')) {
              const params = new URLSearchParams(hash.substring(1));
              const accessToken = params.get('access_token');

              if (accessToken) {
                this.providers.googleDrive.accessToken = accessToken;
                this.providers.googleDrive.connected = true;
                this.saveTokens();
                popup.close();
                clearInterval(checkPopup);
                resolve(true);
              }
            }
          } catch (e) {
            // Cross-origin error - ignore until redirect happens
          }
        }, 500);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkPopup);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error('Authorization timeout'));
        }, 300000);
      });
    } catch (error) {
      console.error('[CloudBackup] Google Drive connection failed:', error);
      throw error;
    }
  }

  /**
   * Connect to Dropbox
   */
  async connectDropbox() {
    const appKey = this.providers.dropbox.clientId || localStorage.getItem('dropbox_app_key');

    if (!appKey) {
      throw new Error('Dropbox App Key not configured');
    }

    try {
      const redirectUri = window.location.origin + window.location.pathname;

      const authUrl = `https://www.dropbox.com/oauth2/authorize?` +
        `client_id=${encodeURIComponent(appKey)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token`;

      // Open auth popup
      const width = 600;
      const height = 600;
      const left = (screen.width / 2) - (width / 2);
      const top = (screen.height / 2) - (height / 2);

      const popup = window.open(
        authUrl,
        'Dropbox Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for OAuth callback
      return new Promise((resolve, reject) => {
        const checkPopup = setInterval(() => {
          try {
            if (popup.closed) {
              clearInterval(checkPopup);
              reject(new Error('Authorization cancelled'));
              return;
            }

            const hash = popup.location.hash;
            if (hash && hash.includes('access_token')) {
              const params = new URLSearchParams(hash.substring(1));
              const accessToken = params.get('access_token');

              if (accessToken) {
                this.providers.dropbox.accessToken = accessToken;
                this.providers.dropbox.connected = true;
                this.saveTokens();
                popup.close();
                clearInterval(checkPopup);
                resolve(true);
              }
            }
          } catch (e) {
            // Cross-origin error - ignore
          }
        }, 500);

        setTimeout(() => {
          clearInterval(checkPopup);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error('Authorization timeout'));
        }, 300000);
      });
    } catch (error) {
      console.error('[CloudBackup] Dropbox connection failed:', error);
      throw error;
    }
  }

  /**
   * Backup to Google Drive
   */
  async backupToGoogleDrive(data, filename = 'form-builder-backup.json') {
    if (!this.providers.googleDrive.connected) {
      throw new Error('Google Drive not connected');
    }

    try {
      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const closeDelimiter = "\r\n--" + boundary + "--";

      const metadata = {
        name: filename,
        mimeType: 'application/json'
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(data, null, 2) +
        closeDelimiter;

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.providers.googleDrive.accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      });

      if (!response.ok) {
        throw new Error(`Google Drive upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[CloudBackup] Backed up to Google Drive:', result.id);

      await window.DB.logEvent('cloud_backup', { provider: 'googleDrive', fileId: result.id });
      return result;
    } catch (error) {
      console.error('[CloudBackup] Google Drive backup failed:', error);
      throw error;
    }
  }

  /**
   * Backup to Dropbox
   */
  async backupToDropbox(data, filename = 'form-builder-backup.json') {
    if (!this.providers.dropbox.connected) {
      throw new Error('Dropbox not connected');
    }

    try {
      const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.providers.dropbox.accessToken}`,
          'Dropbox-API-Arg': JSON.stringify({
            path: `/${filename}`,
            mode: 'overwrite',
            autorename: true
          }),
          'Content-Type': 'application/octet-stream'
        },
        body: JSON.stringify(data, null, 2)
      });

      if (!response.ok) {
        throw new Error(`Dropbox upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[CloudBackup] Backed up to Dropbox:', result.path_display);

      await window.DB.logEvent('cloud_backup', { provider: 'dropbox', path: result.path_display });
      return result;
    } catch (error) {
      console.error('[CloudBackup] Dropbox backup failed:', error);
      throw error;
    }
  }

  /**
   * Backup to iCloud (using File System Access API / Web Share API)
   */
  async backupToICloud(data, filename = 'form-builder-backup.json') {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Try File System Access API first (Chrome/Edge)
      if ('showSaveFilePicker' in window) {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'JSON Backup',
            accept: { 'application/json': ['.json'] }
          }]
        });

        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();

        console.log('[CloudBackup] Saved via File System Access API');
        await window.DB.logEvent('cloud_backup', { provider: 'filesystem', filename });
        return { success: true, method: 'filesystem' };
      }

      // Fallback to download (iOS Safari will offer "Save to Files" which includes iCloud)
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      console.log('[CloudBackup] Saved via download (iOS will offer iCloud)');
      await window.DB.logEvent('cloud_backup', { provider: 'download', filename });
      return { success: true, method: 'download' };
    } catch (error) {
      console.error('[CloudBackup] iCloud/File backup failed:', error);
      throw error;
    }
  }

  /**
   * Auto-backup to all connected providers
   */
  async autoBackup() {
    const data = await window.DB.exportAllData();
    const filename = `form-builder-backup-${Date.now()}.json`;
    const results = [];

    if (this.providers.googleDrive.connected) {
      try {
        await this.backupToGoogleDrive(data, filename);
        results.push({ provider: 'Google Drive', success: true });
      } catch (error) {
        results.push({ provider: 'Google Drive', success: false, error: error.message });
      }
    }

    if (this.providers.dropbox.connected) {
      try {
        await this.backupToDropbox(data, filename);
        results.push({ provider: 'Dropbox', success: true });
      } catch (error) {
        results.push({ provider: 'Dropbox', success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Disconnect from a provider
   */
  disconnect(provider) {
    if (this.providers[provider]) {
      this.providers[provider].connected = false;
      this.providers[provider].accessToken = null;
      this.saveTokens();
    }
  }

  /**
   * Check connection status
   */
  isConnected(provider) {
    return this.providers[provider]?.connected || false;
  }
}

// Create singleton instance
const cloudBackup = new CloudBackup();

// Export for use in other modules
window.CloudBackup = cloudBackup;
