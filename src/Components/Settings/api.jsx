import { getApiKey } from "@/configApi"
import process from "node:process"
const API_URL =  import.meta.env.VITE_API_URL;

export const fetchSettings = async () => {
  try {
    const response = await fetch(`${API_URL}/dbroute`, {
      headers: { 'x-api-key': getApiKey() }
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to fetch settings')
    return data
  } catch (error) {
    throw new Error(error.message)
  }
}

export const setWhatsapp = async (config) => {
  try {
    const response = await fetch(`${API_URL}/dbroute/whatsapp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getApiKey()
      },
      body: JSON.stringify(config)
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to update WhatsApp settings')
    return data
  } catch (error) {
    throw new Error(error.message)
  }
}

export const setEmail = async (config) => {
  try {
    const response = await fetch(`${API_URL}/dbroute/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getApiKey()
      },
      body: JSON.stringify(config)
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to update email settings')
    return data
  } catch (error) {
    throw new Error(error.message)
  }
}