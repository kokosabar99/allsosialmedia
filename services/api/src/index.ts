import {Hono} from 'hono';
import {cors} from 'hono/cors';
import {neon} from '@neondatabase/serverless';
import {hash,compare} from 'bcryptjs';
import {SignJWT,jwtVerify} from 'jose';
type Env={Bindings:{DATABASE_URL:string;JWT_SECRET:string;FRONTEND_ORIGIN:string;COOKIE_SECURE:string}};
const app=new Hono<Env>();
app.use('*',async(c,next)=>cors({origin:c.env.FRONTEND_ORIGIN||'http://localhost:3000',credentials:true,allowMethods:['GET','POST','DELETE','OPTIONS'],allowHeaders:['Content-Type']})(c,next));
const db=(c:any)=>neon(c.env.DATABASE_URL);
const key=(c:any)=>new TextEncoder().encode(c.env.JWT_SECRET);
const cookieName='px_session';
const cookie=(c:any,token:string,maxAge:number)=>`${cookieName}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${c.env.COOKIE_SECURE==='true'?'; Secure':''}`;
const emailValid=(s:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
function validUrl(raw:string){try{const u=new URL(raw);if(!['https:','http:'].includes(u.protocol))return null;if(!u.hostname||u.username||u.password)return null;return u.toString()}catch{return null}}
async function currentUser(c:any){const raw=c.req.header('Cookie')||'';const token=raw.split(';').map((s:string)=>s.trim()).find((s:string)=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);if(!token)return null;try{const {payload}=await jwtVerify(token,key(c),{issuer:'project-x'});if(!payload.sub||!payload.sid)return null;const sql=db(c);const rows=await sql`SELECT u.id,u.name,u.email,u.role FROM users u JOIN user_sessions s ON s.user_id=u.id WHERE u.id=${payload.sub} AND s.id=${payload.sid as string} AND s.revoked_at IS NULL AND s.expires_at>now() AND u.status='active' LIMIT 1`;return rows[0]||null}catch{return null}}
async function createSession(c:any,userId:string){const sql=db(c);const rows=await sql`INSERT INTO user_sessions(user_id,expires_at) VALUES(${userId},now()+interval '7 days') RETURNING id`;const token=await new SignJWT({sid:rows[0].id}).setProtectedHeader({alg:'HS256'}).setSubject(userId).setIssuer('project-x').setIssuedAt().setExpirationTime('7d').sign(key(c));c.header('Set-Cookie',cookie(c,token,604800))}
app.get('/health',c=>c.json({ok:true,app:'PROJECT X API',version:'0.1.0'}));
app.post('/auth/register',async c=>{try{const body=await c.req.json();const name=String(body.name||'').trim(),email=String(body.email||'').trim().toLowerCase(),password=String(body.password||'');if(name.length<2||name.length>100||email.length>254||!emailValid(email)||password.length<12||password.length>128)return c.json({error:'Periksa nama, email, dan password (12–128 karakter).'},400);const sql=db(c);const existing=await sql`SELECT id FROM users WHERE email=${email} LIMIT 1`;if(existing.length)return c.json({error:'Email sudah terdaftar.'},409);const hashed=await hash(password,12);const rows=await sql`INSERT INTO users(name,email,password_hash) VALUES(${name},${email},${hashed}) RETURNING id,name,email,role`;await createSession(c,rows[0].id);return c.json({user:rows[0]},201)}catch(e){if(String(e).includes('unique'))return c.json({error:'Email sudah terdaftar.'},409);console.error('register failed');return c.json({error:'Registrasi gagal. Periksa konfigurasi database.'},500)}});
app.post('/auth/login',async c=>{try{const body=await c.req.json();const email=String(body.email||'').trim().toLowerCase(),password=String(body.password||'');if(!email||!password||password.length>128)return c.json({error:'Email atau password tidak valid.'},401);const sql=db(c);const rows=await sql`SELECT id,name,email,role,password_hash FROM users WHERE (email=${email} OR username=${email}) AND status='active' LIMIT 1`;if(!rows.length||!await compare(password,rows[0].password_hash))return c.json({error:'Email atau password tidak valid.'},401);await createSession(c,rows[0].id);return c.json({user:{id:rows[0].id,name:rows[0].name,email:rows[0].email,role:rows[0].role}})}catch{console.error('login failed');return c.json({error:'Login gagal. Periksa konfigurasi server.'},500)}});
app.get('/auth/me',async c=>{const user=await currentUser(c);return user?c.json({user}):c.json({error:'Belum login'},401)});
app.post('/auth/logout',async c=>{const raw=c.req.header('Cookie')||'';const token=raw.split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);if(token){try{const {payload}=await jwtVerify(token,key(c),{issuer:'project-x'});if(payload.sid){const sql=db(c);await sql`UPDATE user_sessions SET revoked_at=now() WHERE id=${payload.sid as string} AND user_id=${payload.sub as string}`}}catch{}}c.header('Set-Cookie',cookie(c,'',0));return c.json({ok:true})});
app.get('/links',async c=>{const user=await currentUser(c);if(!user)return c.json({error:'Belum login'},401);const sql=db(c);const links=await sql`SELECT id,title,url,created_at FROM website_links WHERE user_id=${user.id} ORDER BY created_at DESC LIMIT 500`;return c.json({links})});
app.post('/links',async c=>{const user=await currentUser(c);if(!user)return c.json({error:'Belum login'},401);const body=await c.req.json().catch(()=>({}));const title=String(body.title||'').trim(),url=validUrl(String(body.url||''));if(!title||title.length>100||!url||url.length>2048)return c.json({error:'Nama atau URL tidak valid. Gunakan http/https.'},400);const sql=db(c);const rows=await sql`INSERT INTO website_links(user_id,title,url) VALUES(${user.id},${title},${url}) RETURNING id,title,url,created_at`;return c.json({link:rows[0]},201)});
app.delete('/links/:id',async c=>{const user=await currentUser(c);if(!user)return c.json({error:'Belum login'},401);const id=c.req.param('id');if(!/^[0-9a-f-]{36}$/i.test(id))return c.json({error:'ID tidak valid'},400);const sql=db(c);const rows=await sql`DELETE FROM website_links WHERE id=${id} AND user_id=${user.id} RETURNING id`;return rows.length?c.json({ok:true}):c.json({error:'Tautan tidak ditemukan'},404)});

// Provider connection registry: statuses are read from Neon, never fabricated.
const providerIds=['whatsapp','whatsapp_business','facebook','messenger','instagram','tiktok','telegram','line','wechat','sms','gmail','gallery','music','website'] as const;
app.get('/integrations',async c=>{
 const user=await currentUser(c);if(!user)return c.json({error:'Belum login'},401);
 const sql=db(c);
 const rows=await sql`SELECT ca.id,ca.platform_id,ca.display_name,ca.status,ca.created_at,p.name AS platform_name FROM connected_accounts ca JOIN platforms p ON p.id=ca.platform_id WHERE ca.user_id=${user.id} ORDER BY ca.created_at DESC`;
 return c.json({accounts:rows,providers:providerIds});
});
app.notFound(c=>c.json({error:'Endpoint tidak ditemukan'},404));
app.onError((err,c)=>{console.error(err.message);return c.json({error:'Kesalahan server'},500)});
export default app;
