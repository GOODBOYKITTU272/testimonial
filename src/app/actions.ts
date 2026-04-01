"use server";

export async function fetchApplyWizzClient(applywizzId: string) {
  try {
    const res = await fetch(`https://www.apply-wizz.me/api/get-client-details?applywizz_id=${applywizzId}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) throw new Error(`API returned status: ${res.status}`);
    
    const data = await res.json();
    if (!data || !data.client) throw new Error("Client not found for this ID.");
    
    return data;
  } catch (err: any) {
    throw new Error(err.message || "Failed to securely fetch from API (Proxy Mode).");
  }
}
