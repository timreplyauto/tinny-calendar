// Biometric authentication utilities

export async function isBiometricAvailable(): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    return false
  }

  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    return available
  } catch {
    return false
  }
}

export async function registerBiometric(userId: string, email: string): Promise<boolean> {
  try {
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'TINNY Calendar',
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: email,
          displayName: email,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },  // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
        attestation: 'none',
      },
    }) as PublicKeyCredential

    if (!credential) {
      return false
    }

    // Store credential ID in localStorage
    localStorage.setItem('biometric_credential_id', credential.id)
    localStorage.setItem('biometric_user_id', userId)
    localStorage.setItem('biometric_enabled', 'true')

    return true
  } catch (error) {
    console.error('Biometric registration error:', error)
    return false
  }
}

export async function authenticateWithBiometric(): Promise<boolean> {
  try {
    const credentialId = localStorage.getItem('biometric_credential_id')
    if (!credentialId) {
      return false
    }

    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [
          {
            id: base64ToArrayBuffer(credentialId),
            type: 'public-key',
          },
        ],
        timeout: 60000,
        userVerification: 'required',
      },
    })

    return !!credential
  } catch (error) {
    console.error('Biometric authentication error:', error)
    return false
  }
}

export function isBiometricEnabled(): boolean {
  return localStorage.getItem('biometric_enabled') === 'true'
}

export function disableBiometric(): void {
  localStorage.removeItem('biometric_credential_id')
  localStorage.removeItem('biometric_user_id')
  localStorage.removeItem('biometric_enabled')
}

// Helper functions
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
