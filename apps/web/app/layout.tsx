import './styles.css';
import PWARegister from './pwa-register';
export const metadata = { title: 'PROJECT X', description: 'All Social Media — Personal Workspace', manifest: '/manifest.webmanifest', applicationName: 'PROJECT X', appleWebApp: {capable:true,title:'PROJECT X',statusBarStyle:'black-translucent'}, icons:{icon:'/icon.svg',apple:'/icon.svg'} };
export const viewport = {themeColor:'#141d34',width:'device-width',initialScale:1};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="id"><body><PWARegister/>{children}</body></html>}
