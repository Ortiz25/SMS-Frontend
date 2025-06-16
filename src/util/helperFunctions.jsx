
 
 export function extractDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear().toString();

    return `${day}-${month}-${year}`;
}




export async function checkTokenAuth() {
    const token = localStorage.getItem("token");
    if (!token) return { valid: false };
  
    try {
      const res = await fetch("/backend/api/auth/verify-token", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const data = await res.json();
      if (!res.ok || data.error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return { valid: false };
      }
  
      return { valid: true };
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return { valid: false };
    }
  }
  