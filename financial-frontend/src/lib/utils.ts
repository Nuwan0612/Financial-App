import axios from "axios";
import { clsx, type ClassValue } from "clsx"
import { get } from "http"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



const EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest/USD";
 
export const getUsdToLkrRate = async (): Promise<number> => {
  try {
    const response = await axios.get(EXCHANGE_RATE_API);
    
    // The API returns a giant object of rates. We only want LKR.
    const lkrRate = response.data.rates.LKR;
    
    return lkrRate;
  } catch (error) {
    console.error("Failed to fetch USD to LKR exchange rate:", error);
    // Return a safe fallback value just in case the API goes down, 
    // so your application doesn't crash!
    return 300.00; 
  }
};

