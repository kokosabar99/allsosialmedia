import app from '../services/api/src/index';
type Env={DATABASE_URL:string;JWT_SECRET:string;FRONTEND_ORIGIN:string;COOKIE_SECURE:string};
export const onRequest:PagesFunction<Env>=async context=>{
 const u=new URL(context.request.url);
 u.pathname=u.pathname.replace(/^\/api(?=\/|$)/,'')||'/';
 const req=new Request(u.toString(),context.request);
 return app.fetch(req,{...context.env,FRONTEND_ORIGIN:u.origin,COOKIE_SECURE:'true'},context);
};
