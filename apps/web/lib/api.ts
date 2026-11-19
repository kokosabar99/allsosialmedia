export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
export type Account = {id:string; name:string; email:string; role:string};
export async function request(path:string, options:RequestInit={}) {
 const res = await fetch(API+path, {...options,credentials:'include',headers:{'Content-Type':'application/json',...(options.headers||{})}});
 const data = await res.json().catch(()=>({error:'Server tidak merespons dengan JSON'}));
 if(!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
 return data;
}
export const platforms = [
 ['WhatsApp','https://wa.me/','WA'],['WhatsApp Business','https://business.whatsapp.com/','WB'],
 ['Facebook','https://www.facebook.com/','FB'],['Facebook Messenger','https://www.messenger.com/','MS'],
 ['Instagram','https://www.instagram.com/','IG'],['TikTok','https://www.tiktok.com/','TK'],
 ['Telegram','https://web.telegram.org/','TG'],['LINE','https://line.me/','LN'],
 ['WeChat','https://www.wechat.com/','WC'],['SMS','sms:','SMS'],
 ['Email / Gmail','https://mail.google.com/','GM'],['Foto / Galeri','/dashboard?tab=media','PH'],
 ['Lagu / Musik','/dashboard?tab=media','MU'],['Website','/dashboard?tab=links','WEB']
] as const;
