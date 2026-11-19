import './styles.css';
export const metadata = { title: 'PROJECT X', description: 'All Social Media — Personal Workspace', applicationName: 'PROJECT X', icons:{icon:'/icon.svg',apple:'/icon.svg'} };
export const viewport = {themeColor:'#141d34',width:'device-width',initialScale:1};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="id"><body>{children}</body></html>}
